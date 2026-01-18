import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export type ChartData = {
    name: string
    value: number
    color: string
}

export type LogData = {
    id: string
    title: string
    category: string
    time: string
    date: string
    color: string
    duration: number
}

// Helper type for the joined data
type TimeEntryWithCategory = {
    id: string
    description: string | null
    duration: number | null
    end_time: string | null
    start_time: string
    category_id: string | null
    categories: {
        name: string
        color: string
    } | null
}

export type DashboardRange = 'today' | 'week' | 'month' | 'all';

export function useDashboardData() {
    const [totalTime, setTotalTime] = useState("00:00:00")
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [logs, setLogs] = useState<LogData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [range, setRange] = useState<DashboardRange>('today')
    const supabase = createClient()

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Calculate Start Date based on Range
            let startDate: string | null = null
            const now = new Date()
            now.setHours(0, 0, 0, 0)

            if (range === 'today') {
                startDate = now.toISOString()
            } else if (range === 'week') {
                // Start of current week (Sunday)
                const day = now.getDay()
                const sunday = new Date(now)
                sunday.setDate(now.getDate() - day)
                startDate = sunday.toISOString()
            } else if (range === 'month') {
                // Start of current month
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                startDate = firstDay.toISOString()
            }
            // 'all' -> startDate remains null

            let query = supabase
                .from('time_entries')
                .select('*, categories(name, color)') // Join categories
                .eq('user_id', user.id)
                .not('end_time', 'is', null)
                .order('end_time', { ascending: false })

            if (startDate) {
                query = query.gte('start_time', startDate)
            }

            const { data, error } = await query

            if (error) throw error
            if (!data) return

            const entries = data as unknown as TimeEntryWithCategory[]

            // ... (rest of the processing logic remains the same)
            // Need to copy the processing logic here because replace_file matches a block.
            // Since the original code inside fetchData is quite long, I should include it or replace carefully.
            // But wait, the previous tool call replaced the WHOLE function body in reconstruction.
            // I should probably just replace the beginning of fetchData and the query part.

            // 1. Calculate Total Time
            const totalSeconds = entries.reduce((acc, entry) => acc + (entry.duration || 0), 0)
            const h = Math.floor(totalSeconds / 3600)
            const m = Math.floor((totalSeconds % 3600) / 60)
            const s = totalSeconds % 60
            setTotalTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)

            // 2. Aggregate for Pie Chart
            const categoryMap = new Map<string, number>()
            const colorMap = new Map<string, string>()

            entries.forEach(entry => {
                const catName = entry.categories?.name || "未分類"
                const catColor = entry.categories?.color || "#64748b"

                const currentVal = categoryMap.get(catName) || 0
                categoryMap.set(catName, currentVal + (entry.duration || 0))
                colorMap.set(catName, catColor)
            })

            const newChartData: ChartData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
                name,
                value,
                color: colorMap.get(name) || "#64748b"
            }))

            setChartData(newChartData)

            // 3. Format Logs
            const newLogs: LogData[] = entries.map(entry => {
                const duration = entry.duration || 0
                let timeStr = ""
                if (duration >= 3600) {
                    timeStr = `${Math.floor(duration / 3600)}時間 ${Math.floor((duration % 3600) / 60)}分`
                } else if (duration >= 60) {
                    timeStr = `${Math.floor(duration / 60)}分`
                } else {
                    timeStr = `${duration}秒`
                }

                const dateObj = new Date(entry.end_time!)
                // Date display format depends on range?
                // If 'all' or 'month', showing just time "10:00" might be confusing.
                // Should show date as well like "1/19 10:00".
                // Let's make it smart.
                const isToday = new Date().toDateString() === dateObj.toDateString();
                const dateString = isToday
                    ? `今日 ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                return {
                    id: entry.id,
                    title: entry.description || "名称未設定のタスク",
                    category: entry.categories?.name || "未分類",
                    time: timeStr,
                    date: dateString,
                    color: entry.categories?.color || "#64748b",
                    duration: duration
                }
            })
            setLogs(newLogs)

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [range]) // Refetch when range changes

    // ... (deleteLog and updateLog logic remains same)

    // Need to include them because I'm replacing the whole function body or top part?
    // The target is `export function useDashboardData() { ... }` until `return ...`
    // I'll replace from line 34 to 125 (end of fetchData).

    const deleteLog = async (id: string) => {
        try {
            const { error } = await supabase
                .from('time_entries')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchData()
        } catch (error) {
            console.error("Error deleting log:", error)
        }
    }

    const updateLog = async (id: string, updates: { title?: string, categoryId?: string | null, duration?: number }) => {
        try {
            const payload: any = {}
            if (updates.title !== undefined) payload.description = updates.title
            if (updates.categoryId !== undefined) payload.category_id = updates.categoryId
            if (updates.duration !== undefined) payload.duration = updates.duration

            const { error } = await supabase
                .from('time_entries')
                .update(payload)
                .eq('id', id)

            if (error) throw error
            fetchData()
        } catch (error) {
            console.error("Error updating log:", error)
        }
    }

    return { totalTime, chartData, logs, isLoading, deleteLog, updateLog, refreshLogs: fetchData, range, setRange }
}
