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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
    Loader2,
    AlertTriangle,
    LogOut,
    ArrowRightLeft,
    History,
    CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    updateWorkspace,
    Workspace,
    deleteWorkspace,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    transferOwnership
} from "@/app/(dashboard)/workspaces/actions"
import {
    createInvitation,
    generateInviteLink,
    cancelInvitation,
    Invitation,
    AcceptedInvitation
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
    acceptedInvitations?: AcceptedInvitation[]
}

const roleConfig = {
    admin: { label: 'Admin', icon: Crown, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    member: { label: 'Miembro', icon: Shield, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    client: { label: 'Cliente', icon: User, color: 'text-gray-600 bg-gray-100 dark:bg-gray-800' },
}

export function WorkspaceSettings({ workspace, members, currentUserId, pendingInvitations = [], acceptedInvitations = [] }: WorkspaceSettingsProps) {
    const [workspaceName, setWorkspaceName] = useState(workspace.name)
    const [isSaving, setIsSaving] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'member' | 'client'>('member')
    const [copied, setCopied] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [isGeneratingLink, setIsGeneratingLink] = useState(false)
    const [invitations, setInvitations] = useState<Invitation[]>(pendingInvitations)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteConfirmName, setDeleteConfirmName] = useState('')
    const [membersList, setMembersList] = useState<WorkspaceMember[]>(members)
    const [selectedNewOwner, setSelectedNewOwner] = useState<string>('')
    const [isTransferring, setIsTransferring] = useState(false)
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

    const handleDeleteWorkspace = async () => {
        if (deleteConfirmName !== workspace.name) {
            toast.error('El nombre no coincide')
            return
        }

        setIsDeleting(true)
        const result = await deleteWorkspace(workspace.id)
        setIsDeleting(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success('Workspace eliminado')
        router.push('/dashboard')
        router.refresh()
    }

    const handleUpdateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'client') => {
        const result = await updateMemberRole(workspace.id, memberId, newRole)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setMembersList(membersList.map(m =>
            m.id === memberId ? { ...m, role: newRole } : m
        ))
        toast.success('Rol actualizado')
    }

    const handleRemoveMember = async (memberId: string) => {
        const result = await removeMember(workspace.id, memberId)

        if (result.error) {
            toast.error(result.error)
            return
        }

        setMembersList(membersList.filter(m => m.id !== memberId))
        toast.success('Miembro eliminado')
    }

    const handleLeaveWorkspace = async () => {
        const result = await leaveWorkspace(workspace.id)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success('Has abandonado el workspace')
        router.push('/dashboard')
        router.refresh()
    }

    const handleTransferOwnership = async () => {
        if (!selectedNewOwner) {
            toast.error('Selecciona un nuevo propietario')
            return
        }

        setIsTransferring(true)
        const result = await transferOwnership(workspace.id, selectedNewOwner)
        setIsTransferring(false)

        if (result.error) {
            toast.error(result.error)
            return
        }

        toast.success('Propiedad transferida exitosamente')
        router.refresh()
    }

    // Get admin members (excluding current user) for transfer ownership
    const adminMembers = membersList.filter(m => m.role === 'admin' && m.id !== currentUserId)

    return (
        <div className="space-y-6">
            {/* Workspace Info */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center border border-primary/20 shadow-md">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight">Información del Workspace</CardTitle>
                            <CardDescription className="text-base font-medium">Configuración general de tu espacio de trabajo</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="workspace-name" className="text-base font-bold text-foreground/80">Nombre del Workspace</Label>
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
                            <span className="font-medium">{membersList.length}</span> miembro{membersList.length !== 1 ? 's' : ''}
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
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border border-emerald-200 shadow-md">
                                <UserPlus className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Invitar Miembros</CardTitle>
                                <CardDescription className="text-base font-medium">Añade personas a tu equipo</CardDescription>
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
                                <p className="text-base font-bold">Enlace de invitación</p>
                                <p className="text-sm text-muted-foreground font-medium">Comparte este enlace para invitar miembros</p>
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

            {/* Invitation History */}
            {canManage && acceptedInvitations.length > 0 && (
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center border border-teal-200 shadow-md">
                                <History className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Historial de Invitaciones</CardTitle>
                                <CardDescription className="text-base font-medium">Invitaciones aceptadas ({acceptedInvitations.length})</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {acceptedInvitations.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {inv.email || 'Enlace abierto'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Invitado por {inv.inviterName} · Aceptado el {new Date(inv.acceptedAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className={roleConfig[inv.role].color}>
                                        {roleConfig[inv.role].label}
                                    </Badge>
                                </div>
                            ))}
                        </div>
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
                            <CardDescription>{membersList.length} persona{membersList.length !== 1 ? 's' : ''} en este workspace</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {membersList.map((member) => {
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
                                            <Select
                                                value={member.role}
                                                onValueChange={(v: 'admin' | 'member' | 'client') => handleUpdateMemberRole(member.id, v)}
                                            >
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
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            ¿Estás seguro de que quieres eliminar a <strong>{member.fullName || member.email}</strong> del workspace?
                                                            Esta persona perderá acceso a todas las tareas y proyectos.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="rounded-2xl shadow-sm border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                            <CardDescription>Acciones irreversibles para este workspace</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Leave Workspace - for non-owners */}
                    {!isOwner && (
                        <div className="flex items-center justify-between p-4 border border-orange-200 dark:border-orange-900/50 rounded-xl bg-orange-50/50 dark:bg-orange-900/10">
                            <div>
                                <p className="font-medium">Abandonar Workspace</p>
                                <p className="text-sm text-muted-foreground">
                                    Salir de este workspace. Perderás acceso a todas las tareas.
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Abandonar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Abandonar workspace?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            ¿Estás seguro de que quieres abandonar <strong>{workspace.name}</strong>?
                                            Perderás acceso a todas las tareas y proyectos de este workspace.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleLeaveWorkspace}
                                            className="bg-orange-600 text-white hover:bg-orange-700"
                                        >
                                            Sí, abandonar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}

                    {/* Transfer Ownership - only for owner */}
                    {isOwner && adminMembers.length > 0 && (
                        <div className="flex items-center justify-between p-4 border border-purple-200 dark:border-purple-900/50 rounded-xl bg-purple-50/50 dark:bg-purple-900/10">
                            <div>
                                <p className="font-medium text-purple-700 dark:text-purple-400">Transferir Propiedad</p>
                                <p className="text-sm text-muted-foreground">
                                    Transferir este workspace a otro administrador.
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                        Transferir
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                                            Transferir Propiedad
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-4">
                                            <p>
                                                Transferirás la propiedad de <strong>{workspace.name}</strong> a otro administrador.
                                                Tú pasarás a ser un administrador normal.
                                            </p>
                                            <div>
                                                <Label htmlFor="new-owner">Selecciona el nuevo propietario:</Label>
                                                <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Seleccionar admin..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {adminMembers.map((admin) => (
                                                            <SelectItem key={admin.id} value={admin.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <span>{admin.fullName || admin.email}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setSelectedNewOwner('')}>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <Button
                                            onClick={handleTransferOwnership}
                                            disabled={!selectedNewOwner || isTransferring}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            {isTransferring ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                            )}
                                            {isTransferring ? 'Transfiriendo...' : 'Confirmar transferencia'}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}

                    {/* Delete Workspace - only for owner */}
                    {isOwner && (
                        <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-xl bg-destructive/5">
                            <div>
                                <p className="font-medium text-destructive">Eliminar Workspace</p>
                                <p className="text-sm text-muted-foreground">
                                    Eliminar permanentemente este workspace y todas sus tareas.
                                </p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="h-5 w-5" />
                                            Eliminar Workspace
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-3">
                                            <p>
                                                Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán:
                                            </p>
                                            <ul className="list-disc list-inside text-sm space-y-1">
                                                <li>Todas las tareas y proyectos</li>
                                                <li>Todos los miembros serán removidos</li>
                                                <li>Todas las invitaciones pendientes</li>
                                                <li>Todo el historial de tiempo</li>
                                            </ul>
                                            <div className="pt-2">
                                                <Label htmlFor="confirm-name" className="text-foreground">
                                                    Escribe <strong>{workspace.name}</strong> para confirmar:
                                                </Label>
                                                <Input
                                                    id="confirm-name"
                                                    value={deleteConfirmName}
                                                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                                                    placeholder="Nombre del workspace"
                                                    className="mt-2"
                                                />
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setDeleteConfirmName('')}>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDeleteWorkspace}
                                            disabled={deleteConfirmName !== workspace.name || isDeleting}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4 mr-2" />
                                            )}
                                            {isDeleting ? 'Eliminando...' : 'Eliminar permanentemente'}
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
