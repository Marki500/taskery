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
import { getSubtasks, Subtask } from "@/app/(dashboard)/projects/subtask-actions"
import { getTaskComments, Comment } from "@/app/(dashboard)/projects/comment-actions"
import { formatTime } from "@/contexts/timer-context"
import { Task } from "./task-card"
import { SubtaskList } from "./subtask-list"
import { CommentList } from "./comment-list"
import { ListTodo, MessageSquare, Palette } from "lucide-react"
import { tagColors, tagColorOptions, getTagColorStyles, TagColorName } from "@/lib/tag-colors"

interface TaskSidebarProps {
    task: Task
    trigger: React.ReactNode
    onTaskUpdated?: () => void
    currentUserId?: string
}

const statusOptions = [
    { value: 'todo', label: 'Por hacer', icon: Circle, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { value: 'in-progress', label: 'En progreso', icon: PlayCircle, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { value: 'review', label: 'Revisión', icon: Eye, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { value: 'done', label: 'Completada', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-600' },
]

export function TaskSidebar({ task, trigger, onTaskUpdated, currentUserId }: TaskSidebarProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || "")
    const [tag, setTag] = useState(task.tag || "")
    const [tagColor, setTagColor] = useState<string>(task.tagColor || 'gray')
    const [status, setStatus] = useState(task.columnId)
    const [deadline, setDeadline] = useState<Date | undefined>(
        task.deadline ? new Date(task.deadline) : undefined
    )
    const [assignedTo, setAssignedTo] = useState<string | null>(task.assignedTo || null)
    const [members, setMembers] = useState<WorkspaceMember[]>([])
    const [subtasks, setSubtasks] = useState<Subtask[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (open && task.projectId) {
            getWorkspaceMembers(task.projectId).then(setMembers).catch(console.error)
        }
        if (open && task.id) {
            getSubtasks(task.id).then(setSubtasks).catch(console.error)
            getTaskComments(task.id).then(setComments).catch(console.error)
        }
    }, [open, task.projectId, task.id])

    useEffect(() => {
        setTitle(task.title)
        setDescription(task.description || "")
        setTag(task.tag || "")
        setTagColor(task.tagColor || 'gray')
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
                tagColor: tag.trim() ? tagColor : null,
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
                            <div className={cn("w-4 h-4 rounded-full", currentStatus?.color)} />
                            <SheetTitle className="text-xl font-extrabold tracking-tight">Detalles de la tarea</SheetTitle>
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
                            className="w-full text-2xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 tracking-tight"
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
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-base font-bold transition-all",
                                        isSelected
                                            ? `${option.color} text-white shadow-md`
                                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-base font-bold text-foreground/80">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[120px] px-4 py-3 text-base rounded-xl border border-input bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
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
                                <span className="text-base font-semibold text-muted-foreground min-w-[100px]">Asignado</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-2.5 ml-auto text-base hover:opacity-80 transition-opacity">
                                            {selectedMember ? (
                                                <>
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={selectedMember.avatarUrl || undefined} />
                                                        <AvatarFallback className="text-xs bg-primary/10">
                                                            {selectedMember.fullName?.[0] || selectedMember.email[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-bold">{selectedMember.fullName || selectedMember.email.split('@')[0]}</span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground font-medium">Sin asignar</span>
                                            )}
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                                <span className="text-base font-semibold text-muted-foreground min-w-[100px]">Fecha límite</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-2.5 ml-auto text-base hover:opacity-80 transition-opacity">
                                            {deadline ? (
                                                <span className="font-bold">{format(deadline, "d MMM yyyy", { locale: es })}</span>
                                            ) : (
                                                <span className="text-muted-foreground font-medium">Sin fecha</span>
                                            )}
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                                <span className="text-base font-semibold text-muted-foreground min-w-[100px]">Etiqueta</span>
                                <div className="ml-auto flex items-center gap-2">
                                    <input
                                        value={tag}
                                        onChange={(e) => setTag(e.target.value)}
                                        className="text-base font-bold bg-transparent border-none outline-none text-right placeholder:text-muted-foreground w-32"
                                        placeholder="Añadir..."
                                    />
                                    {tag && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    className="flex items-center gap-1 text-xs hover:opacity-80"
                                                    title="Color de etiqueta"
                                                >
                                                    <div className={cn("w-4 h-4 rounded-full border", tagColors[tagColor as TagColorName]?.dot || 'bg-gray-500')} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-2" align="end">
                                                <div className="grid grid-cols-5 gap-1">
                                                    {tagColorOptions.map((color) => (
                                                        <button
                                                            key={color.value}
                                                            onClick={() => setTagColor(color.value)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                                                tagColors[color.value].dot,
                                                                tagColor === color.value && "ring-2 ring-offset-2 ring-primary"
                                                            )}
                                                            title={color.label}
                                                        />
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </div>
                            </div>

                            {/* Time Spent */}
                            {task.totalTime !== undefined && task.totalTime > 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                                    <Clock className="h-5 w-5 text-indigo-600 shrink-0" />
                                    <span className="text-base font-semibold text-muted-foreground min-w-[100px]">Tiempo</span>
                                    <span className="ml-auto text-2xl font-black font-mono text-indigo-600 tracking-tighter">
                                        {formatTime(task.totalTime)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Subtasks */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <ListTodo className="h-5 w-5 text-muted-foreground" />
                            <label className="text-base font-bold text-foreground/80">Subtareas</label>
                        </div>
                        <SubtaskList
                            taskId={task.id}
                            initialSubtasks={subtasks}
                            onUpdate={() => {
                                getSubtasks(task.id).then(setSubtasks)
                                onTaskUpdated?.()
                            }}
                        />
                    </div>

                    <Separator />

                    {/* Comments */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <label className="text-base font-bold text-foreground/80">
                                Comentarios {comments.length > 0 && `(${comments.length})`}
                            </label>
                        </div>
                        <CommentList
                            taskId={task.id}
                            initialComments={comments}
                            currentUserId={currentUserId || ''}
                            onUpdate={() => {
                                getTaskComments(task.id).then(setComments)
                                onTaskUpdated?.()
                            }}
                        />
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
