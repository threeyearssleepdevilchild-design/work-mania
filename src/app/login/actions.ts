'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function login(formData: FormData) {
    const employeeId = formData.get('employee_id') as string

    if (!employeeId || employeeId.trim() === '') {
        return redirect(`/login?error=${encodeURIComponent('氏名コードを入力してください')}`)
    }

    const trimmedId = employeeId.trim()

    // DBでユーザーを検索
    const user = await prisma.user.findUnique({
        where: { employeeId: trimmedId },
    })

    if (!user) {
        return redirect(`/login?error=${encodeURIComponent('登録されていない氏名コードです。管理者にお問い合わせください。')}`)
    }

    // セッションにユーザー情報を保存
    const session = await getSession()
    session.userId = user.id
    session.employeeId = user.employeeId
    session.isLoggedIn = true
    await session.save()

    redirect('/')
}

export async function signOut() {
    const session = await getSession()
    session.destroy()
    redirect('/login')
}
