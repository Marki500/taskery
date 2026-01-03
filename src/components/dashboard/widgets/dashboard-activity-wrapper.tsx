import { createClient } from "@/utils/supabase/server"
import { ActivityFeed } from "@/components/dashboard/widgets/activity-feed"
import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export async function DashboardActivityWrapper({ userId }: { userId: string }) {
    const supabase = await createClient()

    // Get the first workspace
    const { data: membership } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .limit(1)
        .single()

    if (!membership) {
        return (
            <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Activity className="h-8 w-8 mb-2 opacity-50" />
                    <p>No tienes workspaces activos</p>
                </CardContent>
            </Card>
        )
    }

    return <ActivityFeed workspaceId={membership.workspace_id} />
}
