'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface Subtask {
    id: string
    taskId: string
    title: string
    completed: boolean
    position: number
    createdAt: string
}

/**
 * Get all subtasks for a task
 */
export async function getSubtasks(taskId: string): Promise<Subtask[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('position', { ascending: true })

    if (error || !data) {
        console.error('Error fetching subtasks:', error)
        return []
    }

    return data.map((s: any) => ({
        id: s.id,
        taskId: s.task_id,
        title: s.title,
        completed: s.completed,
        position: s.position,
        createdAt: s.created_at
    }))
}

/**
 * Get subtask counts for multiple tasks (for task cards)
 */
export async function getSubtaskCounts(taskIds: string[]): Promise<Record<string, { total: number; completed: number }>> {
    if (taskIds.length === 0) return {}

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subtasks')
        .select('task_id, completed')
        .in('task_id', taskIds)

    if (error || !data) {
        console.error('Error fetching subtask counts:', error)
        return {}
    }

    const counts: Record<string, { total: number; completed: number }> = {}

    data.forEach((s: any) => {
        if (!counts[s.task_id]) {
            counts[s.task_id] = { total: 0, completed: 0 }
        }
        counts[s.task_id].total++
        if (s.completed) {
            counts[s.task_id].completed++
        }
    })

    return counts
}

/**
 * Create a new subtask
 */
export async function createSubtask(
    taskId: string,
    title: string
): Promise<{ subtask?: Subtask; error?: string }> {
    const supabase = await createClient()

    // Get the max position for this task
    const { data: existingSubtasks } = await supabase
        .from('subtasks')
        .select('position')
        .eq('task_id', taskId)
        .order('position', { ascending: false })
        .limit(1)

    const nextPosition = existingSubtasks && existingSubtasks.length > 0
        ? existingSubtasks[0].position + 1
        : 0

    const { data, error } = await supabase
        .from('subtasks')
        .insert({
            task_id: taskId,
            title: title.trim(),
            position: nextPosition
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating subtask:', error)
        return { error: 'Error al crear la subtarea' }
    }

    revalidatePath('/projects/[id]', 'page')

    return {
        subtask: {
            id: data.id,
            taskId: data.task_id,
            title: data.title,
            completed: data.completed,
            position: data.position,
            createdAt: data.created_at
        }
    }
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtask(subtaskId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    // Get current state
    const { data: current, error: fetchError } = await supabase
        .from('subtasks')
        .select('completed')
        .eq('id', subtaskId)
        .single()

    if (fetchError || !current) {
        return { error: 'Subtarea no encontrada' }
    }

    // Toggle
    const { error } = await supabase
        .from('subtasks')
        .update({ completed: !current.completed })
        .eq('id', subtaskId)

    if (error) {
        console.error('Error toggling subtask:', error)
        return { error: 'Error al actualizar la subtarea' }
    }

    revalidatePath('/projects/[id]', 'page')
    return { success: true }
}

/**
 * Update subtask title
 */
export async function updateSubtask(
    subtaskId: string,
    title: string
): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('subtasks')
        .update({ title: title.trim() })
        .eq('id', subtaskId)

    if (error) {
        console.error('Error updating subtask:', error)
        return { error: 'Error al actualizar la subtarea' }
    }

    revalidatePath('/projects/[id]', 'page')
    return { success: true }
}

/**
 * Delete a subtask
 */
export async function deleteSubtask(subtaskId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId)

    if (error) {
        console.error('Error deleting subtask:', error)
        return { error: 'Error al eliminar la subtarea' }
    }

    revalidatePath('/projects/[id]', 'page')
    return { success: true }
}
