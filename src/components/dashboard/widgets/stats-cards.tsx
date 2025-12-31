import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Clock, Zap } from "lucide-react"

const stats = [
    {
        title: "Tareas Completadas",
        value: "12",
        subtitle: "+2 desde ayer",
        icon: CheckCircle2,
        gradient: "from-indigo-500 to-purple-600",
        bgLight: "bg-indigo-50 dark:bg-indigo-950/30"
    },
    {
        title: "Tiempo Enfocado",
        value: "4h 30m",
        subtitle: "+10% vs semana pasada",
        icon: Clock,
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
        title: "Productividad",
        value: "92%",
        subtitle: "Nivel \"Flow State\" 🧘",
        icon: Zap,
        gradient: "from-amber-500 to-orange-600",
        bgLight: "bg-amber-50 dark:bg-amber-950/30"
    }
]

export function StatsCards() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                        <div className="flex items-stretch">
                            {/* Icon Side */}
                            <div className={`flex items-center justify-center p-6 bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className="h-8 w-8 text-white" />
                            </div>
                            {/* Content Side */}
                            <div className={`flex-1 p-5 ${stat.bgLight}`}>
                                <p className="text-base font-bold text-muted-foreground uppercase tracking-widest">
                                    {stat.title}
                                </p>
                                <p className="text-5xl font-black mt-1">
                                    {stat.value}
                                </p>
                                <p className="text-base text-muted-foreground mt-2 font-medium">
                                    {stat.subtitle}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
