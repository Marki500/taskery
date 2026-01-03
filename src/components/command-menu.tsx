"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command } from "cmdk"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    LayoutDashboard,
    FolderKanban,
    Search,
    Moon,
    Sun,
    Laptop,
    LogOut
} from "lucide-react"
import { getProjects } from "@/app/(dashboard)/projects/project-actions"
import { getTasksWithDeadlines } from "@/app/(dashboard)/dashboard/actions"

import { useCommandMenu } from "@/components/command-menu-context"

export function CommandMenu() {
    const router = useRouter()
    const { open, setOpen } = useCommandMenu()
    const { setTheme } = useTheme()

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    const [projects, setProjects] = React.useState<any[]>([])
    const [tasks, setTasks] = React.useState<any[]>([])

    React.useEffect(() => {
        if (open) {
            // Lazy load data when opened
            Promise.all([
                getProjects().catch(() => []),
                getTasksWithDeadlines().catch(() => [])
            ]).then(([p, t]) => {
                setProjects(p)
                setTasks(t)
            })
        }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Command Dialog */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 dark:border-indigo-500/30 bg-white/90 dark:bg-slate-900/90 shadow-2xl dark:shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <Command className="w-full">
                    <div className="flex items-center border-b border-slate-200 dark:border-indigo-500/20 px-4">
                        <Search className="mr-2 h-5 w-5 shrink-0 text-slate-500 dark:text-indigo-400" />
                        <Command.Input
                            placeholder="Escribe un comando o busca..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            No se encontraron resultados.
                        </Command.Empty>

                        <Command.Group heading="Proyectos" className="text-xs font-medium text-slate-500 dark:text-indigo-300/60 px-2 py-1.5 uppercase tracking-widest">
                            {projects.map(project => (
                                <CommandItem key={project.id} onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}>
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    <span>{project.name}</span>
                                </CommandItem>
                            ))}
                        </Command.Group>

                        <Command.Group heading="Tareas" className="text-xs font-medium text-slate-500 dark:text-indigo-300/60 px-2 py-1.5 uppercase tracking-widest">
                            {tasks.map(task => (
                                <CommandItem key={task.id} onSelect={() => runCommand(() => router.push(`/projects/${task.projectId}?taskId=${task.id}`))}>
                                    <span className={task.status === 'done' ? 'line-through opacity-50' : ''}>{task.title}</span>
                                    <span className="ml-auto text-xs opacity-50">{task.projectName}</span>
                                </CommandItem>
                            ))}
                        </Command.Group>

                        <Command.Group heading="Navegación" className="text-xs font-medium text-slate-500 dark:text-indigo-300/60 px-2 py-1.5 uppercase tracking-widest">
                            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
                                <FolderKanban className="mr-2 h-4 w-4" />
                                <span>Proyectos</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/calendar'))}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Calendario</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/notifications'))}>
                                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </span>
                                </div>
                                <span>Notificaciones</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configuración</span>
                            </CommandItem>
                        </Command.Group>

                        <Command.Separator className="my-1 h-px bg-slate-200 dark:bg-indigo-500/20" />

                        <Command.Group heading="Tema" className="text-xs font-medium text-slate-500 dark:text-indigo-300/60 px-2 py-1.5 uppercase tracking-widest">
                            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                                <Sun className="mr-2 h-4 w-4" />
                                <span>Claro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                                <Moon className="mr-2 h-4 w-4" />
                                <span>Oscuro</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                                <Laptop className="mr-2 h-4 w-4" />
                                <span>Sistema</span>
                            </CommandItem>
                        </Command.Group>
                    </Command.List>

                    <div className="border-t border-slate-200 dark:border-indigo-500/20 bg-slate-50/50 dark:bg-indigo-950/20 px-4 py-2 flex items-center justify-between">
                        <div className="text-xs text-slate-400 dark:text-indigo-300/40 font-medium">
                            <span className="font-bold text-slate-500 dark:text-indigo-400">TIP:</span> Usa las flechas para navegar
                        </div>
                        <div className="flex gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-indigo-500/20 bg-slate-100 dark:bg-indigo-950/40 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-indigo-300 opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    )
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="relative flex cursor-pointer select-none items-center rounded-md px-2 py-2.5 text-sm outline-none data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-indigo-500/20 data-[selected=true]:text-slate-900 dark:data-[selected=true]:text-white transition-colors duration-200 group"
        >
            {children}
            {/* Subtle glow on hover/select */}
            <div className="absolute inset-0 rounded-md bg-indigo-500/0 dark:group-data-[selected=true]:bg-indigo-500/10 transition-colors pointer-events-none" />
        </Command.Item>
    )
}
