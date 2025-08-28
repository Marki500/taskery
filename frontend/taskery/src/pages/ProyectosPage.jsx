// src/pages/ProyectosPage.jsx
import React, { useEffect, useState } from 'react'
import { listarProyectosPorEmpresa, listarProyectos, invitarUsuarioAProyecto } from '@/services/proyectos'
import ProyectoModal from '@/components/ProyectoModal'
import InviteModal from '@/components/InviteModal'
import { Pencil } from 'lucide-react'
import NavBar from '@/components/NavBar'
import Login from './Login'
import { getToken } from '@/lib/auth'

export default function ProyectosPage({ empresaId }) {
  const [proyectos, setProyectos] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [proyectoInvitando, setProyectoInvitando] = useState(null)

  async function load() {
    const data = empresaId ? await listarProyectosPorEmpresa(empresaId) : await listarProyectos()
    setProyectos(data || [])
  }
  useEffect(() => { load() }, [empresaId])


  if (!getToken()) return <Login />


  return (
    <div className="min-h-screen bg-neutral-950 text-white relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60rem 40rem at -10% -20%, rgba(59,162,237,0.10), transparent 60%), radial-gradient(40rem 30rem at 110% -10%, rgba(59,162,237,0.08), transparent 55%)'
        }}
      />
      <NavBar />
      <div className="max-w-3xl mx-auto p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-sky-300">Proyectos</h1>
            {empresaId && (
              <button
                onClick={() => {
                  setEditing(null)
                  setOpen(true)
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold"
              >
                Nuevo
              </button>
            )}
          </header>

          <ul className="space-y-3">
            {proyectos.map(p => (
              <li
                key={p.id}
                className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 flex justify-between items-center"
              >
                <div>
                  <div className="text-slate-100 font-medium">{p.nombre}</div>
                  {p.descripcion && (
                    <div className="text-slate-300/80 text-sm">{p.descripcion}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setProyectoInvitando(p)
                      setInviteOpen(true)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Invitar
                  </button>
                  <button
                    onClick={() => {
                      setEditing(p)
                      setOpen(true)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    <Pencil className="w-4 h-4 text-slate-300" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

        <ProyectoModal
          open={open}
          onClose={() => setOpen(false)}
          initialData={editing}
          empresaId={empresaId}
          onSaved={load}
        />
        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          title={proyectoInvitando ? `Invitar a ${proyectoInvitando.nombre}` : 'Invitar'}
          onInvite={email => invitarUsuarioAProyecto(proyectoInvitando.id, email)}
        />
      </div>
    </div>
  )
}
