import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { TaskDetailView } from "@/components/tasks/task-detail-view"
import { getTaskComments, getTaskDetails } from "../../../task-actions"
import { getTaskActivity } from "@/app/(dashboard)/activity/actions"
import { getSubtasks } from "../../../subtask-actions"
import { getWorkspaceMembers } from "../../../actions"

interface PageProps {
    params: Promise<{
        id: string
        taskId: string
    }>
}

export default async function TaskDetailPage({ params }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Await params in Next.js 15
    const { taskId, id: projectId } = await params

    const [task, comments, activity, subtasks, members, timeEntries] = await Promise.all([
        getTaskDetails(taskId),
        getTaskComments(taskId),
        getTaskActivity(taskId),
        getSubtasks(taskId),
        getWorkspaceMembers(projectId),
        supabase.from('time_entries').select('duration').eq('task_id', taskId)
    ])

    if (!task) {
        notFound()
    }

    // Calculate total time
    const totalTime = timeEntries.data?.reduce((acc, curr) => acc + (curr.duration || 0), 0) || 0

    return (
        <TaskDetailView
            task={{ ...task, totalTime }}
            comments={comments}
            activity={activity}
            subtasks={subtasks}
            members={members}
            currentUserId={user.id}
        />
    )
}
