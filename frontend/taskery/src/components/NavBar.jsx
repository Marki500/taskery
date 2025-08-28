import React from 'react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex gap-4">
      <Link className="hover:text-sky-400" to="/">Tablero</Link>
      <Link className="hover:text-sky-400" to="/empresas">Empresas</Link>
      <Link className="hover:text-sky-400" to="/proyectos">Proyectos</Link>
    </nav>
  )
}
