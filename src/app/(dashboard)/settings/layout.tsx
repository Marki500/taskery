import { SettingsNav } from "./settings-nav"

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground text-lg mt-1">
                    Gestiona tu cuenta y preferencias
                </p>
            </div>

            <div className="flex gap-8">
                {/* Settings Navigation */}
                <aside className="w-64 shrink-0">
                    <div className="sticky top-8">
                        <SettingsNav />
                    </div>
                </aside>

                {/* Settings Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
