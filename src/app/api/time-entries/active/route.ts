import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the active (running) timer for the current user
    const activeEntry = await prisma.timeEntry.findFirst({
        where: {
            userId: session.userId,
            endTime: null,
        },
        orderBy: { startTime: 'desc' },
        select: { id: true, startTime: true },
    })

    return NextResponse.json({ activeEntry })
}
