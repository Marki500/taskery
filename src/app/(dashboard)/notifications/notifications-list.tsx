'use client'

import { useState } from 'react'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Notification, markNotificationRead, deleteNotification } from '@/app/(dashboard)/notifications/actions'
import { Button } from '@/components/ui/button'
import { Check, CheckCheck, Loader2, Mail, Trash2, UserPlus, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const typeIcons: Record<string, typeof Bell> = {
    invitation: UserPlus,
    task_assigned: Check,
    default: Bell,
}

interface NotificationsListProps {
    initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
    const router = useRouter()

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await markNotificationRead(id)
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
        )
        router.refresh()
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setNotifications(prev => prev.filter(n => n.id !== id))
        await deleteNotification(id)
        router.refresh()
    }

    const handleClick = (notification: Notification) => {
        if (!notification.readAt) {
            handleMarkRead(notification.id, { stopPropagation: () => { } } as React.MouseEvent)
        }
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const groupedNotifications = notifications.reduce((acc, notification) => {
        const date = new Date(notification.createdAt)
        let key = 'Anteriores'

        if (isToday(date)) {
            key = 'Hoy'
        } else if (isYesterday(date)) {
            key = 'Ayer'
        }

        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(notification)
        return acc
    }, {} as Record<string, Notification[]>)

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No tienes notificaciones</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                    Te avisaremos cuando haya actividad importante en tus proyectos.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {['Hoy', 'Ayer', 'Anteriores'].map((group) => {
                const groupNotifications = groupedNotifications[group]
                if (!groupNotifications?.length) return null

                return (
                    <div key={group} className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                            {group}
                        </h3>
                        <div className="space-y-2">
                            {groupNotifications.map((notification) => {
                                const Icon = typeIcons[notification.type] || typeIcons.default
                                const isUnread = !notification.readAt

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleClick(notification)}
                                        className={cn(
                                            "group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                            isUnread
                                                ? "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-500/20 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/40"
                                                : "bg-slate-50/50 dark:bg-slate-900/50 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                                            notification.type === 'invitation'
                                                ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400"
                                                : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-base", isUnread ? "font-semibold text-slate-900 dark:text-slate-100" : "font-medium text-slate-700 dark:text-slate-300")}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: es
                                                    })}
                                                </span>
                                            </div>

                                            {notification.message && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 pl-2 rounded-l-lg shadow-[--10px_0_10px_white] dark:shadow-none">
                                            {isUnread && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                                                    title="Marcar como leído"
                                                    onClick={(e) => handleMarkRead(notification.id, e)}
                                                >
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                title="Eliminar"
                                                onClick={(e) => handleDelete(notification.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {isUnread && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
