'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function login(formData: FormData) {
    const employeeId = formData.get('employee_id') as string

    if (!employeeId || employeeId.trim() === '') {
        redirect(`/login?error=${encodeURIComponent('氏名コードを入力してください')}`)
    }

    const trimmedId = employeeId.trim()

    let user
    try {
        // DBでユーザーを検索
        user = await prisma.user.findUnique({
            where: { employeeId: trimmedId },
        })
    } catch (error) {
        console.error('Database error during login:', error)
        redirect(`/login?error=${encodeURIComponent('データベース接続エラーが発生しました。しばらくしてから再度お試しください。')}`)
    }

    if (!user) {
        redirect(`/login?error=${encodeURIComponent('登録されていない氏名コードです。管理者にお問い合わせください。')}`)
    }

    try {
        // セッションにユーザー情報を保存
        const session = await getSession()
        session.userId = user.id
        session.employeeId = user.employeeId
        session.isLoggedIn = true
        await session.save()
    } catch (error) {
        console.error('Session save error during login:', error)
        redirect(`/login?error=${encodeURIComponent('ログイン処理中にエラーが発生しました。再度お試しください。')}`)
    }

    redirect('/')
}

export async function signOut() {
    const session = await getSession()
    session.destroy()
    redirect('/login')
}

