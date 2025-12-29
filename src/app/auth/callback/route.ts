import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/projects'

    // Use env var for production, fallback to request origin
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user needs a workspace (new OAuth user)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

                // 1. Ensure profile exists (in case DB trigger didn't run)
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (!existingProfile) {
                    await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            full_name: userName,
                            avatar_url: user.user_metadata?.avatar_url || null
                        })
                }

                // 2. Check if user already has a workspace
                const { data: existingMembership } = await supabase
                    .from('workspace_members')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .single()

                if (!existingMembership) {
                    // Create default workspace for new OAuth user
                    const { data: workspace } = await supabase
                        .from('workspaces')
                        .insert({
                            name: `Workspace de ${userName}`,
                            owner_id: user.id
                        })
                        .select()
                        .single()

                    if (workspace) {
                        await supabase
                            .from('workspace_members')
                            .insert({
                                workspace_id: workspace.id,
                                user_id: user.id,
                                role: 'admin'
                            })
                    }
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
