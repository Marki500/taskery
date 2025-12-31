'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.5
            }}
            className="h-full w-full"
        >
            {children}
        </motion.div>
    )
}
