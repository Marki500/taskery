'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Loader2, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Comment,
    createComment,
    deleteComment
} from '@/app/(dashboard)/projects/comment-actions'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CommentListProps {
    taskId: string
    initialComments: Comment[]
    currentUserId: string
    onUpdate?: () => void
}

export function CommentList({ taskId, initialComments, currentUserId, onUpdate }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setIsSubmitting(true)
        const result = await createComment(taskId, newComment)
        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        if (result.comment) {
            setComments([...comments, result.comment])
            setNewComment('')
            onUpdate?.()
        }
    }

    const handleDelete = async (commentId: string) => {
        const result = await deleteComment(commentId)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setComments(comments.filter(c => c.id !== commentId))
        toast.success('Comentario eliminado')
        onUpdate?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="space-y-4">
            {/* Comments list */}
            {comments.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {comments.map((comment) => {
                        const isOwn = comment.userId === currentUserId
                        const displayName = comment.userName || comment.userEmail?.split('@')[0] || 'Usuario'
                        const initial = displayName[0]?.toUpperCase() || 'U'

                        return (
                            <div
                                key={comment.id}
                                className={cn(
                                    "flex gap-3 p-3 rounded-xl transition-colors group",
                                    isOwn ? "bg-primary/5" : "bg-muted/30"
                                )}
                            >
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={comment.userAvatar || undefined} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {initial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium truncate">
                                            {displayName}
                                            {isOwn && <span className="text-xs text-muted-foreground ml-1">(tú)</span>}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), {
                                                addSuffix: true,
                                                locale: es
                                            })}
                                        </span>
                                        {isOwn && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay comentarios aún</p>
                </div>
            )}

            {/* New comment input */}
            <div className="flex gap-2">
                <Textarea
                    placeholder="Escribe un comentario... (Enter para enviar)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[80px] resize-none text-sm"
                    disabled={isSubmitting}
                />
            </div>
            <div className="flex justify-end">
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Comentar'}
                </Button>
            </div>
        </div>
    )
}

/**
 * Compact comment count indicator for task cards
 */
interface CommentCountProps {
    count: number
}

export function CommentCount({ count }: CommentCountProps) {
    if (count === 0) return null

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{count}</span>
        </div>
    )
}
