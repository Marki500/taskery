'use client'

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Play, Clock, CalendarIcon, Pencil } from "lucide-react"
import { useTimer, formatTime } from "@/contexts/timer-context"
import { Button } from "@/components/ui/button"
import { TaskSidebar } from "./task-sidebar"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"

export type Task = {
    id: string
    title: string
    description?: string | null
    columnId: string
    tag?: string
    projectId?: string
    totalTime?: number  // Accumulated time in seconds from time_entries
    deadline?: string | null  // ISO date string for deadline
    assignedTo?: string | null // User ID of assigned person
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

// Get deadline display info with urgency colors
function getDeadlineInfo(deadline: string | null | undefined) {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysUntil = differenceInDays(deadlineDate, now)

    let color = "text-muted-foreground"
    let bgColor = "bg-muted/50"
    let label = format(deadlineDate, "d MMM", { locale: es })

    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
        color = "text-red-600"
        bgColor = "bg-red-100 dark:bg-red-900/30"
        label = "Vencida"
    } else if (isToday(deadlineDate)) {
        color = "text-orange-600"
        bgColor = "bg-orange-100 dark:bg-orange-900/30"
        label = "Hoy"
    } else if (isTomorrow(deadlineDate)) {
        color = "text-amber-600"
        bgColor = "bg-amber-100 dark:bg-amber-900/30"
        label = "Mañana"
    } else if (daysUntil <= 3) {
        color = "text-yellow-600"
        bgColor = "bg-yellow-100 dark:bg-yellow-900/30"
    }

    return { color, bgColor, label }
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
    const { startTimer, activeTask, elapsedSeconds } = useTimer()
    const isTimerActive = activeTask?.id === task.id
    const deadlineInfo = getDeadlineInfo(task.deadline)

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
                        {/* Edit Button - Opens Sidebar */}
                        <TaskSidebar
                            task={task}
                            onTaskUpdated={onTaskUpdated}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            }
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

                {/* Deadline Display */}
                {deadlineInfo && (
                    <div className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium",
                        deadlineInfo.bgColor,
                        deadlineInfo.color
                    )}>
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{deadlineInfo.label}</span>
                    </div>
                )}

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
