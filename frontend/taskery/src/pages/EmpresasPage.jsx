// src/pages/EmpresasPage.jsx
import React, { useEffect, useState } from 'react'
import { listarMisEmpresas } from '@/services/empresas'
import EmpresaModal from '@/components/EmpresaModal'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    const data = await listarMisEmpresas()
    setEmpresas(data || [])
  }
  useEffect(() => { load() }, [])

  return (
    <div className="p-4">
      <div className="flex justify-between mb-3">
        <h1 className="text-xl text-sky-200">Empresas</h1>
        <button
          onClick={() => { setEditing(null); setOpen(true) }}
          className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500"
        >
          Nueva
        </button>
      </div>

      <ul className="space-y-2">
        {empresas.map(e => (
          <li key={e.id}
              className="p-3 rounded-xl bg-slate-800 border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-slate-100 font-medium">{e.nombre}</div>
              {e.descripcion && <div className="text-slate-300/80 text-sm">{e.descripcion}</div>}
            </div>
            <button
              onClick={() => { setEditing(e); setOpen(true) }}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            >
              Editar
            </button>
          </li>
        ))}
      </ul>

      <EmpresaModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={editing}
        onSaved={load}
      />
    </div>
  )
}
