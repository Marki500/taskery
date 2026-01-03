'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvitationEmail } from '@/lib/email'
import { createNotification } from '@/app/(dashboard)/notifications/actions'
import { logActivity } from '../activity/actions'

// Generate a secure random token
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}

export interface Invitation {
    id: string
    workspaceId: string
    email: string | null
    role: 'admin' | 'member' | 'client'
    token: string
    invitedBy: string
    inviterName?: string
    workspaceName?: string
    expiresAt: string
    acceptedAt: string | null
    createdAt: string
}

/**
 * Create a new invitation for a workspace
 */
export async function createInvitation(
    workspaceId: string,
    email: string | null,
    role: 'admin' | 'member' | 'client' = 'member'
): Promise<{ invitation?: Invitation; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    // Get inviter profile and workspace info
    const [profileResult, workspaceResult, membershipResult] = await Promise.all([
        supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
        supabase.from('workspaces').select('name').eq('id', workspaceId).single(),
        supabase.from('workspace_members').select('role').eq('workspace_id', workspaceId).eq('user_id', user.id).single()
    ])

    const inviterName = profileResult.data?.full_name || profileResult.data?.email || 'Alguien'
    const workspaceName = workspaceResult.data?.name || 'Workspace'

    if (!membershipResult.data || membershipResult.data.role !== 'admin') {
        return { error: 'No tienes permisos para invitar' }
    }

    // If email provided, check if already a member
    let existingProfileId: string | null = null
    if (email) {
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (existingProfile) {
            existingProfileId = existingProfile.id
            const { data: existingMember } = await supabase
                .from('workspace_members')
                .select('id')
                .eq('workspace_id', workspaceId)
                .eq('user_id', existingProfile.id)
                .single()

            if (existingMember) {
                return { error: 'Este usuario ya es miembro del workspace' }
            }
        }

        // Check if there's already a pending invitation for this email
        const { data: existingInvite } = await supabase
            .from('workspace_invitations')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('email', email)
            .is('accepted_at', null)
            .single()

        if (existingInvite) {
            return { error: 'Ya existe una invitación pendiente para este email' }
        }
    }

    // Create the invitation (expires in 7 days)
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: invitation, error } = await supabase
        .from('workspace_invitations')
        .insert({
            workspace_id: workspaceId,
            email: email || null,
            role,
            token,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating invitation:', error)
        return { error: 'Error al crear la invitación' }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/invite/${token}`

    // Send email if email is provided
    if (email) {
        await sendInvitationEmail({
            to: email,
            inviterName,
            workspaceName,
            inviteLink,
            role
        })
    }

    // Create in-app notification if user already exists
    if (existingProfileId) {
        await createNotification({
            userId: existingProfileId,
            type: 'invitation',
            title: `Invitación a ${workspaceName}`,
            message: `${inviterName} te ha invitado a unirte a ${workspaceName}`,
            link: inviteLink,
            data: { invitationId: invitation.id, workspaceId }
        })
    }

    // Log activity
    await logActivity(
        workspaceId,
        'member_invited',
        invitation.id,
        'invitation',
        { email: invitation.email, role: invitation.role }
    )

    revalidatePath('/settings')

    return {
        invitation: {
            id: invitation.id,
            workspaceId: invitation.workspace_id,
            email: invitation.email,
            role: invitation.role,
            token: invitation.token,
            invitedBy: invitation.invited_by,
            expiresAt: invitation.expires_at,
            acceptedAt: invitation.accepted_at,
            createdAt: invitation.created_at,
        }
    }
}

/**
 * Get all pending invitations for a workspace
 */
export async function getWorkspaceInvitations(workspaceId: string): Promise<Invitation[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
            *,
            inviter:profiles!invited_by(full_name, email)
        `)
        .eq('workspace_id', workspaceId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false })

    if (error || !data) {
        console.error('Error fetching invitations:', error)
        return []
    }

    return data.map((inv: any) => ({
        id: inv.id,
        workspaceId: inv.workspace_id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        invitedBy: inv.invited_by,
        inviterName: inv.inviter?.full_name || inv.inviter?.email,
        expiresAt: inv.expires_at,
        acceptedAt: inv.accepted_at,
        createdAt: inv.created_at,
    }))
}

