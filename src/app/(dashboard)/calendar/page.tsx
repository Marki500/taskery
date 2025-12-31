import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getCalendarTasks } from "./actions"
import { CalendarView } from "@/components/calendar/calendar-view"

export default async function CalendarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const tasks = await getCalendarTasks()

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-indigo-500/30 shadow-2xl shadow-indigo-100/20 dark:shadow-indigo-500/10 relative overflow-hidden">
                {/* Ambient Neon Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">Calendario</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Vista de tareas por <span className="text-purple-600 dark:text-purple-400 font-bold">línea temporal</span></p>
                </div>
            </div>

            <CalendarView tasks={tasks} />
        </div>
    )
}
