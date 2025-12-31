'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ProductivityChartProps {
    data: any[]
}

export function ProductivityChart({ data }: ProductivityChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:ring-indigo-500/30 transition-all duration-300 dark:shadow-[0_0_30px_-10px_rgba(99,102,241,0.1)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <span className="text-slate-700 dark:text-slate-200">Rendimiento Semanal</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                                </linearGradient>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="currentColor"
                                className="text-muted-foreground"
                                fontSize={13}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                className="stroke-slate-200 dark:stroke-slate-800"
                                vertical={false}
                                opacity={0.3}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderRadius: '12px',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'hsl(var(--foreground))'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                name="Nuevas"
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="#22c55e"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCompleted)"
                                name="Completadas"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
