'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { getProjectTasks, updateTaskStatus } from '@/app/(dashboard)/projects/actions'
import { toast } from "sonner"
import { NewTaskDialog } from './new-task-dialog'

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
                            tasks={tasks.filter(t => t.columnId === col.id)}
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
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)

                // If they are in different columns, we update the columnId immediately (visual feedback)
                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    tasks[activeIndex].columnId = tasks[overIndex].columnId
                }

                return arrayMove(tasks, activeIndex, overIndex)
            })
        }

        // Drop over an empty column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)

                if (tasks[activeIndex].columnId !== overId) {
                    tasks[activeIndex].columnId = overId as string
                    // Move to the end of the new column (optional, standard arrayMove doesn't apply here as index is relative to whole list)
                    // For simplicity in single list state, we just change columnId. 
                    // To reorder visually inside new column, the map render handles it.
                    return [...tasks]
                }
                return tasks
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

        // Ensure we capture the final state for the moved task
        const task = tasks.find(t => t.id === activeId)

        if (task) {
            // We need to determine the final column. 
            // If dropped on a Column, overId is the columnId.
            // If dropped on a Task, we look up that task's columnId.
            let finalColumnId = overId
            const overTask = tasks.find(t => t.id === overId)
            if (overTask) {
                finalColumnId = overTask.columnId
            }

            // Optimistic update already happened in DragOver for visual smoothness.
            // Now we persist to DB.
            // Check if column actually changed for the active item in our state
            if (task.columnId !== finalColumnId) {
                // This case should ideally represent reordering within same column too, 
                // but for now we focus on status change persistence.
            }

            // Actually, since DragOver mutates 'tasks' state, 'task' object ref might be stale or updated? 
            // React state updates are scheduled. The 'tasks' array in scope is from render start.
            // However, for the DB call, we just need to know where it ended up.
            // Simpler approach: updateTaskStatus(activeId, finalColumnId)

            // Wait, handleDragOver logic creates visual change.
            // We should trust the visual state essentially.

            // Let's perform the server action:
            // Note: DragOver handles visual 'columnId' update on the fly. 
            // The task object inside 'tasks' array has the NEW columnId by the time DragEnd fires?
            // No, DragOver calls setTasks. DragEnd closes the loop.

            // We need to find the task in the *current* tasks state to know its column.
            // Since we can't easily access the "next" state inside the event handler without using a ref or similar,
            // we rely on the logic that determined the visual drop.

            // Robust way: Check if over is a column or task, derive new Status.
            let newStatus = overId
            if (columns.find(c => c.id === overId)) {
                newStatus = overId
            } else {
                const overTaskItem = tasks.find(t => t.id === overId)
                if (overTaskItem) newStatus = overTaskItem.columnId
            }

            // Only update if valid status
            if (['todo', 'in-progress', 'review', 'done'].includes(newStatus)) {
                try {
                    await updateTaskStatus(activeId, newStatus)
                    toast.success("Tarea actualizada")
                } catch (e) {
                    toast.error("Error al guardar cambios")
                }
            }
        }

        setActiveTask(null)
    }
}
