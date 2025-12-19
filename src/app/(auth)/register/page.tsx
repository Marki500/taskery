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
import { signup } from "../actions"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 letras"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
})

export default function RegisterPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        formData.append("email", values.email)
        formData.append("password", values.password)
        formData.append("fullName", values.fullName)

        const result = await signup(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Cuenta creada", {
                description: "Revisa tu email si es necesario."
            })
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 dark:bg-zinc-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Unirse a Taskery</CardTitle>
                    <CardDescription>
                        Crea una cuenta para empezar a colaborar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre Completo</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Juan Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <Button type="submit" className="w-full">Crear Cuenta</Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 hover:underline">Inicia Sesión</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
