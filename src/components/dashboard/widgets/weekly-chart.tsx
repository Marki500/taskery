"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { TrendingUp } from "lucide-react"

const data = [
    { name: "Lun", total: 4 },
    { name: "Mar", total: 3 },
    { name: "Mié", total: 7 },
    { name: "Jue", total: 5 },
    { name: "Vie", total: 9 },
    { name: "Sáb", total: 2 },
    { name: "Dom", total: 0 },
]

export function WeeklyChart() {
    return (
        <Card className="col-span-1 md:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Productividad Semanal</CardTitle>
                        <p className="text-muted-foreground mt-1">Tareas completadas por día</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">+23%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-2 pt-4">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={14}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={14}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                fontSize: "14px",
                                padding: "12px 16px"
                            }}
                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            formatter={(value) => [`${value} tareas`, '']}
                            labelFormatter={(label) => `${label}`}
                        />
                        <Bar
                            dataKey="total"
                            fill="url(#barGradient)"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
