'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { startTimeEntry, stopTimeEntry } from '@/app/(dashboard)/projects/time-actions'
import { toast } from 'sonner'

// Types for the timer context
export interface ActiveTimerTask {
    id: string
    title: string
    projectId: string
    totalTime?: number  // Previously accumulated time in seconds
}

interface TimerContextType {
    activeTask: ActiveTimerTask | null
    activeTimeEntryId: string | null
    elapsedSeconds: number
    totalElapsed: number  // totalTime + elapsedSeconds
    isRunning: boolean
    startTimer: (task: ActiveTimerTask) => Promise<void>
    stopTimer: () => Promise<{ taskId: string; newTotalTime: number } | null>
    pauseTimer: () => void
    resumeTimer: () => void
    lastStoppedTask: { taskId: string; newTotalTime: number } | null
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const [activeTask, setActiveTask] = useState<ActiveTimerTask | null>(null)
    const [activeTimeEntryId, setActiveTimeEntryId] = useState<string | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [baseTotalTime, setBaseTotalTime] = useState(0)  // Previously accumulated time
    const [isRunning, setIsRunning] = useState(false)
    const [lastStoppedTask, setLastStoppedTask] = useState<{ taskId: string; newTotalTime: number } | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    // Interval logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedSeconds(prev => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning])

    const startTimer = useCallback(async (task: ActiveTimerTask) => {
        try {
            // Create time entry in database
            const timeEntry = await startTimeEntry(task.id)
            if (timeEntry) {
                setActiveTimeEntryId(timeEntry.id)
            }
            setActiveTask(task)
            setBaseTotalTime(task.totalTime || 0)  // Store previously accumulated time
            setElapsedSeconds(0)
            setIsRunning(true)
        } catch (error) {
            console.error('Error starting timer:', error)
            toast.error('Error al iniciar el cronómetro')
        }
    }, [])

    const stopTimer = useCallback(async () => {
        if (activeTimeEntryId && elapsedSeconds > 0 && activeTask) {
            try {
                // Save time entry to database
                await stopTimeEntry(activeTimeEntryId, elapsedSeconds)
                toast.success(`Tiempo guardado: ${formatTime(elapsedSeconds)}`)

                // Calculate new total time for the task
                const newTotalTime = (activeTask.totalTime || 0) + elapsedSeconds
                const taskId = activeTask.id

                // Reset state
                setActiveTask(null)
                setActiveTimeEntryId(null)
                setBaseTotalTime(0)
                setElapsedSeconds(0)
                setIsRunning(false)

                // Set last stopped task for listeners
                setLastStoppedTask({ taskId, newTotalTime })

                return { taskId, newTotalTime }
            } catch (error) {
                console.error('Error stopping timer:', error)
                toast.error('Error al guardar el tiempo')
            }
        }

        setActiveTask(null)
        setActiveTimeEntryId(null)
        setBaseTotalTime(0)
        setElapsedSeconds(0)
        setIsRunning(false)
        return null
    }, [activeTimeEntryId, elapsedSeconds, activeTask])

    const pauseTimer = useCallback(() => {
        setIsRunning(false)
    }, [])

    const resumeTimer = useCallback(() => {
        if (activeTask) {
            setIsRunning(true)
        }
    }, [activeTask])

    return (
        <TimerContext.Provider
            value={{
                activeTask,
                activeTimeEntryId,
                elapsedSeconds,
                totalElapsed: baseTotalTime + elapsedSeconds,
                isRunning,
                startTimer,
                stopTimer,
                pauseTimer,
                resumeTimer,
                lastStoppedTask,
            }}
        >
            {children}
        </TimerContext.Provider>
    )
}

export function useTimer() {
    const context = useContext(TimerContext)
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider')
    }
    return context
}

// Helper function to format seconds into HH:MM:SS
export function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
}
