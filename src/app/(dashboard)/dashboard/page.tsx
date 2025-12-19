import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { StatsCards } from "@/components/dashboard/widgets/stats-cards"
import { WeeklyChart } from "@/components/dashboard/widgets/weekly-chart"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight">
                    Hola, {user.email?.split('@')[0]} 👋
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                    Aquí tienes el resumen de tu actividad.
                </p>
            </div>

            {/* Stats Row */}
            <StatsCards />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <WeeklyChart />

                {/* Quick Actions Card */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg p-6 col-span-1 border-0">
                    <h3 className="text-xl font-bold leading-none tracking-tight mb-5">Acciones Rápidas</h3>
                    <div className="space-y-4">
                        <a href="/projects" className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 group">
                            <span className="font-semibold text-lg">Ver Proyectos</span>
                            <span className="text-primary text-2xl group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                        <a href="/tracking" className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 group">
                            <span className="font-semibold text-lg">Historial de Tiempo</span>
                            <span className="text-primary text-2xl group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
