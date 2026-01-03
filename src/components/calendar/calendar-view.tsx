'use client'

import { useState, useMemo } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
    isPast,
    addDays
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpDown, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CalendarTask, updateTaskDate } from '@/app/(dashboard)/calendar/actions'
import Link from 'next/link'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CalendarViewProps {
    tasks: CalendarTask[]
}

const statusColors: Record<string, { bg: string; dot: string; order: number }> = {
    'todo': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', dot: 'bg-yellow-500', order: 1 },
    'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', dot: 'bg-blue-500', order: 2 },
    'review': { bg: 'bg-purple-100 dark:bg-purple-900/30', dot: 'bg-purple-500', order: 3 },
    'done': { bg: 'bg-green-100 dark:bg-green-900/30', dot: 'bg-green-500', order: 4 },
}

const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

type SortOption = 'date' | 'status' | 'project'

// --- Draggable Task Component ---
function CalendarTaskItem({ task }: { task: CalendarTask }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'Task', task }
    })

    const colors = statusColors[task.status] || statusColors['todo']

    if (isDragging) {
        return (
            <div ref={setNodeRef} className="opacity-50 grayscale">
                <div className={cn(
                    "text-[12px] px-2 py-1.5 rounded-lg truncate font-bold shadow-sm border",
                    "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700",
                )}>
                    {task.title}
                </div>
            </div>
        )
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    ref={setNodeRef}
                    {...listeners}
                    {...attributes}
                    className={cn(
                        "text-[12px] px-2 py-1.5 rounded-lg truncate cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 font-bold shadow-sm border z-20 relative",
                        "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700",
                        task.status === 'todo' && "border-l-[3px] border-l-yellow-500",
                        task.status === 'in-progress' && "border-l-[3px] border-l-blue-500",
                        task.status === 'review' && "border-l-[3px] border-l-purple-500",
                        task.status === 'done' && "border-l-[3px] border-l-green-500",
                    )}>
                    <span className="truncate text-slate-600 dark:text-slate-300 pointer-events-none">{task.title}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] p-4 rounded-2xl shadow-2xl border-0 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 z-50">
                <div className="space-y-2">
                    <p className="font-bold text-sm leading-tight text-slate-800 dark:text-white">{task.title}</p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {task.projectName}
                        </Badge>
                        {task.tag && (
                            <Badge variant="secondary" className="text-[10px] py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {task.tag}
                            </Badge>
                        )}
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    )
}

// --- Droppable Day Component ---
function CalendarDay({ day, currentMonth, tasks }: { day: Date, currentMonth: Date, tasks: CalendarTask[] }) {
    const dateKey = format(day, 'yyyy-MM-dd')
    const { setNodeRef, isOver } = useDroppable({
        id: dateKey,
        data: { type: 'Day', date: day }
    })

    const isCurrentMonth = isSameMonth(day, currentMonth)
    const isCurrentDay = isToday(day)
    const isPastDay = isPast(day) && !isCurrentDay

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "min-h-[140px] p-2 sm:p-3 border rounded-2xl transition-all duration-300 relative group overflow-hidden flex flex-col",
                isCurrentMonth
                    ? "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-lg dark:hover:shadow-indigo-500/10"
                    : "bg-slate-50/50 dark:bg-slate-900/20 border-transparent opacity-50",
                isCurrentDay && "ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10 z-10",
                isPastDay && isCurrentMonth && "grayscale-[0.5] opacity-80",
                isOver && "ring-2 ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 scale-[1.02] z-20"
            )}
        >
            {/* Current Day Indicator */}
            {isCurrentDay && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
            )}

            {/* Date number */}
            <div className={cn(
                "text-lg font-bold mb-3 flex items-center justify-between relative z-10 shrink-0",
                isCurrentDay
                    ? "text-indigo-600 dark:text-indigo-400"
                    : isCurrentMonth
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-600"
            )}>
                <span className={cn(isCurrentDay && "bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md")}>
                    {format(day, 'd')}
                </span>
            </div>

            {/* Tasks container */}
            <div className="space-y-2 relative z-10 flex-1">
                {tasks.slice(0, 3).map((task) => (
                    <CalendarTaskItem key={task.id} task={task} />
                ))}
                {tasks.length > 3 && (
                    <Link href={`/projects/${tasks[0].projectId}`} className="block">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1 hover:text-indigo-500 transition-colors">
                            +{tasks.length - 3} más
                        </div>
                    </Link>
                )}
            </div>
        </div>
    )
}

