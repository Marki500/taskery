'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notification {
    id: string
    userId: string
    type: string
    title: string
    message: string | null
    link: string | null
    data: Record<string, any> | null
    readAt: string | null
    createdAt: string
}

/**
 * Get unread notifications count for the current user
 */
export async function getUnreadNotificationsCount(): Promise<number> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null)

    return count || 0
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(limit = 20): Promise<Notification[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error || !data) return []

    return data.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        data: n.data,
        readAt: n.read_at,
        createdAt: n.created_at,
    }))
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

    revalidatePath('/', 'layout')
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<void> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)

    revalidatePath('/', 'layout')
}

/**
 * Create a notification for a user (internal use)
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
    data,
}: {
    userId: string
    type: string
    title: string
    message?: string
    link?: string
    data?: Record<string, any>
}): Promise<void> {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message: message || null,
            link: link || null,
            data: data || null,
        })
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

    revalidatePath('/', 'layout')
}
