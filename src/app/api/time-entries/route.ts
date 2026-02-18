import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'today'

    let startDate: Date | undefined
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (range === 'today') {
        startDate = now
    } else if (range === 'week') {
        const day = now.getDay()
        const sunday = new Date(now)
        sunday.setDate(now.getDate() - day)
        startDate = sunday
    } else if (range === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    // 'all' -> no startDate filter

    const entries = await prisma.timeEntry.findMany({
        where: {
            userId: session.userId,
            endTime: { not: null },
            ...(startDate ? { startTime: { gte: startDate } } : {}),
        },
        include: {
            category: {
                select: { name: true, color: true },
            },
        },
        orderBy: { endTime: 'desc' },
    })

    return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const entry = await prisma.timeEntry.create({
        data: {
            userId: session.userId,
            startTime: new Date(),
            description: body.description || 'Untitled Task',
            categoryId: body.categoryId || null,
        },
        select: { id: true },
    })

    return NextResponse.json(entry)
}
