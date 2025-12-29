'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserWorkspaces, createWorkspace, Workspace } from '@/app/(dashboard)/workspaces/actions'
import { toast } from 'sonner'

interface WorkspaceSelectorProps {
    collapsed?: boolean
}

export function WorkspaceSelector({ collapsed = false }: WorkspaceSelectorProps) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadWorkspaces()
    }, [])

    const loadWorkspaces = async () => {
        try {
            const ws = await getUserWorkspaces()
            setWorkspaces(ws)
            if (ws.length > 0 && !activeWorkspace) {
                setActiveWorkspace(ws[0])
            }
        } catch (error) {
            console.error('Error loading workspaces:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateWorkspace = async () => {
        if (!newWorkspaceName.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }

        setIsLoading(true)
        try {
            const workspace = await createWorkspace(newWorkspaceName.trim())
            if (workspace) {
                setWorkspaces([...workspaces, workspace])
                setActiveWorkspace(workspace)
                setNewWorkspaceName('')
                setIsCreating(false)
                toast.success('Workspace creado')
            }
        } catch (error) {
            toast.error('Error al crear workspace')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectWorkspace = (workspace: Workspace) => {
        setActiveWorkspace(workspace)
        setIsOpen(false)
        // TODO: Store in cookie/localStorage and refresh data
        window.location.reload()
    }

    if (isLoading && workspaces.length === 0) {
        return (
            <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg bg-muted/50 animate-pulse",
                collapsed && "justify-center"
            )}>
                <div className="h-8 w-8 rounded-md bg-muted" />
                {!collapsed && <div className="h-4 w-24 rounded bg-muted" />}
            </div>
        )
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left",
                        collapsed && "justify-center"
                    )}
                >
                    <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                    </div>
                    {!collapsed && activeWorkspace && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{activeWorkspace.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{activeWorkspace.role}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        </>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start" side="right">
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Tus Workspaces</p>

                    {/* Workspace List */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => handleSelectWorkspace(ws)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left transition-colors",
                                    activeWorkspace?.id === ws.id && "bg-primary/10"
                                )}
                            >
                                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center shrink-0">
                                    <Building2 className="h-3.5 w-3.5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{ws.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{ws.role}</p>
                                </div>
                                {activeWorkspace?.id === ws.id && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t pt-2">
                        {isCreating ? (
                            <div className="space-y-2">
                                <Input
                                    placeholder="Nombre del workspace"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    className="h-8 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateWorkspace()
                                        if (e.key === 'Escape') setIsCreating(false)
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsCreating(false)}
                                        className="flex-1 h-7"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleCreateWorkspace}
                                        disabled={isLoading}
                                        className="flex-1 h-7"
                                    >
                                        Crear
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Crear nuevo workspace
                            </button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
