import React from "react"
import { Link } from "react-router-dom"

export default function NavBar({ onLogout }) {
  return (
    <nav className="sticky top-0 z-10 bg-white/5 backdrop-blur border-b border-white/10 shadow-[0_10px_40px_-20px_rgba(59,162,237,0.25)] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="shrink-0">
          <img src="/Taskery-logo.webp" alt="Taskery Logo" className="h-8" />
        </Link>
        <div className="flex gap-4 text-sm">
          <Link className="hover:text-sky-400" to="/">Tablero</Link>
          <Link className="hover:text-sky-400" to="/empresas">Empresas</Link>
          <Link className="hover:text-sky-400" to="/proyectos">Proyectos</Link>
        </div>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
        >
          Cerrar sesión
        </button>
      )}
    </nav>
  )
}
