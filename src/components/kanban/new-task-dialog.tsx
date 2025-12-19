'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createTask } from "@/app/(dashboard)/projects/actions"
import { toast } from "sonner"

interface NewTaskDialogProps {
    projectId: string
    onTaskCreated?: () => void
}

export function NewTaskDialog({ projectId, onTaskCreated }: NewTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [tag, setTag] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("El título es obligatorio")
            return
        }

        setIsLoading(true)
        try {
            await createTask(projectId, title.trim(), tag.trim() || undefined)
            toast.success("¡Tarea creada!")
            setTitle("")
            setTag("")
            setOpen(false)
            onTaskCreated?.()
        } catch (error) {
            toast.error("Error al crear la tarea")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-sm font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tarea
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Crear Nueva Tarea</DialogTitle>
                        <DialogDescription>
                            Añade una nueva tarea a tu tablero Kanban.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-base">Título</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="¿Qué necesitas hacer?"
                                className="text-lg p-3"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tag" className="text-base">Etiqueta (Opcional)</Label>
                            <Input
                                id="tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="Ej: Backend, UI, Bug..."
                                className="text-lg p-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full text-lg py-3">
                            {isLoading ? "Creando..." : "Crear Tarea"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
