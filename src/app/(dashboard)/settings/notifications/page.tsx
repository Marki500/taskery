import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Mail, MessageSquare, Clock } from "lucide-react"

export default function NotificationsSettingsPage() {
    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Bell className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>Configura cómo quieres recibir alertas</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label className="font-medium">Notificaciones por email</Label>
                                    <p className="text-sm text-muted-foreground">Recibe un resumen diario por correo</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label className="font-medium">Menciones</Label>
                                    <p className="text-sm text-muted-foreground">Cuando alguien te mencione en una tarea</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label className="font-medium">Recordatorios de deadline</Label>
                                    <p className="text-sm text-muted-foreground">1 día antes de que venza una tarea</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
