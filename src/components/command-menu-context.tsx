"use client"

import * as React from "react"

interface CommandMenuContextType {
    open: boolean
    setOpen: (open: boolean) => void
    toggle: () => void
}

const CommandMenuContext = React.createContext<CommandMenuContextType | undefined>(undefined)

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)

    const toggle = React.useCallback(() => {
        setOpen((prev) => !prev)
    }, [])

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggle()
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [toggle])

    return (
        <CommandMenuContext.Provider value={{ open, setOpen, toggle }}>
            {children}
        </CommandMenuContext.Provider>
    )
}

export function useCommandMenu() {
    const context = React.useContext(CommandMenuContext)
    if (!context) {
        throw new Error("useCommandMenu must be used within a CommandMenuProvider")
    }
    return context
}
