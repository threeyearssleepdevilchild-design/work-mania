import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'all'
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    let startDate: Date | undefined
    let endDate: Date | undefined
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (fromParam && toParam) {
        // カスタム日付範囲
        startDate = new Date(fromParam)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(toParam)
        endDate.setHours(23, 59, 59, 999)
    } else if (range === 'today') {
        startDate = now
    } else if (range === 'week') {
        const day = now.getDay()
        const sunday = new Date(now)
        sunday.setDate(now.getDate() - day)
        startDate = sunday
    } else if (range === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId: session.userId,
            endTime: { not: null },
            ...(startDate ? { startTime: { gte: startDate } } : {}),
            ...(endDate ? { startTime: { lte: endDate } } : {}),
        },
        include: {
            category: {
                select: { name: true },
            },
        },
        orderBy: { startTime: 'asc' },
    })

    // CSV ヘッダー
    const BOM = '\uFEFF' // Excel で日本語を正しく表示するため
    const header = '日付,開始時間,終了時間,タスク名,カテゴリ,作業時間(分),作業時間(時間)'

    const rows = entries.map(entry => {
        const start = new Date(entry.startTime)
        const end = entry.endTime ? new Date(entry.endTime) : null

        const dateStr = `${start.getFullYear()}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getDate().toString().padStart(2, '0')}`
        const startTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
        const endTimeStr = end
            ? `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`
            : ''

        const durationMin = entry.duration ? Math.round(entry.duration / 60 * 100) / 100 : 0
        const durationHour = entry.duration ? Math.round(entry.duration / 3600 * 100) / 100 : 0

        // CSV のフィールド内にカンマや改行を含む可能性があるのでダブルクォートで囲む
        const description = `"${(entry.description || '名称未設定').replace(/"/g, '""')}"`
        const category = `"${(entry.category?.name || '未分類').replace(/"/g, '""')}"`

        return `${dateStr},${startTimeStr},${endTimeStr},${description},${category},${durationMin},${durationHour}`
    })

    const csv = BOM + header + '\n' + rows.join('\n')

    // ファイル名に期間を含める
    let filenameLabel: string
    if (fromParam && toParam) {
        filenameLabel = `${fromParam}_${toParam}`
    } else {
        const rangeLabel: Record<string, string> = {
            today: '今日',
            week: '今週',
            month: '今月',
            all: '全期間',
        }
        filenameLabel = rangeLabel[range] || '全期間'
    }
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const filename = `作業記録_${filenameLabel}_${todayStr}.csv`

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        },
    })
}

