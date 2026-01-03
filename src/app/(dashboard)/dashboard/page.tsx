import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardStats } from "./actions"
import { GreetingWidget } from "@/components/dashboard/widgets/greeting-widget"
import { MetricCards } from "@/components/dashboard/widgets/metric-cards"
import { ProductivityChart } from "@/components/dashboard/widgets/productivity-chart"
import { FocusList } from "@/components/dashboard/widgets/focus-list"
import { TaskDistributionChart } from "@/components/dashboard/widgets/task-distribution-chart"
import { TimeTrackingWidget } from "@/components/dashboard/widgets/time-tracking-widget"
import { DashboardActivityWrapper } from "@/components/dashboard/widgets/dashboard-activity-wrapper"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const stats = await getDashboardStats()

    // Fallback if stats fail
    if (!stats) {
        return <div className="p-8">Cargando estadísticas...</div>
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.03),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.03),transparent_50%)]" />

            {/* 1. Greeting Section */}
            <GreetingWidget
                userName={user.email?.split('@')[0] || 'Usuario'}
                pendingCount={stats.pendingTasks}
                productivityScore={stats.productivityScore}
            />

            {/* 2. Key Metrics Row */}
            <MetricCards
                projects={stats.totalProjects}
                pending={stats.pendingTasks}
                completed={stats.completedTasks}
            />

            {/* 3. Main Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart takes 2 columns */}
                <div className="lg:col-span-2">
                    <ProductivityChart data={stats.weeklyActivity} />
                </div>

                {/* Focus List takes 1 column */}
                <div className="lg:col-span-1 min-h-[400px]">
                    <FocusList tasks={stats.upcomingDeadlines} />
                </div>
            </div>

            {/* 4. Secondary Grid - Dist & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-6">
                    <TaskDistributionChart data={stats.tasksByStatus} />
                    <TimeTrackingWidget totalHours={stats.totalHoursThisWeek} />
                </div>

                {/* 5. Activity Feed */}
                <div className="h-[500px]">
                    {/* We need a workspace ID for the feed. For now we use the first one found or empty */}
                    <DashboardActivityWrapper userId={user.id} />
                </div>
            </div>
        </div>
    )
}

