'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Clock, Play } from "lucide-react"

export default function TrackingPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    <Timer className="h-10 w-10 text-primary" />
                    Tracking
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                    Gestiona el tiempo dedicado a tus tareas
                </p>
            </div>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Historial de Tiempo
                    </CardTitle>
                    <CardDescription>
                        Aquí aparecerán tus sesiones de trabajo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p>No has registrado ninguna sesión todavía.</p>
                        <p className="text-sm mt-2">Inicia el timer en cualquier tarea para empezar.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
