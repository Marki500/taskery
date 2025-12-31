'use client'

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, FolderKanban, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

interface MetricCardsProps {
    projects: number
    pending: number
    completed: number
}

export function MetricCards({ projects, pending, completed }: MetricCardsProps) {
    const metrics = [
        {
            label: "Proyectos Activos",
            value: projects,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            trend: "+2 this week"
        },
        {
            label: "Completadas",
            value: completed,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/30",
            trend: "+15% vs last week"
        },
        {
            label: "Pendientes",
            value: pending,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/30",
            trend: "-5 remaining"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, i) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-800 hover:ring-indigo-500/50 dark:hover:ring-indigo-500/50 overflow-hidden relative group transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color} ring-1 ring-inset ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]`}>
                                    <metric.icon className="h-6 w-6" />
                                </div>
                                <span className="flex items-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-2.5 py-1 rounded-full">
                                    {metric.trend} <ArrowUpRight className="h-3 w-3 ml-1" />
                                </span>
                            </div>
                            <div>
                                <h3 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                                    {metric.value}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {metric.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
