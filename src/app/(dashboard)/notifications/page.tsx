import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getNotifications, getUnreadNotificationsCount, markAllNotificationsRead } from "./actions"
import { NotificationsList } from "./notifications-list"
import { Button } from "@/components/ui/button"
import { CheckCheck } from "lucide-react"

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const notifications = await getNotifications(50) // Fetch last 50
    const unreadCount = await getUnreadNotificationsCount()

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-indigo-500/30 shadow-2xl shadow-indigo-100/20 dark:shadow-indigo-500/10 relative overflow-hidden">
                {/* Ambient Neon Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">Notificaciones</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Tienes <span className="text-indigo-600 dark:text-indigo-400 font-bold">{unreadCount}</span> notificaciones sin leer
                    </p>
                </div>

                {unreadCount > 0 && (
                    <form action={async () => {
                        'use server'
                        await markAllNotificationsRead()
                    }}>
                        <Button
                            variant="outline"
                            className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marcar todo como leído
                        </Button>
                    </form>
                )}
            </div>

            <NotificationsList initialNotifications={notifications} />
        </div>
    )
}
