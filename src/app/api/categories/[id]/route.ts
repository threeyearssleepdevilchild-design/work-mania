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
    const existing = await prisma.category.findFirst({
        where: { id, userId: session.userId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.isArchived !== undefined) updateData.isArchived = body.isArchived
    if (body.name !== undefined) updateData.name = body.name
    if (body.color !== undefined) updateData.color = body.color

    const updated = await prisma.category.update({
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

    const existing = await prisma.category.findFirst({
        where: { id, userId: session.userId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    try {
        await prisma.category.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: '使用中のカテゴリは削除できません' },
            { status: 400 }
        )
    }
}
