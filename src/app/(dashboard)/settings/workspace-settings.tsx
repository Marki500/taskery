'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Building2,
    Users,
    Crown,
    Shield,
    User,
    Mail,
    Trash2,
    Save,
    UserPlus,
    Copy,
    Check,
    Clock,
    X,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { updateWorkspace, Workspace } from "@/app/(dashboard)/workspaces/actions"
import {
    createInvitation,
    generateInviteLink,
    cancelInvitation,
    Invitation
} from "@/app/(dashboard)/workspaces/invitation-actions"
import { useRouter } from "next/navigation"

interface WorkspaceMember {
    id: string
    email: string
    fullName: string | null
    avatarUrl: string | null
    role: 'admin' | 'member' | 'client'
    joinedAt: string
}

interface WorkspaceSettingsProps {
    workspace: Workspace
    members: WorkspaceMember[]
    currentUserId: string
    pendingInvitations?: Invitation[]
}

const roleConfig = {
    admin: { label: 'Admin', icon: Crown, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    member: { label: 'Miembro', icon: Shield, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    client: { label: 'Cliente', icon: User, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' },
}

export function WorkspaceSettings({ workspace, members, currentUserId, pendingInvitations = [] }: WorkspaceSettingsProps) {
    const [workspaceName, setWorkspaceName] = useState(workspace.name)
    const [isSaving, setIsSaving] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'member' | 'client'>('member')
    const [copied, setCopied] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [isGeneratingLink, setIsGeneratingLink] = useState(false)
    const [invitations, setInvitations] = useState<Invitation[]>(pendingInvitations)
    const router = useRouter()

    const isOwner = workspace.ownerId === currentUserId
    const isAdmin = workspace.role === 'admin'
    const canManage = isOwner || isAdmin

    const handleSaveWorkspace = async () => {
        if (!workspaceName.trim()) {
            toast.error('El nombre es obligatorio')
            return
        }

        setIsSaving(true)
        try {
            await updateWorkspace(workspace.id, workspaceName.trim())
            toast.success('Workspace actualizado')
        } catch (error) {
            toast.error('Error al actualizar')
        } finally {
            setIsSaving(false)
        }
    }

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error('El email es obligatorio')
            return
        }

        setIsInviting(true)
        const result = await createInvitation(workspace.id, inviteEmail.trim(), inviteRole)
        setIsInviting(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        if (result.invitation) {
            setInvitations([result.invitation, ...invitations])
            toast.success('Invitación enviada')
            setInviteEmail('')
        }
    }

    const handleCopyInviteLink = async () => {
        setIsGeneratingLink(true)
        const result = await generateInviteLink(workspace.id, inviteRole)
        setIsGeneratingLink(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        if (result.link) {
            navigator.clipboard.writeText(result.link)
            setCopied(true)
            toast.success('Enlace copiado al portapapeles')
            setTimeout(() => setCopied(false), 2000)
            router.refresh()
        }
    }

    const handleCancelInvitation = async (invitationId: string) => {
        const result = await cancelInvitation(invitationId)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setInvitations(invitations.filter(inv => inv.id !== invitationId))
        toast.success('Invitación cancelada')
    }

    return (
        <div className="space-y-6">
            {/* Workspace Info */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>Información del Workspace</CardTitle>
                            <CardDescription>Configuración general de tu espacio de trabajo</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="workspace-name">Nombre del Workspace</Label>
                        <div className="flex gap-3">
                            <Input
                                id="workspace-name"
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                disabled={!canManage}
                                className="max-w-md"
                            />
                            {canManage && (
                                <Button onClick={handleSaveWorkspace} disabled={isSaving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{members.length}</span> miembro{members.length !== 1 ? 's' : ''}
                        </div>
                        <Badge variant="secondary" className={cn("capitalize", roleConfig[workspace.role].color)}>
                            {roleConfig[workspace.role].label}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Invite Members */}
            {canManage && (
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Invitar Miembros</CardTitle>
                                <CardDescription>Añade personas a tu equipo</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex-1 max-w-md">
                                <Input
                                    type="email"
                                    placeholder="email@ejemplo.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <Select value={inviteRole} onValueChange={(v: 'member' | 'client') => setInviteRole(v)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Miembro</SelectItem>
                                    <SelectItem value="client">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleInvite} disabled={isInviting}>
                                {isInviting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Mail className="h-4 w-4 mr-2" />
                                )}
                                {isInviting ? 'Enviando...' : 'Invitar'}
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Enlace de invitación</p>
                                <p className="text-xs text-muted-foreground">Comparte este enlace para invitar miembros</p>
                            </div>
                            <Button variant="outline" onClick={handleCopyInviteLink} disabled={isGeneratingLink}>
                                {isGeneratingLink ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : copied ? (
                                    <Check className="h-4 w-4 mr-2" />
                                ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                )}
                                {isGeneratingLink ? 'Generando...' : copied ? 'Copiado' : 'Copiar enlace'}
                            </Button>
                        </div>

                        {/* Pending Invitations */}
                        {invitations.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Invitaciones pendientes ({invitations.length})
                                    </p>
                                    <div className="space-y-2">
                                        {invitations.map((inv) => (
                                            <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                        <Mail className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {inv.email || 'Enlace abierto'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Expira el {new Date(inv.expiresAt).toLocaleDateString('es-ES')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className={roleConfig[inv.role].color}>
                                                        {roleConfig[inv.role].label}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleCancelInvitation(inv.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Members List */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>Miembros del Equipo</CardTitle>
                            <CardDescription>{members.length} persona{members.length !== 1 ? 's' : ''} en este workspace</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {members.map((member) => {
                            const roleInfo = roleConfig[member.role]
                            const RoleIcon = roleInfo.icon
                            const isCurrentUser = member.id === currentUserId
                            const isMemberOwner = member.id === workspace.ownerId

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatarUrl || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {member.fullName?.[0] || member.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium truncate">
                                                {member.fullName || member.email.split('@')[0]}
                                            </p>
                                            {isCurrentUser && (
                                                <Badge variant="outline" className="text-xs">Tú</Badge>
                                            )}
                                            {isMemberOwner && (
                                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    Owner
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {canManage && !isMemberOwner && !isCurrentUser ? (
                                            <Select defaultValue={member.role}>
                                                <SelectTrigger className="w-28 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="member">Miembro</SelectItem>
                                                    <SelectItem value="client">Cliente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary" className={cn("capitalize", roleInfo.color)}>
                                                <RoleIcon className="h-3 w-3 mr-1" />
                                                {roleInfo.label}
                                            </Badge>
                                        )}

                                        {canManage && !isMemberOwner && !isCurrentUser && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
