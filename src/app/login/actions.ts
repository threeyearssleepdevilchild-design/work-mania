'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const employeeId = formData.get('employee_id') as string
    const password = formData.get('password') as string

    // Append dummy domain to create email
    const email = `${employeeId}@workmania.local`

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent('氏名コードもしくはパスワードが違います')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const employeeId = formData.get('employee_id') as string
    const password = formData.get('password') as string

    // Append dummy domain to create email
    const email = `${employeeId}@workmania.local`

    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
            },
        })

        if (error) {
            console.error("Signup Error:", error)
            return redirect(`/login?error=${encodeURIComponent('ユーザー認証に失敗しました。すでに登録されている可能性があります。')}`)
        }
    } catch (e) {
        // Redirect throws an error, so we must rethrow it if it's a redirect
        if ((e as Error).message === 'NEXT_REDIRECT') {
            throw e
        }
        console.error("Unexpected Signup Error:", e)
        return redirect(`/login?error=${encodeURIComponent('予期せぬエラーが発生しました')}`)
    }

    revalidatePath('/', 'layout')
    redirect(`/login?message=${encodeURIComponent('新規登録完了。氏名コードとパスワードを入力してログインしてください')}`)
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
