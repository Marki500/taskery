'use client'

// Kanban Board Component
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './column'
import { Task, TaskCard } from './task-card'
import { getProjectTasks, updateTaskStatus, moveTask } from '@/app/(dashboard)/projects/actions'
import { toast } from "sonner"
import { NewTaskDialog } from './new-task-dialog'
import { useTimer } from '@/contexts/timer-context'

type ColumnDef = {
    id: string
    title: string
    color: string
}

const columns: ColumnDef[] = [
    { id: 'todo', title: 'Por hacer', color: 'bg-yellow-500' },
    { id: 'in-progress', title: 'En curso', color: 'bg-blue-500' },
    { id: 'review', title: 'Revisión', color: 'bg-purple-500' },
    { id: 'done', title: 'Completado', color: 'bg-green-500' },
]

export function KanbanBoard({ projectId }: { projectId: string }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { lastStoppedTask } = useTimer()

    const loadTasks = useCallback(async () => {
        try {
            const fetchedTasks = await getProjectTasks(projectId)
            setTasks(fetchedTasks)
        } catch (error) {
            toast.error("Error al cargar las tareas")
        } finally {
            setIsLoading(false)
        }
    }, [projectId])

    useEffect(() => {
        loadTasks()
    }, [loadTasks])

    // Update task time when timer stops (without page reload)
    useEffect(() => {
        if (lastStoppedTask) {
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === lastStoppedTask.taskId
                        ? { ...task, totalTime: lastStoppedTask.newTotalTime }
                        : task
                )
            )
        }
    }, [lastStoppedTask])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Memoize tasks by column to avoid O(N) filtering in every render for each column
    const tasksByColumn = useMemo(() => {
        const grouped: Record<string, Task[]> = {
            'todo': [],
            'in-progress': [],
            'review': [],
            'done': []
        }

        tasks.forEach(task => {
            if (grouped[task.columnId]) {
                grouped[task.columnId].push(task)
            } else {
                // Handle tasks with invalid/unknown columnIds by putting them in todo or ignoring
                // For now, let's put them in todo as fallback if valid status
                if (!grouped['todo']) grouped['todo'] = []
                // Or just ignore if we want strictness
                // grouped['todo'].push(task)
            }
        })
        return grouped
    }, [tasks])

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground animate-pulse">Cargando tablero...</div>
    }

    return (
        <div className="h-full flex flex-col">
            {/* Board Toolbar */}
            <div className="mb-4 flex gap-2">
                <NewTaskDialog projectId={projectId} onTaskCreated={loadTasks} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full w-full gap-4 items-start overflow-x-auto pb-4">
                    {columns.map(col => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            tasks={tasksByColumn[col.id] || []}
                            color={col.color}
                            onTaskUpdated={loadTasks}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveTask = active.data.current?.type === "Task"
        const isOverTask = over.data.current?.type === "Task"
        const isOverColumn = over.data.current?.type === "Column"

        if (!isActiveTask) return

        // Drop over another task
        if (isActiveTask && isOverTask) {
            setTasks((prevTasks) => {
                const activeIndex = prevTasks.findIndex((t) => t.id === activeId)
                const overIndex = prevTasks.findIndex((t) => t.id === overId)

                // Create a shallow copy of the tasks array
                const newTasks = [...prevTasks]

                // If they are in different columns, update the columnId
                if (newTasks[activeIndex].columnId !== newTasks[overIndex].columnId) {
                    // Create a copy of the task to avoid direct mutation
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: newTasks[overIndex].columnId
                    }
                }

                return arrayMove(newTasks, activeIndex, overIndex)
            })
        }

        // Drop over an empty column
        if (isActiveTask && isOverColumn) {
            setTasks((prevTasks) => {
                const activeIndex = prevTasks.findIndex((t) => t.id === activeId)

                if (prevTasks[activeIndex].columnId !== overId) {
                    const newTasks = [...prevTasks]
                    // Create a copy of the task
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        columnId: overId as string
                    }
                    return newTasks
                }
                return prevTasks
            })
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over) {
            setActiveTask(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        // Find the task in the *current* state (which might have been updated by DragOver)
        const task = tasks.find(t => t.id === activeId)

        if (task) {
            // Determine the intended destination status logic
            // (Note: DragOver has likely already visually moved it, but we confirm logic here)
            let newStatus = overId

            // If dropping on a column directly
            if (columns.find(c => c.id === overId)) {
                newStatus = overId
            }
            // If dropping on a task
            else {
                const overTaskItem = tasks.find(t => t.id === overId)
                if (overTaskItem) {
                    newStatus = overTaskItem.columnId
                }
            }

            // Perform server update
            // We use the derived newStatus to be sure, although visuals are already optimistic
            if (['todo', 'in-progress', 'review', 'done'].includes(newStatus)) {
                try {
                    // Only call API if we suspect a change or just to enforce consistency
                    // Optimistic update handled by DragOver looks good, this saves it.
                    // We pass 0 as index for now since we don't persist order yet
                    await moveTask(activeId, newStatus, 0)
                    // No toast success needed for every drag, acts as background sync
                } catch (e) {
                    toast.error("Error al guardar cambios")
                    // If error, reload tasks to revert to server state
                    loadTasks()
                }
            }
        }

        setActiveTask(null)
    }
}
