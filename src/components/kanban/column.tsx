'use client'

import React from 'react'
import { SortableContext } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Task, TaskCard } from "./task-card"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
    id: string
    title: string
    tasks: Task[]
    color?: string
    onTaskUpdated?: () => void
}

const colorMap: Record<string, { bg: string, dot: string, badge: string }> = {
    'bg-yellow-500': { bg: 'bg-yellow-50 dark:bg-yellow-950/30', dot: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' },
    'bg-blue-500': { bg: 'bg-blue-50 dark:bg-blue-950/30', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' },
    'bg-purple-500': { bg: 'bg-purple-50 dark:bg-purple-950/30', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' },
    'bg-green-500': { bg: 'bg-green-50 dark:bg-green-950/30', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' },
}

function KanbanColumnComponent({ id, title, tasks, color = "bg-muted/50", onTaskUpdated }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: "Column",
            columnId: id,
        },
    })

    const taskIds = React.useMemo(() => tasks.map(t => t.id), [tasks])
    const colorScheme = colorMap[color] || { bg: 'bg-muted/30', dot: 'bg-muted', badge: 'bg-muted text-muted-foreground' }

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col flex-1 min-w-[360px] shrink-0 gap-3"
        >
            {/* Column Header */}
            <div className={cn(
                "flex items-center justify-between p-5 rounded-2xl transition-all shadow-sm border border-transparent hover:border-border/50",
                colorScheme.bg
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full shadow-sm ring-2 ring-white/50", colorScheme.dot)} />
                    <h3 className="font-extrabold text-[17px] tracking-tight uppercase text-foreground/80">
                        {title}
                    </h3>
                </div>
                <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full shadow-sm",
                    colorScheme.badge
                )}>
                    {tasks.length}
                </span>
            </div>

            {/* Task List */}
            <div className={cn(
                "flex-1 rounded-2xl p-2 transition-all min-h-[500px]",
                isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : "bg-muted/10"
            )}>
                <SortableContext items={taskIds}>
                    <div className="flex flex-col gap-3 pb-4">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} onTaskUpdated={onTaskUpdated} />
                        ))}
                    </div>
                </SortableContext>

                {tasks.length === 0 && (
                    <div className={cn(
                        "h-[150px] flex flex-col gap-2 items-center justify-center text-muted-foreground/40 border-2 border-dashed rounded-xl m-2 transition-colors",
                        isOver ? "border-primary/50 text-primary/50" : "border-muted-foreground/10"
                    )}>
                        <span className="text-sm font-medium">Vacío</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export const KanbanColumn = React.memo(KanbanColumnComponent)
