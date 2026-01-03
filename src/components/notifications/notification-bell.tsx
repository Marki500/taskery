'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Loader2, Mail, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    getNotifications,
    getUnreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    Notification
} from '@/app/(dashboard)/notifications/actions'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const typeIcons: Record<string, typeof Bell> = {
    invitation: UserPlus,
    task_assigned: Check,
    default: Bell,
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const loadNotifications = async () => {
        const [notifs, count] = await Promise.all([
            getNotifications(10),
            getUnreadNotificationsCount()
        ])
        setNotifications(notifs)
        setUnreadCount(count)
        setIsLoading(false)
    }

    useEffect(() => {
        loadNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.readAt) {
            await markNotificationRead(notification.id)
            setUnreadCount(prev => Math.max(0, prev - 1))
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n)
            )
        }

        if (notification.link) {
            setIsOpen(false)
            router.push(notification.link)
        }
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead()
        setUnreadCount(0)
        setNotifications(prev =>
            prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
        )
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 p-0"
                sideOffset={8}
            >
                <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs px-2 hover:bg-muted"
                                onClick={handleMarkAllRead}
                                title="Marcar todo como leído"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 hover:bg-muted"
                            onClick={() => {
                                setIsOpen(false)
                                router.push('/notifications')
                            }}
                            title="Ver historial completo"
                        >
                            <Mail className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No tienes notificaciones</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const Icon = typeIcons[notification.type] || typeIcons.default
                            const isUnread = !notification.readAt

                            return (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "w-full text-left p-3 hover:bg-muted/50 transition-colors border-b last:border-0 flex gap-3",
                                        isUnread && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                                        notification.type === 'invitation'
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                            : "bg-muted"
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm truncate",
                                            isUnread && "font-medium"
                                        )}>
                                            {notification.title}
                                        </p>
                                        {notification.message && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), {
                                                addSuffix: true,
                                                locale: es
                                            })}
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
