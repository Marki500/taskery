import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban/board"
import { getProjectById } from "../project-actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const project = await getProjectById(id)

    if (!project) {
        notFound()
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/projects">
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            {project.name}
                        </h1>
                        <p className="text-muted-foreground text-lg mt-1">
                            {project.description || 'Tablero de tareas'}
                        </p>
                    </div>
                </div>
            </div>

            {/* The Kanban Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-muted/30 rounded-xl border border-border/50 p-4">
                <KanbanBoard projectId={id} />
            </div>
        </div>
    )
}
