import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-6xl font-extrabold tracking-tight">
          Taskery
        </h1>
        <p className="text-xl text-gray-400">
          Gestión de proyectos y seguimiento de tiempo para equipos ágiles.
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="border-white text-black hover:bg-gray-900 hover:text-white">
              Crear Cuenta
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
