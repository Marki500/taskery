'use server'


import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export interface Workspace {
    id: string
    name: string
    ownerId: string
    createdAt: string
    role: 'admin' | 'member' | 'client'
}

// Get all workspaces the user belongs to
export async function getUserWorkspaces(): Promise<Workspace[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: memberships, error } = await supabase
        .from('workspace_members')
        .select(`
            role,
            workspaces (
                id,
                name,
                owner_id,
                created_at
            )
        `)
        .eq('user_id', user.id)

    if (error || !memberships) {
        console.error('Error fetching workspaces:', error)
        return []
    }

    // Filter out any memberships where workspace is null (orphaned memberships)
    return memberships
        .filter((m: any) => m.workspaces !== null)
        .map((m: any) => ({
            id: m.workspaces.id,
            name: m.workspaces.name,
            ownerId: m.workspaces.owner_id,
            createdAt: m.workspaces.created_at,
            role: m.role
        }))
}

// Get active workspace from cookie/storage or return first one
export async function getActiveWorkspace(): Promise<Workspace | null> {
    const workspaces = await getUserWorkspaces()
    if (workspaces.length === 0) return null

    // Check for workspace cookie
    const cookieStore = await cookies()
    const workspaceId = cookieStore.get('workspace_id')?.value

    if (workspaceId) {
        const selectedWorkspace = workspaces.find(w => w.id === workspaceId)
        if (selectedWorkspace) {
            return selectedWorkspace
        }
    }

    // For now, return the first workspace
    // Later we can implement workspace switching via cookies
    return workspaces[0]
}

// Set active workspace cookie
export async function setActiveWorkspaceAction(workspaceId: string) {
    const cookieStore = await cookies()
    cookieStore.set('workspace_id', workspaceId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    revalidatePath('/', 'layout')
}

// Create a new workspace
export async function createWorkspace(name: string): Promise<Workspace | null> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
            name: name,
            owner_id: user.id
        })
        .select()
        .single()

    if (workspaceError) {
        console.error('Error creating workspace:', workspaceError)
        throw new Error('Failed to create workspace')
    }

    // Add user as admin member
    const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: workspace.id,
            user_id: user.id,
            role: 'admin'
        })

    if (memberError) {
        console.error('Error adding member to workspace:', memberError)
        // Rollback workspace creation
        await supabase.from('workspaces').delete().eq('id', workspace.id)
        throw new Error('Failed to add member to workspace')
    }

    revalidatePath('/', 'layout')

    return {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.owner_id,
        createdAt: workspace.created_at,
        role: 'admin'
    }
}

// Ensure user has at least one workspace, create one if not
export async function ensureUserHasWorkspace(): Promise<Workspace> {
    const workspaces = await getUserWorkspaces()

    if (workspaces.length > 0) {
        return workspaces[0]
    }

    // Create a default workspace for the user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const workspaceName = user?.email?.split('@')[0] || 'Mi Workspace'
    const workspace = await createWorkspace(`Workspace de ${workspaceName}`)

    if (!workspace) {
        throw new Error('Failed to create default workspace')
    }

    return workspace
}

