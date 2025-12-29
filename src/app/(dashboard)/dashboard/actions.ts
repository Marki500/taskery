'use server'

import { createClient } from "@/utils/supabase/server"

export interface TaskWithDeadline {
    id: string
    title: string
    projectId: string
    projectName: string
    status: string
    deadline: string
}

export async function getTasksWithDeadlines(): Promise<TaskWithDeadline[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get user's workspaces
    const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) return []

    const workspaceIds = memberships.map(m => m.workspace_id)

    // Get projects in those workspaces
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .in('workspace_id', workspaceIds)

    if (!projects || projects.length === 0) return []

    const projectIds = projects.map(p => p.id)
    const projectMap = new Map(projects.map(p => [p.id, p.name]))

    // Get tasks with deadlines
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, project_id, status, deadline')
        .in('project_id', projectIds)
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true })

    if (error || !tasks) {
        console.error('Error fetching tasks with deadlines:', error)
        return []
    }

    return tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        projectId: task.project_id,
        projectName: projectMap.get(task.project_id) || 'Unknown',
        status: task.status,
        deadline: task.deadline
    }))
}
