// src/components/ProyectoModal.jsx
import React, { useEffect, useRef, useState } from 'react'
import BaseModal from './BaseModal'
import { crearProyecto, editarProyecto } from '@/services/proyectos'

export default function ProyectoModal({ open, onClose, initialData = null, onSaved, empresaId }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [horasMensuales, setHorasMensuales] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setNombre(initialData?.nombre || '')
      setDescripcion(initialData?.descripcion || '')
      setHorasMensuales(initialData?.horasMensuales || '')
      setError('')
      setLoading(false)
    }
  }, [open, initialData])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    try {
      setLoading(true)
      if (initialData) {
        await editarProyecto(initialData.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          horasMensuales: horasMensuales ? Number(horasMensuales) : undefined
        })
      } else {
        await crearProyecto({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          horasMensuales: horasMensuales ? Number(horasMensuales) : undefined,
          empresaId
        })
      }
      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('Error guardando proyecto', err)
      const msg = err?.response?.data?.error || err?.message || 'No se pudo guardar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    onClose?.()
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={initialData ? 'Editar proyecto' : 'Nuevo proyecto'}
      initialFocusRef={inputRef}
    >
      {error && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="block text-sm text-white/80" htmlFor="proyecto-nombre">
          Nombre
        </label>
        <input
          id="proyecto-nombre"
          ref={inputRef}
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          disabled={loading}
        />
        <label className="mt-4 block text-sm text-white/80" htmlFor="proyecto-descripcion">
          Descripción (opcional)
        </label>
        <textarea
          id="proyecto-descripcion"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          disabled={loading}
        />
        <label className="mt-4 block text-sm text-white/80" htmlFor="proyecto-horas">
          Horas mensuales (opcional)
        </label>
        <input
          id="proyecto-horas"
          type="number"
          value={horasMensuales}
          onChange={e => setHorasMensuales(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          disabled={loading}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
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
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
