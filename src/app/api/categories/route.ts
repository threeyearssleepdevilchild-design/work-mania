import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
        where: { userId: session.userId },
        orderBy: [
            { isArchived: 'asc' },
            { createdAt: 'asc' },
        ],
    })

    return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const category = await prisma.category.create({
        data: {
            userId: session.userId,
            name: body.name,
            color: body.color,
        },
    })

    return NextResponse.json(category)
}
