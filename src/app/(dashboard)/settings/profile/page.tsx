import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "./profile-form"
import { User } from "lucide-react"

export default async function ProfileSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>Perfil</CardTitle>
                            <CardDescription>Tu información personal</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProfileForm
                        initialUser={{
                            id: user.id,
                            email: user.email || '',
                            full_name: profile?.full_name || '',
                            avatar_url: profile?.avatar_url || ''
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
