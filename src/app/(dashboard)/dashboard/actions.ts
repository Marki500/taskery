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

export async function getDashboardStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const emptyStats = {
        totalProjects: 0,
        pendingTasks: 0,
        completedTasks: 0,
        completedThisWeek: 0,
        weeklyActivity: [],
        upcomingDeadlines: [],
        productivityScore: 0,
        tasksByStatus: { todo: 0, inProgress: 0, review: 0, done: 0 },
        totalHoursThisWeek: 0
    }

    if (!user) return emptyStats

    // Date calculations
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)) // Monday
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // Get workspaces
    const { data: memberships } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)

    if (!memberships?.length) return emptyStats
    const workspaceIds = memberships.map(m => m.workspace_id)

    // Get projects
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('workspace_id', workspaceIds)

    console.log('🔍 DEBUG getDashboardStats - Workspace IDs:', workspaceIds)
    console.log('🔍 DEBUG getDashboardStats - Projects:', projects)
    console.log('🔍 DEBUG getDashboardStats - Projects Error:', projectsError)

    const projectIds = projects?.map(p => p.id) || []

    if (projectIds.length === 0) {
        return {
            totalProjects: 0,
            pendingTasks: 0,
            completedTasks: 0,
            completedThisWeek: 0,
            weeklyActivity: [],
            upcomingDeadlines: []
        }
    }

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status, created_at, deadline, title, project_id')
        .in('project_id', projectIds)

    console.log('🔍 DEBUG getDashboardStats - Project IDs:', projectIds)
    console.log('🔍 DEBUG getDashboardStats - Tasks:', tasks)
    console.log('🔍 DEBUG getDashboardStats - Tasks Error:', tasksError)
    console.log('🔍 DEBUG getDashboardStats - Tasks Length:', tasks?.length)

    if (!tasks) return emptyStats

    // Calculate metrics
    const pendingTasks = tasks.filter(t => t.status !== 'done').length
    const completedTasks = tasks.filter(t => t.status === 'done').length

    const completedThisWeek = tasks.filter(t =>
        t.status === 'done' &&
        new Date(t.created_at) >= startOfWeek // Approximation: usually we check update time for completion, but created is safer if we don't track updated_at specific to status
    ).length

    // Upcoming deadlines (today/tomorrow)
    const upcomingDeadlines = tasks
        .filter(t => t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= new Date(now.getTime() + 48 * 60 * 60 * 1000) && t.status !== 'done')
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 5)

    // Mock weekly activity for chart (real implementation would need a separate history table or complex query)
    const weeklyActivity = [
        { name: 'L', total: 4, completed: 2 },
        { name: 'M', total: 6, completed: 4 },
        { name: 'X', total: 3, completed: 1 },
        { name: 'J', total: 8, completed: 5 },
        { name: 'V', total: 5, completed: 3 },
        { name: 'S', total: 2, completed: 2 },
        { name: 'D', total: 0, completed: 0 },
    ]

    // Task distribution by status for donut chart
    const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
    }

    // Get time tracking data for this week
    const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('duration')
        .in('task_id', tasks.map(t => t.id))
        .gte('started_at', startOfWeek.toISOString())

    const totalSecondsThisWeek = timeEntries?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0
    const totalHoursThisWeek = Math.round((totalSecondsThisWeek / 3600) * 10) / 10 // Round to 1 decimal

    return {
        totalProjects: projects?.length || 0,
        pendingTasks,
        completedTasks,
        completedThisWeek,
        weeklyActivity,
        upcomingDeadlines,
        productivityScore: completedTasks + pendingTasks > 0 ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) : 0,
        tasksByStatus,
        totalHoursThisWeek
    }
}
