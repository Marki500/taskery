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
import { createProject } from "./project-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function NewProjectDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [url, setUrl] = useState("")
    const [color, setColor] = useState('indigo')
    const [icon, setIcon] = useState('FolderKanban')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }

        setIsLoading(true)
        try {
            const project = await createProject(name.trim(), description.trim() || undefined, color, icon, url.trim() || undefined)
            toast.success("Proyecto creado correctamente")
            setName("")
            setDescription("")
            setUrl("")
            setOpen(false)
            // Navigate to the new project
            router.push(`/projects/${project.id}`)
        } catch (error) {
            toast.error("Error al crear el proyecto")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="text-lg py-3 px-5">
                    <Plus className="mr-2 h-5 w-5" />
                    Nuevo Proyecto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Crear Nuevo Proyecto</DialogTitle>
                        <DialogDescription className="text-base">
                            Los proyectos te ayudan a organizar tus tareas y colaborar con tu equipo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-lg">Nombre del Proyecto</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Rediseño Web, App Móvil..."
                                className="text-lg p-4"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-lg">Descripción (Opcional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="¿De qué trata este proyecto?"
                                className="text-lg p-4"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="url" className="text-lg">URL del Proyecto (Opcional)</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://ejemplo.com"
                                className="text-lg p-4"
                            />
                            <p className="text-xs text-muted-foreground ml-1">
                                Se usará el favicon como icono si se proporciona una URL.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full text-lg py-4">
                            {isLoading ? "Creando..." : "Crear Proyecto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
