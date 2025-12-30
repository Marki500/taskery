import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getInvitationByToken } from '@/app/(dashboard)/workspaces/invitation-actions'
import { AcceptInviteClient } from './accept-invite-client'

interface InvitePageProps {
    params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
    const { token } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get invitation details
    const { invitation, error } = await getInvitationByToken(token)

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">Invitación no válida</h1>
                    <p className="text-muted-foreground">{error || 'La invitación no existe o ha expirado.'}</p>
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
                    >
                        Ir al inicio
                    </a>
                </div>
            </div>
        )
    }

    // If not logged in, redirect to login with return URL
    if (!user) {
        redirect(`/login?next=/invite/${token}`)
    }

    // Render the accept invitation UI
    return (
        <AcceptInviteClient
            invitation={invitation}
            userEmail={user.email || ''}
        />
    )
}