// Update workspace name
export async function updateWorkspace(workspaceId: string, name: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify user is admin of this workspace
    const { data: membership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (!membership || membership.role !== 'admin') {
        throw new Error('Not authorized to update this workspace')
    }

    const { error } = await supabase
        .from('workspaces')
        .update({ name })
        .eq('id', workspaceId)

    if (error) {
        console.error('Error updating workspace:', error)
        throw new Error('Failed to update workspace')
    }

    revalidatePath('/', 'layout')
}

// Get workspace members
export async function getWorkspaceMembersWithDetails(workspaceId: string) {
    const supabase = await createClient()

    // Use explicit foreign key hint: profiles!workspace_members_user_id_fkey
    const { data: members, error } = await supabase
        .from('workspace_members')
        .select(`
            user_id,
            role,
            joined_at
        `)
        .eq('workspace_id', workspaceId)

    if (error || !members) {
        console.error('Error fetching workspace members:', error)
        return []
    }

    // Fetch profiles separately to avoid foreign key issues
    const userIds = members.map(m => m.user_id)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    return members.map((m: any) => {
        const profile = profileMap.get(m.user_id)
        return {
            id: m.user_id,
            email: profile?.email || '',
            fullName: profile?.full_name || null,
            avatarUrl: profile?.avatar_url || null,
            role: m.role,
            joinedAt: m.joined_at
        }
    })
}

// Delete a workspace (only owner can delete)
export async function deleteWorkspace(workspaceId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Verify user is the owner of this workspace
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (!workspace) {
        return { error: 'Workspace no encontrado' }
    }

    if (workspace.owner_id !== user.id) {
        return { error: 'Solo el propietario puede eliminar el workspace' }
    }

    // Delete the workspace (cascade will handle members, tasks, etc.)
    const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)

    if (error) {
        console.error('Error deleting workspace:', error)
        return { error: 'Error al eliminar el workspace' }
    }

    // Clear the workspace cookie if it was the active one
    const cookieStore = await cookies()
    const currentWorkspaceId = cookieStore.get('workspace_id')?.value
    if (currentWorkspaceId === workspaceId) {
        cookieStore.delete('workspace_id')
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

// Update a member's role
export async function updateMemberRole(
    workspaceId: string,
    memberId: string,
    newRole: 'admin' | 'member' | 'client'
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Verify current user is admin of this workspace
    const { data: currentMembership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (!currentMembership || currentMembership.role !== 'admin') {
        return { error: 'No tienes permisos para cambiar roles' }
    }

    // Can't change owner's role
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (workspace?.owner_id === memberId) {
        return { error: 'No puedes cambiar el rol del propietario' }
    }

    // Update the role
    const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('workspace_id', workspaceId)
        .eq('user_id', memberId)

    if (error) {
        console.error('Error updating member role:', error)
        return { error: 'Error al actualizar el rol' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

// Remove a member from workspace
export async function removeMember(
    workspaceId: string,
    memberId: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Verify current user is admin of this workspace
    const { data: currentMembership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (!currentMembership || currentMembership.role !== 'admin') {
        return { error: 'No tienes permisos para eliminar miembros' }
    }

    // Can't remove the owner
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (workspace?.owner_id === memberId) {
        return { error: 'No puedes eliminar al propietario del workspace' }
    }

    // Remove the member
    const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', memberId)

    if (error) {
        console.error('Error removing member:', error)
        return { error: 'Error al eliminar el miembro' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

// Leave a workspace (for non-owners)
export async function leaveWorkspace(workspaceId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Check if user is the owner
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (workspace?.owner_id === user.id) {
        return { error: 'El propietario no puede abandonar el workspace. Debes eliminarlo o transferir la propiedad.' }
    }

    // Remove the member
    const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error leaving workspace:', error)
        return { error: 'Error al abandonar el workspace' }
    }

    // Clear the workspace cookie if it was the active one
    const cookieStore = await cookies()
    const currentWorkspaceId = cookieStore.get('workspace_id')?.value
    if (currentWorkspaceId === workspaceId) {
        cookieStore.delete('workspace_id')
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

// Transfer workspace ownership to another admin
export async function transferOwnership(
    workspaceId: string,
    newOwnerId: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    // Verify current user is the owner
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single()

    if (!workspace) {
        return { error: 'Workspace no encontrado' }
    }

    if (workspace.owner_id !== user.id) {
        return { error: 'Solo el propietario puede transferir la propiedad' }
    }

    // Verify new owner is an admin of this workspace
    const { data: newOwnerMembership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', newOwnerId)
        .single()

    if (!newOwnerMembership || newOwnerMembership.role !== 'admin') {
        return { error: 'El nuevo propietario debe ser un admin del workspace' }
    }

    // Transfer ownership
    const { error } = await supabase
        .from('workspaces')
        .update({ owner_id: newOwnerId })
        .eq('id', workspaceId)

    if (error) {
        console.error('Error transferring ownership:', error)
        return { error: 'Error al transferir la propiedad' }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
