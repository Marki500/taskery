// src/components/ProyectoCreateModal.jsx
import React, { useRef, useState } from 'react'
import BaseModal from './BaseModal'
import { crearProyecto } from '@/services/proyectos'

export default function ProyectoCreateModal({ open, onClose, empresa, onCreated }) {
  const [nombre, setNombre] = useState('')
  const [horasMensuales, setHorasMensuales] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const firstInputRef = useRef(null)
  const descId = 'proyecto-modal-desc'

  function resetAndClose() {
    setNombre('')
    setHorasMensuales('')
    setError('')
    setLoading(false)
    onClose?.()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!empresa?.id) {
      setError('No hay empresa seleccionada')
      return
    }
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      firstInputRef.current?.focus()
      return
    }

    const horas = horasMensuales !== '' ? Number(horasMensuales) : undefined
    if (horas !== undefined && (Number.isNaN(horas) || horas < 0)) {
      setError('Horas mensuales debe ser un número positivo')
      return
    }

    try {
      setLoading(true)
      const nuevo = await crearProyecto({
        nombre: nombre.trim(),
        empresaId: empresa.id,
        horasMensuales: horas,
      })
      onCreated?.(nuevo)
      resetAndClose()
    } catch (err) {
      console.error('Error al crear proyecto', err)
      const msg = err?.response?.data?.mensaje || err?.message || 'No se pudo crear el proyecto'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={resetAndClose}
      title="Nuevo proyecto"
      descriptionId={descId}
      initialFocusRef={firstInputRef}
    >
      <p id={descId} className="mt-1 text-sm text-white/70">
        Crea un proyecto dentro de <span className="text-sky-200 font-medium">{empresa?.nombre || '—'}</span>.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <label className="mt-1 block text-sm text-white/80" htmlFor="proyecto-nombre">
          Nombre
        </label>
        <input
          id="proyecto-nombre"
          ref={firstInputRef}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Web corporativa"
          disabled={loading}
        />

        <label className="mt-4 block text-sm text-white/80" htmlFor="proyecto-horas">
          Horas mensuales (opcional)
        </label>
        <input
          id="proyecto-horas"
          type="number"
          min="0"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={horasMensuales}
          onChange={(e) => setHorasMensuales(e.target.value)}
          placeholder="Ej. 40"
          disabled={loading}
        />

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? 'Creando…' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
