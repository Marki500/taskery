'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    const fullName = formData.get('fullName') as string

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Error updating profile' }
    }

    revalidatePath('/settings/profile')
    return { success: true }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    const file = formData.get('avatar') as File
    if (!file) {
        return { error: 'No file uploaded' }
    }

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return { error: 'Error uploading avatar' }
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    // 3. Update Profile with new URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error updating profile with avatar:', updateError)
        return { error: 'Error updating profile' }
    }

    revalidatePath('/settings/profile')
    revalidatePath('/', 'layout') // Revalidate layout to update avatar in sidebar/header
    return { success: true, avatarUrl: publicUrl }
}
