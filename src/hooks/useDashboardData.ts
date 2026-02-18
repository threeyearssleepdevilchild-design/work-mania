import { useState, useEffect } from 'react'

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

export type DashboardRange = 'today' | 'week' | 'month' | 'all';

// API response type
type TimeEntryResponse = {
    id: string
    description: string | null
    duration: number | null
    endTime: string | null
    startTime: string
    categoryId: string | null
    category: {
        name: string
        color: string
    } | null
}

export function useDashboardData() {
    const [totalTime, setTotalTime] = useState("00:00:00")
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [logs, setLogs] = useState<LogData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [range, setRange] = useState<DashboardRange>('today')

    const fetchData = async () => {
        try {
            setIsLoading(true)

            const res = await fetch(`/api/time-entries?range=${range}`)
            if (!res.ok) return

            const entries: TimeEntryResponse[] = await res.json()

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
                const catName = entry.category?.name || "未分類"
                const catColor = entry.category?.color || "#64748b"

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

                const dateObj = new Date(entry.endTime!)
                const isToday = new Date().toDateString() === dateObj.toDateString();
                const dateString = isToday
                    ? `今日 ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

                return {
                    id: entry.id,
                    title: entry.description || "名称未設定のタスク",
                    category: entry.category?.name || "未分類",
                    time: timeStr,
                    date: dateString,
                    color: entry.category?.color || "#64748b",
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
    }, [range])

    const deleteLog = async (id: string) => {
        try {
            const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete failed')
            fetchData()
        } catch (error) {
            console.error("Error deleting log:", error)
        }
    }

    const updateLog = async (id: string, updates: { title?: string, categoryId?: string | null, duration?: number }) => {
        try {
            const payload: Record<string, unknown> = {}
            if (updates.title !== undefined) payload.description = updates.title
            if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId
            if (updates.duration !== undefined) payload.duration = updates.duration

            const res = await fetch(`/api/time-entries/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('Update failed')
            fetchData()
        } catch (error) {
            console.error("Error updating log:", error)
        }
    }

    return { totalTime, chartData, logs, isLoading, deleteLog, updateLog, refreshLogs: fetchData, range, setRange }
}
