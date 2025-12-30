'use client'

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    FolderKanban,
    Timer,
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCircle,
    LayoutDashboard
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { WorkspaceSelector } from "./workspace-selector"
import { NotificationBell } from "@/components/notifications/notification-bell"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FolderKanban, label: "Proyectos", href: "/projects" },
    { icon: Timer, label: "Tracking", href: "/tracking" },
    { icon: Settings, label: "Configuración", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const toggleCollapse = () => setIsCollapsed(!isCollapsed)

    const NavItem = ({ item, collapsed }: { item: typeof sidebarItems[0], collapsed: boolean }) => {
        const isActive = pathname === item.href
        return (
            <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group",
                    isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                )}
            >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap overflow-hidden"
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        )
    }

    const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className="flex flex-col h-full bg-background border-r">
            {/* Header */}
            <div className={cn("h-16 flex items-center border-b px-4 transition-all", collapsed ? "justify-center" : "justify-between")}>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Taskery</span>
                    </motion.div>
                )}
                {!collapsed && <NotificationBell />}
                {collapsed && (
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                        <span className="text-white font-bold text-lg">T</span>
                    </div>
                )}
            </div>

            {/* Workspace Selector */}
            <div className="px-3 py-2 border-b">
                <WorkspaceSelector collapsed={collapsed} />
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto px-3">

                {/* Search Placeholder (Optional) */}
                {!collapsed && (
                    <div className="mb-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-muted/50 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                )}


                <nav className="grid gap-1">
                    {sidebarItems.map((item, index) => (
                        <NavItem key={index} item={item} collapsed={collapsed} />
                    ))}
                </nav>
            </div>

            {/* User Footer */}
            <div className="p-3 border-t">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn("w-full justify-start p-2 h-auto hover:bg-muted", collapsed && "justify-center")}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-9 w-9 border-2 border-background shadow-sm hover:scale-105 transition-transform">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium">YO</AvatarFallback>
                                </Avatar>
                                {!collapsed && (
                                    <div className="flex flex-col items-start text-sm truncate">
                                        <span className="font-semibold text-foreground">Mi Cuenta</span>
                                        <span className="text-xs text-muted-foreground">Pro Plan</span>
                                    </div>
                                )}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" alignOffset={10} className="w-56 mb-2">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Collapse Toggle (Desktop only) */}
            <div className="hidden md:flex justify-end p-2 border-t bg-muted/20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapse}
                    className="h-8 w-8 p-0 hover:bg-accent"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

        </div>
    )

    return (
        <>
            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-50 bg-background/80 backdrop-blur-sm border shadow-sm">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent collapsed={false} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar (Animated) */}
            <motion.div
                className="hidden md:flex h-screen flex-col sticky top-0 bg-background z-40 shadow-sm border-r" // "sticky" helps it stay in view if we scroll layout? No, h-screen means it doesn't scroll naturally.
                initial={{ width: 256 }}
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
            >
                <SidebarContent collapsed={isCollapsed} />
            </motion.div>
        </>
    )
}
