'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Task } from "@/components/kanban/task-card"

export async function updateTaskStatus(taskId: string, newStatus: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

    if (error) {
        console.error('Error updating task status:', error)
        throw new Error('Failed to update task status')
    }

    revalidatePath('/projects/[id]', 'page')
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
    const supabase = await createClient()

    // Fetch tasks with their accumulated time from time_entries
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching tasks:', error)
        return []
    }

    // Fetch time entries for all tasks in this project
    const taskIds = tasks.map((t: any) => t.id)
    const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('task_id, duration')
        .in('task_id', taskIds)
        .not('duration', 'is', null)

    // Calculate total time per task
    const timeByTask: Record<string, number> = {}
    if (timeEntries) {
        timeEntries.forEach((entry: any) => {
            timeByTask[entry.task_id] = (timeByTask[entry.task_id] || 0) + (entry.duration || 0)
        })
    }

    return tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        columnId: task.status,
        tag: task.tag,
        projectId: projectId,
        totalTime: timeByTask[task.id] || 0
    }))
}

export async function createTask(projectId: string, title: string, tag?: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            project_id: projectId,
            title: title,
            status: 'todo', // New tasks start in "Por hacer"
            tag: tag || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating task:', error)
        throw new Error('Failed to create task')
    }

    revalidatePath('/projects/[id]', 'page')
    return data
}

export async function updateTask(taskId: string, title: string, tag?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({
            title: title,
            tag: tag || null
        })
        .eq('id', taskId)

    if (error) {
        console.error('Error updating task:', error)
        throw new Error('Failed to update task')
    }

    revalidatePath('/projects/[id]', 'page')
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) {
        console.error('Error deleting task:', error)
        throw new Error('Failed to delete task')
    }

    revalidatePath('/projects/[id]', 'page')
}
