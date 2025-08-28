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
    <>
    <NavBar />
    <div className="p-4">
        <div className="flex justify-between mb-3">
          <h1 className="text-xl text-sky-200">Proyectos</h1>
          {empresaId && (
            <button
              onClick={() => { setEditing(null); setOpen(true) }}
              className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500"
            >
              Nuevo
            </button>
          )}
        </div>

      <ul className="space-y-2">
        {proyectos.map(p => (
            <li
              key={p.id}
              className="p-3 rounded-xl bg-slate-800 border border-white/10 flex justify-between items-center"
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
                  className="p-2 rounded-lg hover:bg-slate-700"
                >
                  Invitar
                </button>
                <button
                  onClick={() => {
                    setEditing(p)
                    setOpen(true)
                  }}
                  className="p-2 rounded-lg hover:bg-slate-700"
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

      </>

    )
  }
