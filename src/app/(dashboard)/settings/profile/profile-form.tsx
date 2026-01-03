'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile, uploadAvatar } from '@/app/(dashboard)/settings/actions'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileFormProps {
    initialUser: {
        id: string
        email: string
        full_name?: string
        avatar_url?: string
    }
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar_url)

    const handleProfileUpdate = async (formData: FormData) => {
        setLoading(true)
        const result = await updateProfile(formData)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Perfil actualizado correctamente')
            router.refresh()
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('avatar', file)

        setUploading(true)
        const result = await uploadAvatar(formData)
        setUploading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            setAvatarUrl(result.avatarUrl)
            toast.success('Avatar actualizado')
            router.refresh()
        }
    }

    return (
        <div className="space-y-8 max-w-xl">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:flex-row gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-950 shadow-xl">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                            {initialUser.full_name?.[0] || initialUser.email[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-8 w-8 text-white" />
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 rounded-full bg-white/50 dark:bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                    <h3 className="font-semibold text-lg">Foto de Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                        Haz clic en la imagen para subir una nueva foto.
                        <br />Soporta JPG, PNG o GIF.
                    </p>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* Form Section */}
            <form action={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        value={initialUser.email}
                        disabled
                        className="bg-slate-50 dark:bg-slate-900 text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={initialUser.full_name || ''}
                        placeholder="Tu nombre"
                        className="h-11"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[140px]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    )
}
