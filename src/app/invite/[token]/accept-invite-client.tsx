'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { acceptInvitation } from '@/app/(dashboard)/workspaces/invitation-actions'
import { toast } from 'sonner'
import { Building2, Users, Crown, Shield, User, Check, Loader2 } from 'lucide-react'

interface Invitation {
    id: string
    workspaceId: string
    email: string | null
    role: 'admin' | 'member' | 'client'
    token: string
    invitedBy: string
    inviterName: string
    workspaceName: string
    expiresAt: string
    acceptedAt: string | null
    createdAt: string
}

interface AcceptInviteClientProps {
    invitation: Invitation
    userEmail: string
}

const roleConfig = {
    admin: { label: 'Administrador', icon: Crown, color: 'bg-yellow-100 text-yellow-700' },
    member: { label: 'Miembro', icon: Shield, color: 'bg-blue-100 text-blue-700' },
    client: { label: 'Cliente', icon: User, color: 'bg-gray-100 text-gray-700' },
}

export function AcceptInviteClient({ invitation, userEmail }: AcceptInviteClientProps) {
    const [isAccepting, setIsAccepting] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const router = useRouter()

    const roleInfo = roleConfig[invitation.role]
    const RoleIcon = roleInfo.icon

    const handleAccept = async () => {
        setIsAccepting(true)

        const result = await acceptInvitation(invitation.token)

        if (result.error) {
            toast.error(result.error)
            setIsAccepting(false)
            return
        }

        setAccepted(true)
        toast.success('¡Te has unido al workspace!')

        // Redirect to projects after a short delay
        setTimeout(() => {
            router.push('/projects')
        }, 1500)
    }

    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold">¡Bienvenido al equipo!</h1>
                    <p className="text-muted-foreground">
                        Ya eres parte de <strong>{invitation.workspaceName}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">Redirigiendo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="max-w-md w-full shadow-xl rounded-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Te han invitado</CardTitle>
                    <CardDescription className="text-base">
                        <strong>{invitation.inviterName}</strong> te invita a unirte
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">Workspace</p>
                        <p className="text-xl font-bold">{invitation.workspaceName}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">Rol:</span>
                        <Badge className={roleInfo.color}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleInfo.label}
                        </Badge>
                    </div>

                    {invitation.email && invitation.email !== userEmail && (
                        <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                            ⚠️ Esta invitación fue enviada a <strong>{invitation.email}</strong>,
                            pero estás logueado como <strong>{userEmail}</strong>
                        </p>
                    )}

                    <Button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="w-full h-12 text-lg"
                    >
                        {isAccepting ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Uniéndote...
                            </>
                        ) : (
                            <>
                                <Users className="h-5 w-5 mr-2" />
                                Aceptar invitación
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Esta invitación expira el {new Date(invitation.expiresAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
