import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, Clock, ArrowRight } from "lucide-react"
import { getProjects } from "./project-actions"
import { NewProjectDialog } from "./new-project-dialog"

export default async function ProjectsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const projects = await getProjects()

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Proyectos</h1>
                    <p className="text-muted-foreground text-lg mt-1">Gestiona y organiza tu trabajo.</p>
                </div>
                <NewProjectDialog />
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
                    <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-2xl font-semibold text-muted-foreground">Sin proyectos todavía</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Crea tu primer proyecto para empezar a organizar tus tareas.</p>
                    <NewProjectDialog />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <Card className="h-full hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer group rounded-2xl">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm">
                                            <FolderKanban className="h-6 w-6 text-white" />
                                        </div>
                                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="uppercase text-xs tracking-wider">
                                            {project.status === 'active' ? 'Activo' : project.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="text-base line-clamp-2">
                                        {project.description || 'Sin descripción'}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                                        <span>Abrir</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
