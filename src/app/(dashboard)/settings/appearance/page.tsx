'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Palette, Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function AppearanceSettingsPage() {
    const { theme, setTheme } = useTheme()

    const themes = [
        { value: 'light', label: 'Claro', icon: Sun, description: 'Interfaz clara' },
        { value: 'dark', label: 'Oscuro', icon: Moon, description: 'Interfaz oscura' },
        { value: 'system', label: 'Sistema', icon: Monitor, description: 'Seguir configuración del sistema' },
    ]

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Palette className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>Apariencia</CardTitle>
                            <CardDescription>Personaliza el aspecto de Taskery</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-base font-medium">Tema</Label>
                        <p className="text-sm text-muted-foreground mb-4">Selecciona el tema que prefieras</p>

                        <div className="grid grid-cols-3 gap-4">
                            {themes.map((t) => {
                                const Icon = t.icon
                                const isActive = theme === t.value
                                return (
                                    <button
                                        key={t.value}
                                        onClick={() => setTheme(t.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                            isActive
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-muted-foreground/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center",
                                            isActive ? "bg-primary text-white" : "bg-muted"
                                        )}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium">{t.label}</p>
                                            <p className="text-xs text-muted-foreground">{t.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
