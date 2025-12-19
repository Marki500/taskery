"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pause, Play, StopCircle } from "lucide-react"

export function ActiveTask() {
    return (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        En curso - Proyecto "Taskery"
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight">
                        Implementar Widgets del Dashboard
                    </h3>
                    <p className="text-muted-foreground font-mono">
                        00:45:12
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-10 w-10">
                        <Pause className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-10 w-10">
                        <StopCircle className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
