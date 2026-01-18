'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
        return redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const employeeId = formData.get('employee_id') as string
    const password = formData.get('password') as string

    // Append dummy domain to create email
    const email = `${employeeId}@workmania.local`

    const { error } = await supabase.auth.signUp({
        email,
        password,
        // Email confirmation is disabled, so we don't need emailRedirectTo
    })

    if (error) {
        return redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Sign up successful')
}
