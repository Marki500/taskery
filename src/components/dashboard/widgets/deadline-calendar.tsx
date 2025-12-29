'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTasksWithDeadlines, TaskWithDeadline } from "@/app/(dashboard)/dashboard/actions"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    isToday,
    isPast
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

const statusColors: Record<string, string> = {
    'todo': 'bg-yellow-500',
    'in-progress': 'bg-blue-500',
    'review': 'bg-purple-500',
    'done': 'bg-green-500',
}

const statusTopBorderColors: Record<string, string> = {
    'todo': 'border-t-yellow-500',
    'in-progress': 'border-t-blue-500',
    'review': 'border-t-purple-500',
    'done': 'border-t-green-500',
}

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function DeadlineCalendar() {
    const [tasks, setTasks] = useState<TaskWithDeadline[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTasks() {
            try {
                const data = await getTasksWithDeadlines()
                setTasks(data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [])

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    // Generate calendar days
    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
        days.push(day)
        day = addDays(day, 1)
    }

    // Get tasks for a specific day
    const getTasksForDay = (date: Date) => {
        return tasks.filter(t => isSameDay(new Date(t.deadline), date))
    }

    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const goToToday = () => setCurrentMonth(new Date())

    return (
        <Card className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg border-0">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Calendario de Entregas
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Hoy
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-lg min-w-[150px] text-center capitalize">
                                {format(currentMonth, "MMMM yyyy", { locale: es })}
                            </span>
                            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(dayName => (
                        <div
                            key={dayName}
                            className="text-center py-2 text-sm font-semibold text-muted-foreground"
                        >
                            {dayName}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                        const dayTasks = getTasksForDay(date)
                        const isCurrentMonth = isSameMonth(date, currentMonth)
                        const isCurrentDay = isToday(date)
                        const isPastDay = isPast(date) && !isCurrentDay

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "min-h-[100px] p-1.5 rounded-lg border transition-colors",
                                    isCurrentMonth
                                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                        : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800",
                                    isCurrentDay && "ring-2 ring-primary ring-offset-2"
                                )}
                            >
                                {/* Day number */}
                                <div className={cn(
                                    "text-sm font-medium mb-1",
                                    isCurrentDay
                                        ? "text-primary font-bold"
                                        : isCurrentMonth
                                            ? "text-foreground"
                                            : "text-muted-foreground/50"
                                )}>
                                    {format(date, "d")}
                                </div>

                                {/* Tasks for this day */}
                                <div className="space-y-1">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <Link
                                            key={task.id}
                                            href={`/projects/${task.projectId}`}
                                            className={cn(
                                                "block text-xs px-1.5 py-1 rounded-md truncate border-t-2 transition-all",
                                                "bg-white dark:bg-slate-700 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer",
                                                statusTopBorderColors[task.status] || 'border-t-gray-400',
                                                task.status === 'done' && "opacity-60 line-through",
                                                isPastDay && task.status !== 'done' && "bg-red-50 dark:bg-red-950/30"
                                            )}
                                            title={`${task.title} - ${task.projectName}`}
                                        >
                                            {task.title}
                                        </Link>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-xs text-muted-foreground text-center font-medium">
                                            +{dayTasks.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-xs text-muted-foreground">Por hacer</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-xs text-muted-foreground">En progreso</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-xs text-muted-foreground">Revisión</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">Completada</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
