// src/pages/EmpresasPage.jsx
import React, { useEffect, useState } from 'react'
import { listarMisEmpresas, invitarUsuarioAEmpresa } from '@/services/empresas'
import EmpresaModal from '@/components/EmpresaModal'
import InviteModal from '@/components/InviteModal'
import NavBar from '@/components/NavBar'
import Login from './Login'
import { getToken } from '@/lib/auth'


export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [empresaInvitando, setEmpresaInvitando] = useState(null)

  async function load() {
    const data = await listarMisEmpresas()
    setEmpresas(data || [])
  }
  useEffect(() => { load() }, [])

  if (!getToken()) return <Login />

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-neutral-950 text-white relative">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60rem 40rem at -10% -20%, rgba(59,162,237,0.10), transparent 60%), radial-gradient(40rem 30rem at 110% -10%, rgba(59,162,237,0.08), transparent 55%)'
          }}
        />
        <div className="max-w-3xl mx-auto p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-sky-300">Empresas</h1>
            <button
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold"
            >
              Nueva
            </button>
          </header>

          <ul className="space-y-3">
            {empresas.map(e => (
              <li
                key={e.id}
                className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 flex justify-between items-center"
              >
                <div>
                  <div className="text-slate-100 font-medium">{e.nombre}</div>
                  {e.descripcion && (
                    <div className="text-slate-300/80 text-sm">{e.descripcion}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEmpresaInvitando(e)
                      setInviteOpen(true)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Invitar
                  </button>
                  <button
                    onClick={() => {
                      setEditing(e)
                      setOpen(true)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <EmpresaModal
            open={open}
            onClose={() => setOpen(false)}
            initialData={editing}
            onSaved={load}
          />
          <InviteModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            title={empresaInvitando ? `Invitar a ${empresaInvitando.nombre}` : 'Invitar'}
            onInvite={email => invitarUsuarioAEmpresa(empresaInvitando.id, email)}
          />
        </div>
      </div>
    </>
  )
}
