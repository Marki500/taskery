'use client'

import { useTimer, formatTime } from "@/contexts/timer-context"
import { motion, AnimatePresence } from "framer-motion"
import { Pause, Play, StopCircle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function FloatingTimer() {
    const { activeTask, totalElapsed, isRunning, pauseTimer, resumeTimer, stopTimer } = useTimer()
    const router = useRouter()

    if (!activeTask) return null

    const handleStop = async () => {
        await stopTimer()
        // Force a full page reload to show updated totalTime
        // Using location.reload because router.refresh doesn't seem to refresh server data properly
        window.location.reload()
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-4 min-w-[280px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Timer className="h-5 w-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs opacity-80 uppercase tracking-wider">En curso</p>
                            <p className="font-semibold truncate">{activeTask.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold font-mono tracking-wider">
                            {formatTime(totalElapsed)}
                        </span>

                        <div className="flex gap-2">
                            {isRunning ? (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 bg-white/20 hover:bg-white/30 text-white"
                                    onClick={pauseTimer}
                                >
                                    <Pause className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 bg-white/20 hover:bg-white/30 text-white"
                                    onClick={resumeTimer}
                                >
                                    <Play className="h-5 w-5" />
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 bg-red-500/50 hover:bg-red-500 text-white"
                                onClick={handleStop}
                            >
                                <StopCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
