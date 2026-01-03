'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { logActivity } from "../activity/actions"

export interface Comment {
    id: string
    taskId: string
    userId: string
    content: string
    createdAt: string
    updatedAt: string
    // User info
    userName?: string
    userEmail?: string
    userAvatar?: string | null
}

/**
 * Get all comments for a task
 */
export async function getTaskComments(taskId: string): Promise<Comment[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('task_comments')
        .select(`
            *,
            user:profiles!user_id(full_name, email, avatar_url)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

    if (error || !data) {
        console.error('Error fetching comments:', error)
        return []
    }

    return data.map((c: any) => ({
        id: c.id,
        taskId: c.task_id,
        userId: c.user_id,
        content: c.content,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        userName: c.user?.full_name || null,
        userEmail: c.user?.email || null,
        userAvatar: c.user?.avatar_url || null
    }))
}

/**
 * Create a new comment
 */
export async function createComment(
    taskId: string,
    content: string
): Promise<{ comment?: Comment; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data, error } = await supabase
        .from('task_comments')
        .insert({
            task_id: taskId,
            user_id: user.id,
            content: content.trim()
        })
        .select(`
            *,
            user:profiles!user_id(full_name, email, avatar_url)
        `)
        .single()

    if (error) {
        console.error('Error creating comment:', error)
        return { error: 'Error al crear el comentario' }
    }

    revalidatePath('/projects/[id]', 'page')

    // Log activity
    try {
        const { data: taskData } = await supabase
            .from('tasks')
            .select('project_id, projects!inner(workspace_id)')
            .eq('id', taskId)
            .single()

        if (taskData?.projects) {
            // @ts-ignore
            const workspaceId = taskData.projects.workspace_id
            await logActivity(
                workspaceId,
                'comment_created',
                data.id,
                'comment',
                { content: content.substring(0, 50), taskId }
            )
        }
    } catch (e) {
        console.error('Error logging comment:', e)
    }

    return {
        comment: {
            id: data.id,
            taskId: data.task_id,
            userId: data.user_id,
            content: data.content,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            userName: data.user?.full_name || null,
            userEmail: data.user?.email || null,
            userAvatar: data.user?.avatar_url || null
        }
    }
}

/**
 * Update a comment
 */
export async function updateComment(
    commentId: string,
    content: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('task_comments')
        .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

    if (error) {
        console.error('Error updating comment:', error)
        return { error: 'Error al actualizar el comentario' }
    }

    revalidatePath('/projects/[id]', 'page')
    return { success: true }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId)

    if (error) {
        console.error('Error deleting comment:', error)
        return { error: 'Error al eliminar el comentario' }
    }

    revalidatePath('/projects/[id]', 'page')
    return { success: true }
}

/**
 * Get comment count for a task (for task cards)
 */
export async function getCommentCount(taskId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('task_comments')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId)

    if (error) {
        console.error('Error getting comment count:', error)
        return 0
    }

    return count || 0
}