export interface AcceptedInvitation {
    id: string
    email: string | null
    role: 'admin' | 'member' | 'client'
    inviterName: string
    acceptedAt: string
    createdAt: string
    acceptedByName?: string
    acceptedByEmail?: string
}

/**
 * Get all accepted invitations for a workspace (invitation history)
 */
export async function getAcceptedInvitations(workspaceId: string): Promise<AcceptedInvitation[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
            id,
            email,
            role,
            accepted_at,
            created_at,
            inviter:profiles!invited_by(full_name, email)
        `)
        .eq('workspace_id', workspaceId)
        .not('accepted_at', 'is', null)
        .order('accepted_at', { ascending: false })

    if (error || !data) {
        console.error('Error fetching accepted invitations:', error)
        return []
    }

    return data.map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        inviterName: inv.inviter?.full_name || inv.inviter?.email || 'Desconocido',
        acceptedAt: inv.accepted_at,
        createdAt: inv.created_at,
    }))
}

/**
 * Get invitation details by token (for the accept page)
 */
export async function getInvitationByToken(token: string): Promise<{
    invitation?: Invitation & { workspaceName: string; inviterName: string }
    error?: string
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('workspace_invitations')
        .select(`
            *,
            workspace:workspaces(name),
            inviter:profiles!invited_by(full_name, email)
        `)
        .eq('token', token)
        .single()

    if (error || !data) {
        return { error: 'Invitación no encontrada' }
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
        return { error: 'La invitación ha expirado' }
    }

    // Check if already accepted
    if (data.accepted_at) {
        return { error: 'La invitación ya fue aceptada' }
    }

    return {
        invitation: {
            id: data.id,
            workspaceId: data.workspace_id,
            email: data.email,
            role: data.role,
            token: data.token,
            invitedBy: data.invited_by,
            inviterName: data.inviter?.full_name || data.inviter?.email || 'Unknown',
            workspaceName: data.workspace?.name || 'Workspace',
            expiresAt: data.expires_at,
            acceptedAt: data.accepted_at,
            createdAt: data.created_at,
        }
    }
}

import { setActiveWorkspaceAction } from './actions'

/**
 * Accept an invitation and join the workspace
 */
export async function acceptInvitation(token: string): Promise<{ success?: boolean; workspaceId?: string; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Debes iniciar sesión para aceptar la invitación' }
    }

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('token', token)
        .single()

    if (fetchError || !invitation) {
        return { error: 'Invitación no encontrada' }
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
        return { error: 'La invitación ha expirado' }
    }

    // Check if already accepted
    if (invitation.accepted_at) {
        return { error: 'La invitación ya fue aceptada' }
    }

    // Check if email matches (if invitation was for specific email)
    if (invitation.email && invitation.email !== user.email) {
        return { error: 'Esta invitación es para otro email' }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', user.id)
        .single()

    if (existingMember) {
        // Mark invitation as accepted anyway
        await supabase
            .from('workspace_invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('id', invitation.id)

        return { error: 'Ya eres miembro de este workspace' }
    }

    // Add user to workspace
    const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: invitation.workspace_id,
            user_id: user.id,
            role: invitation.role,
        })

    if (memberError) {
        // If it's a duplicate key error, user is already a member - treat as success
        if (memberError.code === '23505') {
            console.log('User already a member, marking invitation as accepted')
        } else {
            console.error('Error adding member:', memberError)
            return { error: 'Error al unirte al workspace' }
        }
    }

    // Mark invitation as accepted
    await supabase
        .from('workspace_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

    // Set as active workspace so the user enters directly
    await setActiveWorkspaceAction(invitation.workspace_id)

    revalidatePath('/', 'layout')
    revalidatePath('/settings')
    revalidatePath('/projects')

    return { success: true, workspaceId: invitation.workspace_id }
}

/**
 * Cancel/delete an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId)

    if (error) {
        console.error('Error canceling invitation:', error)
        return { error: 'Error al cancelar la invitación' }
    }

    revalidatePath('/settings')
    return { success: true }
}

/**
 * Generate an invite link for a workspace (creates a link-only invitation)
 */
export async function generateInviteLink(
    workspaceId: string,
    role: 'member' | 'client' = 'member'
): Promise<{ link?: string; error?: string }> {
    const result = await createInvitation(workspaceId, null, role)

    if (result.error) {
        return { error: result.error }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return { link: `${baseUrl}/invite/${result.invitation!.token}` }
}
