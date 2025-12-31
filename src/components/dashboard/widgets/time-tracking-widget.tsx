'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface TimeTrackingWidgetProps {
    totalHours: number
}

export function TimeTrackingWidget({ totalHours }: TimeTrackingWidgetProps) {
    // Convert decimal hours to HH:MM format
    const hours = Math.floor(totalHours)
    const minutes = Math.round((totalHours - hours) * 60)
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-800/80 h-full ring-1 ring-indigo-100 dark:ring-indigo-500/30 dark:shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)] relative overflow-hidden">
                {/* Subtle Glow Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl -z-10 translate-x-10 -translate-y-10" />

                <CardHeader className="pb-3 relative z-10">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-200">Tiempo Semanal</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="space-y-4">
                        <div>
                            <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tighter font-mono dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] tabular-nums">
                                {formattedTime}
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                Tiempo total trackeado
                            </p>
                        </div>

                        {totalHours > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full font-semibold">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Productivo</span>
                                </div>
                            </div>
                        )}

                        {totalHours === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                Empieza a trackear tiempo en tus tareas para ver estadísticas aquí
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
