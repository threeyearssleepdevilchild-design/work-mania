import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await prisma.timeEntry.findFirst({
        where: { id, userId: session.userId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.endTime !== undefined) updateData.endTime = body.endTime ? new Date(body.endTime) : null
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.description !== undefined) updateData.description = body.description
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId

    const updated = await prisma.timeEntry.update({
        where: { id },
        data: updateData,
    })

    return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await getSession()
    if (!session.isLoggedIn) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.timeEntry.findFirst({
        where: { id, userId: session.userId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.timeEntry.delete({ where: { id } })

    return NextResponse.json({ success: true })
}
