import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [entryId, setEntryId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // 初期ロード時：未完了のタイマーがあれば復元
    useEffect(() => {
        const fetchActiveTimer = async () => {
            try {
                const res = await fetch('/api/time-entries/active')
                if (!res.ok) {
                    setIsLoading(false)
                    return
                }

                const { activeEntry } = await res.json()

                if (activeEntry) {
                    const startTime = new Date(activeEntry.startTime).getTime()
                    const now = new Date().getTime()
                    const elapsed = Math.floor((now - startTime) / 1000)

                    setSeconds(elapsed >= 0 ? elapsed : 0)
                    setEntryId(activeEntry.id)
                    setIsPlaying(true)
                }
            } catch (error) {
                console.error('Error fetching active timer:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchActiveTimer()
    }, [])

    // タイマーのカウントアップ
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setSeconds((s) => s + 1)
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
    }, [isPlaying])

    const startTimer = useCallback(async (description?: string, categoryId?: string | null) => {
        try {
            setIsLoading(true)

            const res = await fetch('/api/time-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description || 'Untitled Task',
                    categoryId: categoryId || null,
                }),
            })

            if (!res.ok) throw new Error('Failed to start timer')

            const data = await res.json()

            setEntryId(data.id)
            setIsPlaying(true)
        } catch (error) {
            console.error('Error starting timer:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const stopTimer = useCallback(async () => {
        if (!entryId) return

        try {
            setIsLoading(true)
            const endTime = new Date().toISOString()

            const res = await fetch(`/api/time-entries/${entryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endTime,
                    duration: seconds,
                }),
            })

            if (!res.ok) throw new Error('Failed to stop timer')

            setIsPlaying(false)
            setEntryId(null)
            setSeconds(0)
        } catch (error) {
            console.error('Error stopping timer:', error)
        } finally {
            setIsLoading(false)
        }
    }, [entryId, seconds])

    const toggleTimer = useCallback((description?: string, categoryId?: string | null) => {
        if (isPlaying) {
            stopTimer()
        } else {
            startTimer(description, categoryId)
        }
    }, [isPlaying, startTimer, stopTimer])

    return {
        isPlaying,
        seconds,
        isLoading,
        toggleTimer,
    }
}
