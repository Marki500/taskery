'use server'

import { createClient } from "@/utils/supabase/server"
import { getActiveWorkspace } from "@/app/(dashboard)/workspaces/actions"
import { revalidatePath } from "next/cache"

export interface CalendarTask {
    id: string
    title: string
    deadline: string
    status: string
    projectId: string
    projectName: string
    tag?: string | null
}

/**
 * Get all tasks with deadlines for the current workspace
 */
export async function getCalendarTasks(): Promise<CalendarTask[]> {
    const supabase = await createClient()

    const workspace = await getActiveWorkspace()
    if (!workspace) return []

    // Get all projects in this workspace
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('workspace_id', workspace.id)

    if (!projects || projects.length === 0) return []

    const projectIds = projects.map(p => p.id)
    const projectMap: Record<string, string> = {}
    projects.forEach(p => { projectMap[p.id] = p.name })

    // Get all tasks with deadlines
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, deadline, status, project_id, tag')
        .in('project_id', projectIds)
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true })

    if (error || !tasks) {
        console.error('Error fetching calendar tasks:', error)
        return []
    }

    return tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        deadline: t.deadline,
        status: t.status,
        projectId: t.project_id,
        projectName: projectMap[t.project_id] || 'Proyecto',
        tag: t.tag || null
    }))
}

export async function updateTaskDate(taskId: string, newDate: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({ deadline: newDate })
        .eq('id', taskId)

    if (error) {
        console.error('Error updating task date:', error)
        throw new Error('Failed to update task date')
    }

    revalidatePath('/calendar')
    return { success: true }
}
