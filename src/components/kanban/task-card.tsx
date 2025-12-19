'use client'

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Play, Timer, Clock } from "lucide-react"
import { useTimer, formatTime } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"
import { EditTaskDialog } from "./edit-task-dialog"
import { updateTask, deleteTask } from "@/app/(dashboard)/projects/actions"
import { cn } from "@/lib/utils"

export type Task = {
    id: string
    title: string
    columnId: string
    tag?: string
    projectId?: string
    totalTime?: number  // Accumulated time in seconds from time_entries
}

interface TaskCardProps {
    task: Task
    onTaskUpdated?: () => void
}

// Color mapping for left border based on column status
const columnColors: Record<string, string> = {
    'todo': 'border-l-yellow-500',
    'in-progress': 'border-l-blue-500',
    'review': 'border-l-purple-500',
    'done': 'border-l-green-500',
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
    const { startTimer, activeTask, elapsedSeconds } = useTimer()
    const isTimerActive = activeTask?.id === task.id

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    const handleStartTimer = (e: React.MouseEvent) => {
        e.stopPropagation()
        startTimer({
            id: task.id,
            title: task.title,
            projectId: task.projectId || 'unknown',
            totalTime: task.totalTime || 0
        })
    }

    const handleSave = async (id: string, title: string, tag?: string) => {
        await updateTask(id, title, tag)
        onTaskUpdated?.()
    }

    const handleDelete = async (id: string) => {
        await deleteTask(id)
        onTaskUpdated?.()
    }

    const leftBorderColor = columnColors[task.columnId] || 'border-l-muted'

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-muted/50 border-2 border-dashed border-primary/50 rounded-xl h-[140px]"
            />
        )
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group touch-none rounded-xl overflow-hidden",
                "border-l-4",
                leftBorderColor,
                isTimerActive
                    ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'hover:ring-1 hover:ring-primary/20'
            )}
        >
            <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <span className="text-lg font-bold leading-snug line-clamp-3 text-card-foreground/90 flex-1">
                        {task.title}
                    </span>
                    <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <EditTaskDialog
                            task={task}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />

                        {/* Timer Button */}
                        {!isTimerActive && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 hover:bg-indigo-200 text-indigo-600"
                                onClick={handleStartTimer}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <Play className="h-4 w-4" />
                            </Button>
                        )}

                        {/* Drag Handle */}
                        <button className="text-muted-foreground/20 group-hover:text-muted-foreground transition-colors cursor-grab p-1 hover:bg-muted rounded">
                            <GripVertical className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Time Display - Always visible */}
                <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-colors",
                    isTimerActive
                        ? "bg-indigo-100 dark:bg-indigo-900/50"
                        : "bg-muted/50"
                )}>
                    <Clock className={cn(
                        "h-4 w-4",
                        isTimerActive ? "text-indigo-600 animate-pulse" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                        "text-sm font-bold font-mono",
                        isTimerActive ? "text-indigo-600" : "text-muted-foreground"
                    )}>
                        {isTimerActive
                            ? formatTime((task.totalTime || 0) + elapsedSeconds)
                            : formatTime(task.totalTime || 0)}
                    </span>
                    {isTimerActive && (
                        <span className="text-xs text-indigo-500 ml-auto">En curso</span>
                    )}
                </div>

                {/* Tag Badge */}
                {task.tag && (
                    <Badge variant="secondary" className="text-xs px-2.5 py-1 font-semibold rounded-md uppercase tracking-wider bg-secondary/80">
                        {task.tag}
                    </Badge>
                )}
            </CardContent>
        </Card>
    )
}
