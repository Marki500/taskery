'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/projects')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin') || 'http://localhost:3000'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `http://localhost:3000/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    // If Supabase returns a session, they are logged in (Auto Confirm is ON)
    const { data } = await supabase.auth.getSession()
    if (data.session) {
        revalidatePath('/', 'layout')
        redirect('/projects')
    }

    // If no session, it means they need to confirm email
    return { success: true }
}