export function CalendarView({ tasks }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [sortBy, setSortBy] = useState<SortOption>('date')
    const [activeTask, setActiveTask] = useState<CalendarTask | null>(null)
    const router = useRouter()

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    )

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const grouped: Record<string, CalendarTask[]> = {}
        tasks.forEach(task => {
            const dateKey = format(new Date(task.deadline), 'yyyy-MM-dd')
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(task)
        })
        return grouped
    }, [tasks])

    // Get calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentMonth])

    const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const goToToday = () => setCurrentMonth(new Date())

    const upcomingTasks = useMemo(() => {
        const filtered = tasks.filter(t => new Date(t.deadline) >= new Date() && t.status !== 'done')
        return [...filtered].sort((a, b) => {
            if (sortBy === 'date') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            if (sortBy === 'status') return (statusColors[a.status]?.order || 99) - (statusColors[b.status]?.order || 99)
            if (sortBy === 'project') return a.projectName.localeCompare(b.projectName)
            return 0
        })
    }, [tasks, sortBy])

    const handleDragStart = (event: any) => {
        setActiveTask(event.active.data.current?.task)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)

        if (!over) return

        const task = active.data.current?.task as CalendarTask
        const newDate = over.id as string // Date string formatted as yyyy-MM-dd

        if (task && newDate) {
            // Optimistic update could be complex without local state duplicate, relying on fast server action for now
            // or we could optimistically update local `tasks` prop if we lifted state up, but keeping it simple first.
            const previousDate = format(new Date(task.deadline), 'yyyy-MM-dd')

            if (previousDate !== newDate) {
                try {
                    toast.promise(updateTaskDate(task.id, newDate), {
                        loading: 'Actualizando fecha...',
                        success: `Tarea movida al ${format(new Date(newDate), 'd MMM')}`,
                        error: 'Error al mover la tarea'
                    })
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    return (
        <TooltipProvider>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Card className="rounded-3xl shadow-2xl border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <h2 className="text-4xl font-black capitalize tracking-tight text-slate-800 dark:text-white">
                                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                                </h2>
                                <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                                    <Button variant="ghost" size="sm" onClick={goToPreviousMonth} className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <ChevronLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={goToToday} className="px-5 h-9 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                                        Hoy
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={goToNextMonth} className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                        <ChevronRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Week days header */}
                        <div className="grid grid-cols-7 mb-4">
                            {weekDays.map((day) => (
                                <div key={day} className="text-center text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 py-4">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-3">
                            {calendarDays.map((day, idx) => (
                                <CalendarDay
                                    key={idx}
                                    day={day}
                                    currentMonth={currentMonth}
                                    tasks={tasksByDate[format(day, 'yyyy-MM-dd')] || []}
                                />
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6 mt-10 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex-wrap">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                <Clock className="w-4 h-4" />
                                ESTADOS
                            </div>
                            {Object.entries(statusColors).map(([status, colors]) => (
                                <div key={status} className="flex items-center gap-3 text-sm bg-white dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-800", colors.dot)} />
                                    <span className="font-bold text-slate-600 dark:text-slate-300 capitalize text-xs">
                                        {status === 'todo' ? 'Por hacer' :
                                            status === 'in-progress' ? 'En progreso' :
                                                status === 'review' ? 'Revisión' : 'Hecho'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <DragOverlay>
                    {activeTask ? (
                        <div className={cn(
                            "text-[12px] px-2 py-1.5 rounded-lg truncate font-bold shadow-xl border cursor-grabbing w-[160px] opacity-90 rotate-2",
                            "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700",
                            activeTask.status === 'todo' && "border-l-[3px] border-l-yellow-500",
                            activeTask.status === 'in-progress' && "border-l-[3px] border-l-blue-500",
                            activeTask.status === 'review' && "border-l-[3px] border-l-purple-500",
                            activeTask.status === 'done' && "border-l-[3px] border-l-green-500",
                        )}>
                            <span className="truncate text-slate-600 dark:text-slate-300">{activeTask.title}</span>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Upcoming tasks sidebar */}
                <Card className="rounded-2xl shadow-lg mt-8 border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                            <h3 className="font-bold text-xl flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                </div>
                                Próximas tareas
                            </h3>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                    ORDENAR:
                                </div>
                                <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                                    <SelectTrigger className="w-[140px] h-9 text-xs font-bold rounded-xl border-border/50">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="date" className="text-xs font-medium">Por Fecha</SelectItem>
                                        <SelectItem value="status" className="text-xs font-medium">Por Estado</SelectItem>
                                        <SelectItem value="project" className="text-xs font-medium">Por Proyecto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                            {upcomingTasks.slice(0, 6).map((task) => {
                                const colors = statusColors[task.status] || statusColors['todo']
                                const deadlineDate = new Date(task.deadline)
                                const isOverdue = isPast(deadlineDate) && !isToday(deadlineDate)

                                return (
                                    <Link
                                        key={task.id}
                                        href={`/projects/${task.projectId}`}
                                        className="group flex flex-col gap-3 p-4 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-base truncate group-hover:text-primary transition-colors">{task.title}</p>
                                                <p className="text-sm text-muted-foreground font-semibold mt-1">{task.projectName}</p>
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shrink-0",
                                                colors.bg,
                                                colors.dot.replace('bg-', 'text-')
                                            )}>
                                                {task.status === 'in-progress' ? 'Progreso' :
                                                    task.status === 'todo' ? 'Pendiente' :
                                                        task.status === 'review' ? 'Revisión' : 'Listo'}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/30">
                                            <div className={cn(
                                                "flex items-center gap-3 text-sm font-black",
                                                isOverdue ? "text-red-500" : "text-muted-foreground/80"
                                            )}>
                                                <Clock className="h-4 w-4" />
                                                {format(deadlineDate, 'EEEE, d MMM', { locale: es })}
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
                                        </div>
                                    </Link>
                                )
                            })}
                            {upcomingTasks.length === 0 && (
                                <div className="lg:col-span-3 py-12 flex flex-col items-center justify-center text-center opacity-60">
                                    <div className="p-4 bg-muted rounded-full mb-4">
                                        <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="font-bold text-lg">No hay tareas próximas</p>
                                    <p className="text-sm">Todo está bajo control por ahora.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DndContext>
        </TooltipProvider>
    )
}
