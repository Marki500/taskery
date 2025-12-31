import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { WorkspaceSettings } from "./workspace-settings"
import { getActiveWorkspace, getWorkspaceMembersWithDetails } from "@/app/(dashboard)/workspaces/actions"
import { getWorkspaceInvitations, getAcceptedInvitations } from "@/app/(dashboard)/workspaces/invitation-actions"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const workspace = await getActiveWorkspace()

    if (!workspace) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No tienes ningún workspace. Crea uno desde la sidebar.</p>
            </div>
        )
    }

    const [members, invitations, acceptedInvitations] = await Promise.all([
        getWorkspaceMembersWithDetails(workspace.id),
        getWorkspaceInvitations(workspace.id),
        getAcceptedInvitations(workspace.id)
    ])

    return (
        <WorkspaceSettings
            workspace={workspace}
            members={members}
            currentUserId={user.id}
            pendingInvitations={invitations}
            acceptedInvitations={acceptedInvitations}
        />
    )
}
