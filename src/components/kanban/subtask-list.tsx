'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Subtask,
    createSubtask,
    toggleSubtask,
    deleteSubtask
} from '@/app/(dashboard)/projects/subtask-actions'
import { toast } from 'sonner'

interface SubtaskListProps {
    taskId: string
    initialSubtasks: Subtask[]
    onUpdate?: () => void
}

export function SubtaskList({ taskId, initialSubtasks, onUpdate }: SubtaskListProps) {
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const completedCount = subtasks.filter(s => s.completed).length
    const totalCount = subtasks.length
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return

        setIsAdding(true)
        const result = await createSubtask(taskId, newSubtaskTitle)
        setIsAdding(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        if (result.subtask) {
            setSubtasks([...subtasks, result.subtask])
            setNewSubtaskTitle('')
            onUpdate?.()
        }
    }

    const handleToggle = async (subtaskId: string) => {
        setLoadingId(subtaskId)
        const result = await toggleSubtask(subtaskId)
        setLoadingId(null)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setSubtasks(subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ))
        onUpdate?.()
    }

    const handleDelete = async (subtaskId: string) => {
        setLoadingId(subtaskId)
        const result = await deleteSubtask(subtaskId)
        setLoadingId(null)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setSubtasks(subtasks.filter(s => s.id !== subtaskId))
        onUpdate?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddSubtask()
        }
    }

    return (
        <div className="space-y-3">
            {/* Progress bar */}
            {totalCount > 0 && (
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progreso</span>
                        <span>{completedCount} de {totalCount} completadas</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1">
                {subtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-lg group hover:bg-muted/50 transition-colors",
                            subtask.completed && "opacity-60"
                        )}
                    >
                        <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => handleToggle(subtask.id)}
                            disabled={loadingId === subtask.id}
                            className="h-4 w-4"
                        />
                        <span className={cn(
                            "flex-1 text-sm",
                            subtask.completed && "line-through text-muted-foreground"
                        )}>
                            {subtask.title}
                        </span>
                        {loadingId === subtask.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={() => handleDelete(subtask.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new subtask */}
            <div className="flex gap-2">
                <Input
                    placeholder="Añadir subtarea..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-8 text-sm"
                    disabled={isAdding}
                />
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddSubtask}
                    disabled={isAdding || !newSubtaskTitle.trim()}
                    className="h-8 px-3"
                >
                    {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}

/**
 * Compact subtask progress indicator for task cards
 */
interface SubtaskProgressProps {
    completed: number
    total: number
}

export function SubtaskProgress({ completed, total }: SubtaskProgressProps) {
    if (total === 0) return null

    const allComplete = completed === total

    return (
        <div className={cn(
            "flex items-center gap-1.5 text-xs",
            allComplete ? "text-green-600" : "text-muted-foreground"
        )}>
            <div className={cn(
                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                allComplete
                    ? "border-green-600 bg-green-100 dark:bg-green-900/30"
                    : "border-muted-foreground/30"
            )}>
                {allComplete && (
                    <svg className="h-2.5 w-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span>{completed}/{total}</span>
        </div>
    )
}
