'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "../actions"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export default function LoginPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("email", values.email)
        formData.append("password", values.password)

        const result = await login(formData)
        if (result?.error) {
            toast.error(result.error)
        }
    }

    const handleOAuth = async (provider: 'google' | 'github') => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Bienvenido a Taskery</CardTitle>
                    <CardDescription>
                        Inicia sesión para gestionar tus proyectos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <Button variant="outline" onClick={() => handleOAuth('google')}>
                            Google
                        </Button>
                        <Button variant="outline" onClick={() => handleOAuth('github')}>
                            GitHub
                        </Button>
                    </div>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                O continúa con email
                            </span>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="tu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">Entrar</Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">
                        ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:underline">Regístrate</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
