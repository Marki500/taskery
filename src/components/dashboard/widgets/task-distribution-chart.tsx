'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface TaskDistributionChartProps {
    data: {
        todo: number
        inProgress: number
        review: number
        done: number
    }
}

const COLORS = {
    todo: '#eab308',      // yellow-500
    inProgress: '#3b82f6', // blue-500
    review: '#a855f7',     // purple-500
    done: '#22c55e'        // green-500
}

const STATUS_LABELS = {
    todo: 'Por Hacer',
    inProgress: 'En Curso',
    review: 'Revisión',
    done: 'Completadas'
}

export function TaskDistributionChart({ data }: TaskDistributionChartProps) {
    const chartData = [
        { name: STATUS_LABELS.todo, value: data.todo, color: COLORS.todo },
        { name: STATUS_LABELS.inProgress, value: data.inProgress, color: COLORS.inProgress },
        { name: STATUS_LABELS.review, value: data.review, color: COLORS.review },
        { name: STATUS_LABELS.done, value: data.done, color: COLORS.done },
    ].filter(item => item.value > 0) // Only show statuses with tasks

    const total = data.todo + data.inProgress + data.review + data.done

    if (total === 0) {
        return (
            <Card className="border-0 shadow-lg h-full">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Distribución de Tareas</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
                    No hay tareas para mostrar
                </CardContent>
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="border-0 shadow-2xl h-full bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 dark:hover:ring-indigo-500/30 transition-all duration-300 dark:shadow-[0_0_30px_-10px_rgba(168,85,247,0.1)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <span className="text-slate-700 dark:text-slate-200">Distribución de Tareas</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {total}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Tareas
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '12px',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: 'hsl(var(--foreground))'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry: any) => {
                                    const percentage = ((entry.payload.value / total) * 100).toFixed(0)
                                    return <span className="text-slate-600 dark:text-slate-300 ml-1">{value} ({percentage}%)</span>
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card >
        </motion.div >
    )
}
