'use client'

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Trash2,
    CalendarIcon,
    Clock,
    User,
    Tag,
    CheckCircle2,
    Circle,
    PlayCircle,
    Eye,
    X,
    ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateTask, deleteTask, getWorkspaceMembers, WorkspaceMember, TaskUpdateData } from "@/app/(dashboard)/projects/actions"
import { formatTime } from "@/contexts/timer-context"
import { Task } from "./task-card"

interface TaskSidebarProps {
    task: Task
    trigger: React.ReactNode
    onTaskUpdated?: () => void
}

const statusOptions = [
    { value: 'todo', label: 'Por hacer', icon: Circle, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { value: 'in-progress', label: 'En progreso', icon: PlayCircle, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { value: 'review', label: 'Revisión', icon: Eye, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { value: 'done', label: 'Completada', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-600' },
]

export function TaskSidebar({ task, trigger, onTaskUpdated }: TaskSidebarProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const [tag, setTag] = useState(task.tag || "")
    const [status, setStatus] = useState(task.columnId)
    const [deadline, setDeadline] = useState<Date | undefined>(
        task.deadline ? new Date(task.deadline) : undefined
    )
    const [assignedTo, setAssignedTo] = useState<string | null>(task.assignedTo || null)
    const [members, setMembers] = useState<WorkspaceMember[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (open && task.projectId) {
            getWorkspaceMembers(task.projectId).then(setMembers).catch(console.error)
        }
    }, [open, task.projectId])

    useEffect(() => {
        setTitle(task.title)
        setDescription(task.description || "")
        setTag(task.tag || "")
        setStatus(task.columnId)
        setDeadline(task.deadline ? new Date(task.deadline) : undefined)
        setAssignedTo(task.assignedTo || null)
    }, [task])

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("El título es obligatorio")
            return
        }

        setIsSaving(true)
        try {
            const updateData: TaskUpdateData = {
                title: title.trim(),
                description: description.trim() || null,
                tag: tag.trim() || null,
                deadline: deadline ? deadline.toISOString() : null,
                assignedTo: assignedTo,
                status: status !== task.columnId ? status : undefined
            }
            await updateTask(task.id, updateData)
            toast.success("Tarea actualizada")
            onTaskUpdated?.()
        } catch (error) {
            toast.error("Error al actualizar")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar esta tarea?")) return

        setIsLoading(true)
        try {
            await deleteTask(task.id)
            toast.success("Tarea eliminada")
            setOpen(false)
            onTaskUpdated?.()
        } catch (error) {
            toast.error("Error al eliminar")
        } finally {
            setIsLoading(false)
        }
    }

    const selectedMember = members.find(m => m.id === assignedTo)
    const currentStatus = statusOptions.find(s => s.value === status)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)}>
                {trigger}
            </div>
            <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", currentStatus?.color)} />
                            <SheetTitle className="text-lg font-semibold">Detalles de la tarea</SheetTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Title - Editable inline */}
                    <div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50"
                            placeholder="Nombre de la tarea"
                        />
                    </div>

                    {/* Status Pills */}
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((option) => {
                            const Icon = option.icon
                            const isSelected = status === option.value
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                        isSelected
                                            ? `${option.color} text-white shadow-sm`
                                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[100px] px-3 py-2.5 text-sm rounded-xl border border-input bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="Añade una descripción detallada de la tarea..."
                        />
                    </div>

                    {/* Properties Grid */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground">Propiedades</label>

                        <div className="space-y-3">
                            {/* Assigned To */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground min-w-[80px]">Asignado</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-2 ml-auto text-sm hover:opacity-80 transition-opacity">
                                            {selectedMember ? (
                                                <>
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={selectedMember.avatarUrl || undefined} />
                                                        <AvatarFallback className="text-xs bg-primary/10">
                                                            {selectedMember.fullName?.[0] || selectedMember.email[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{selectedMember.fullName || selectedMember.email.split('@')[0]}</span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">Sin asignar</span>
                                            )}
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2" align="end">
                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => setAssignedTo(null)}
                                                className={cn(
                                                    "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left text-sm",
                                                    !assignedTo && "bg-primary/10"
                                                )}
                                            >
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <span>Sin asignar</span>
                                            </button>
                                            {members.map((member) => (
                                                <button
                                                    key={member.id}
                                                    type="button"
                                                    onClick={() => setAssignedTo(member.id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left text-sm",
                                                        assignedTo === member.id && "bg-primary/10"
                                                    )}
                                                >
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={member.avatarUrl || undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {member.fullName?.[0] || member.email[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{member.fullName || member.email.split('@')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Deadline */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground min-w-[80px]">Fecha límite</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-2 ml-auto text-sm hover:opacity-80 transition-opacity">
                                            {deadline ? (
                                                <span className="font-medium">{format(deadline, "d MMM yyyy", { locale: es })}</span>
                                            ) : (
                                                <span className="text-muted-foreground">Sin fecha</span>
                                            )}
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={deadline}
                                            onSelect={setDeadline}
                                            initialFocus
                                            locale={es}
                                        />
                                        {deadline && (
                                            <div className="p-2 border-t">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeadline(undefined)}
                                                    className="w-full text-muted-foreground"
                                                >
                                                    Quitar fecha
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Tag */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground min-w-[80px]">Etiqueta</span>
                                <input
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    className="ml-auto text-sm font-medium bg-transparent border-none outline-none text-right placeholder:text-muted-foreground w-32"
                                    placeholder="Añadir..."
                                />
                            </div>

                            {/* Time Spent */}
                            {task.totalTime !== undefined && task.totalTime > 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                                    <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                                    <span className="text-sm text-muted-foreground min-w-[80px]">Tiempo</span>
                                    <span className="ml-auto text-lg font-bold font-mono text-indigo-600">
                                        {formatTime(task.totalTime)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-muted/30 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isLoading || isSaving}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Eliminar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="ml-auto"
                        size="sm"
                    >
                        {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
