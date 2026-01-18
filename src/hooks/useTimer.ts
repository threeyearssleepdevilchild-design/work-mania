import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useTimer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [seconds, setSeconds] = useState(0)
    /* Hook state now uses string ID for UUID compatibility */
    const [entryId, setEntryId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const supabase = createClient()

    // 初期ロード時：未完了のタイマーがあれば復元
    useEffect(() => {
        const fetchActiveTimer = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user) {
                    setIsLoading(false)
                    return
                }

                const { data, error } = await supabase
                    .from('time_entries')
                    .select('id, start_time')
                    .eq('user_id', user.id)
                    .is('end_time', null)
                    .order('start_time', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (data) {
                    const startTime = new Date(data.start_time).getTime()
                    const now = new Date().getTime()
                    const elapsed = Math.floor((now - startTime) / 1000)

                    setSeconds(elapsed >= 0 ? elapsed : 0)
                    setEntryId(data.id)
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

    // 引数を追加: description, categoryId
    const startTimer = useCallback(async (description?: string, categoryId?: string | null) => {
        try {
            setIsLoading(true)
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error('User not found')

            const startTime = new Date().toISOString()

            const { data, error } = await supabase
                .from('time_entries')
                .insert({
                    user_id: user.id,
                    start_time: startTime,
                    description: description || 'Untitled Task', // カラム名を description に変更
                    category_id: categoryId || null, // UUIDなのでそのまま渡す (nullチェックのみ)
                })
                .select('id')
                .single()

            if (error) throw error

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

            const { error } = await supabase
                .from('time_entries')
                .update({
                    end_time: endTime,
                    duration: seconds,
                })
                .eq('id', entryId)

            if (error) throw error

            setIsPlaying(false)
            setEntryId(null)
            setSeconds(0)
        } catch (error) {
            console.error('Error stopping timer:', error)
        } finally {
            setIsLoading(false)
        }
    }, [entryId, seconds])

    // toggleTimer も引数を受け取るように変更
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
