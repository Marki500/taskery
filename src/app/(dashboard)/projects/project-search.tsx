'use client'

import React from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectSearchProps {
    value: string
    onChange: (value: string) => void
}

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
    return (
        <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar proyectos por nombre..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-10 py-6 text-base rounded-2xl shadow-sm border-muted-foreground/20 focus:border-primary/50 transition-all"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                    onClick={() => onChange('')}
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </Button>
            )}
        </div>
    )
}
