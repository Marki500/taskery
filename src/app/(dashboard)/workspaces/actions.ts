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
