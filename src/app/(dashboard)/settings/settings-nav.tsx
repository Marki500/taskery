'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, User, Bell, Palette, Shield } from "lucide-react"

const settingsNav = [
    { href: '/settings', label: 'Workspace', icon: Building2, description: 'Equipo y miembros' },
    { href: '/settings/profile', label: 'Perfil', icon: User, description: 'Tu información personal' },
    { href: '/settings/notifications', label: 'Notificaciones', icon: Bell, description: 'Alertas y avisos' },
    { href: '/settings/appearance', label: 'Apariencia', icon: Palette, description: 'Tema y personalización' },
]

export function SettingsNav() {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            {settingsNav.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                        <div>
                            <p className={cn("font-medium", isActive && "text-primary")}>{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}
