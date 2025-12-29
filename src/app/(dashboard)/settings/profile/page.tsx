import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Camera } from "lucide-react"

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
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {profile?.full_name?.[0] || user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm">
                                <Camera className="h-4 w-4 mr-2" />
                                Cambiar foto
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">JPG, PNG. Máximo 2MB</p>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                            <Label htmlFor="full-name">Nombre completo</Label>
                            <Input
                                id="full-name"
                                defaultValue={profile?.full_name || ''}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                defaultValue={user.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                        </div>

                        <Button className="w-fit">
                            Guardar cambios
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
