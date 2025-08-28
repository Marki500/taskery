// Modal de creación de empresa que usa BaseModal
import React, { useState, useRef, useEffect } from 'react'
import BaseModal from './BaseModal'
import { crearEmpresa, editarEmpresa } from '@/services/empresas'

export default function EmpresaCreateModal({ open, onClose, onCreated, initialData, onUpdated }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const firstInputRef = useRef(null)
  const descId = 'empresa-modal-desc'
  const isEdit = Boolean(initialData?.id)

  useEffect(() => {
    if (open && initialData) {
      setNombre(initialData.nombre || '')
      setDescripcion(initialData.descripcion || '')
    } else if (open) {
      setNombre('')
      setDescripcion('')
    }
  }, [open, initialData])

  function resetAndClose() {
    setNombre('')
    setDescripcion('')
    setError('')
    setLoading(false)
    onClose?.()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      firstInputRef.current?.focus()
      return
    }

    try {
      setLoading(true)
      if (isEdit) {
        const actualizada = await editarEmpresa(initialData.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
        })
        onUpdated?.(actualizada)
      } else {
        const nueva = await crearEmpresa({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
        })
        onCreated?.(nueva)
      }
      resetAndClose()
    } catch (err) {
      console.error(isEdit ? 'Error al editar empresa' : 'Error al crear empresa', err)
      const msg = err?.response?.data?.mensaje || err?.message || 'No se pudo guardar la empresa'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={resetAndClose}
      title={isEdit ? 'Editar empresa' : 'Nueva empresa'}
      descriptionId={descId}
      initialFocusRef={firstInputRef}
    >
      <p id={descId} className="mt-1 text-sm text-white/70">
        {isEdit ? 'Edita los datos de la empresa.' : 'Crea una empresa para agrupar proyectos y usuarios.'}
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
        <label className="mt-1 block text-sm text-white/80" htmlFor="empresa-nombre">
          Nombre
        </label>
        <input
          id="empresa-nombre"
          ref={firstInputRef}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Creative Corner"
          disabled={loading}
        />

        <label className="mt-4 block text-sm text-white/80" htmlFor="empresa-descripcion">
          Descripción (opcional)
        </label>
        <textarea
          id="empresa-descripcion"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción de la empresa"
          rows={3}
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
            {loading ? (isEdit ? 'Guardando…' : 'Creando…') : isEdit ? 'Guardar cambios' : 'Crear empresa'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}