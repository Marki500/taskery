import { Resend } from 'resend'

// Lazy initialization - Resend will only be created when actually needed
let resend: Resend | null = null

function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        return null
    }
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY)
    }
    return resend
}

interface InvitationEmailParams {
    to: string
    inviterName: string
    workspaceName: string
    inviteLink: string
    role: string
}

export async function sendInvitationEmail({
    to,
    inviterName,
    workspaceName,
    inviteLink,
    role
}: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, skipping email')
        return { success: false, error: 'Email not configured' }
    }

    const roleLabels: Record<string, string> = {
        admin: 'Administrador',
        member: 'Miembro',
        client: 'Cliente'
    }

    try {
        const client = getResendClient()
        if (!client) {
            return { success: false, error: 'Email not configured' }
        }

        const { data, error } = await client.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Taskery <noreply@taskery.bycram.dev>',
            to: [to],
            subject: `${inviterName} te invita a unirte a ${workspaceName} en Taskery`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación al Workspace</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Logo/Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 24px;">
                    Taskery
                </div>
            </div>
            
            <!-- Main Content -->
            <h1 style="color: #18181b; font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">
                Te han invitado a un workspace
            </h1>
            
            <p style="color: #52525b; font-size: 16px; text-align: center; margin: 0 0 24px 0; line-height: 1.6;">
                <strong>${inviterName}</strong> te invita a unirte a <strong>${workspaceName}</strong> como ${roleLabels[role] || role}.
            </p>
            
            <!-- Workspace Card -->
            <div style="background-color: #f4f4f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <div style="font-size: 14px; color: #71717a; margin-bottom: 8px;">Workspace</div>
                <div style="font-size: 20px; font-weight: 700; color: #18181b;">${workspaceName}</div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                    Aceptar Invitación
                </a>
            </div>
            
            <!-- Secondary Info -->
            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 0; line-height: 1.6;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${inviteLink}" style="color: #6366f1;">${inviteLink}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 24px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                Este email fue enviado por Taskery. Si no esperabas esta invitación, puedes ignorar este email.
            </p>
        </div>
    </div>
</body>
</html>
            `,
        })

        if (error) {
            console.error('Error sending email:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Error sending invitation email:', err)
        return { success: false, error: 'Error al enviar email' }
    }
}
