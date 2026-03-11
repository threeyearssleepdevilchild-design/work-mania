import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [entryId, setEntryId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    // 開始時刻をrefで保持（Date.now()のミリ秒）
    const startTimeRef = useRef<number | null>(null)

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
                    const now = Date.now()
                    const elapsed = Math.floor((now - startTime) / 1000)

                    startTimeRef.current = startTime
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

    // タイマーのカウントアップ（開始時刻との差分で計算）
    useEffect(() => {
        if (isPlaying && startTimeRef.current !== null) {
            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000)
                setSeconds(elapsed >= 0 ? elapsed : 0)
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

            startTimeRef.current = Date.now()
            setEntryId(data.id)
            setSeconds(0)
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

            // duration はサーバー側で startTime と endTime から計算するので送らない
            const res = await fetch(`/api/time-entries/${entryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endTime }),
            })

            if (!res.ok) throw new Error('Failed to stop timer')

            setIsPlaying(false)
            setEntryId(null)
            setSeconds(0)
            startTimeRef.current = null
        } catch (error) {
            console.error('Error stopping timer:', error)
        } finally {
            setIsLoading(false)
        }
    }, [entryId])

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
