// src/components/TareaCreateModal.jsx
import React, { useEffect, useRef, useState } from 'react'
import BaseModal from './BaseModal'
import { crearTarea, actualizarTarea } from '@/services/tareas'

const ESTADOS = [
  { value: 'pendiente',    label: 'Pendiente' },
  { value: 'en_progreso',  label: 'En progreso' },
  { value: 'completada',   label: 'Completada' },
]

const PRIORIDADES = [
  { value: 'baja',  label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta',  label: 'Alta' },
]

/**
 * Modal para crear/editar tarea.
 * - Crear: pasar { proyecto } y dejar initialData undefined.
 * - Editar: pasar { initialData: tarea } (no hace falta proyecto).
 *
 * Props:
 *  - open, onClose
 *  - proyecto?: { id, nombre }   (requerido SOLO al crear)
 *  - initialData?: Tarea         (si viene, entra en modo edición)
 *  - onCreated?: (tarea)=>void   (compat: solo al crear)
 *  - onSaved?: ()=>void          (se llama en ambos casos)
 */
export default function TareaCreateModal({
  open,
  onClose,
  proyecto,
  initialData,
  onCreated,
  onSaved,
}) {
  const isEdit = Boolean(initialData?.id)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState('pendiente')
  const [prioridad, setPrioridad] = useState('media')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const firstInputRef = useRef(null)
  const descId = 'tarea-modal-desc'

  // Cargar datos en modo edición o resetear en modo creación
  useEffect(() => {
    if (!open) return
    if (isEdit) {
      setNombre(initialData?.nombre ?? '')
      setDescripcion(initialData?.descripcion ?? '')
      // Si te llegan enums en MAYÚSCULAS del backend, puedes bajarlos aquí:
      setEstado(String(initialData?.estado || 'PENDIENTE').toLowerCase())
      setPrioridad(String(initialData?.prioridad || 'MEDIA').toLowerCase())
    } else {
      setNombre('')
      setDescripcion('')
      setEstado('pendiente')
      setPrioridad('media')
    }
    setError('')
    setLoading(false)
  }, [open, isEdit, initialData])

  function resetAndClose() {
    setNombre('')
    setDescripcion('')
    setEstado('pendiente')
    setPrioridad('media')
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
        // EDITAR
        await actualizarTarea(initialData.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          estado,      // el servicio ya normaliza a enum
          prioridad,   // idem
        })
        onSaved?.()
      } else {
        // CREAR
        if (!proyecto?.id) {
          setError('No hay proyecto seleccionado')
          return
        }
        const nueva = await crearTarea({
          proyectoId: proyecto.id,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          estado,
          prioridad,
        })
        onCreated?.(nueva)   // compat
        onSaved?.()
      }

      resetAndClose()
    } catch (err) {
      console.error('Error al guardar tarea', err)
      const msg = err?.response?.data?.error || err?.message || 'No se pudo guardar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={resetAndClose}
      title={isEdit ? 'Editar tarea' : 'Nueva tarea'}
      descriptionId={descId}
      initialFocusRef={firstInputRef}
    >
      <p id={descId} className="mt-1 text-sm text-white/70">
        {isEdit ? (
          <>Modifica los campos de la tarea.</>
        ) : (
          <>Crea una tarea en <span className="text-sky-200 font-medium">{proyecto?.nombre || '—'}</span>.</>
        )}
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
        <label className="mt-1 block text-sm text-white/80" htmlFor="tarea-nombre">
          Nombre
        </label>
        <input
          id="tarea-nombre"
          ref={firstInputRef}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Maquetar landing"
          disabled={loading}
        />

        <label className="mt-4 block text-sm text-white/80" htmlFor="tarea-desc">
          Descripción (opcional)
        </label>
        <textarea
          id="tarea-desc"
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles de la tarea"
          rows={3}
          disabled={loading}
        />

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80" htmlFor="tarea-estado">
              Estado
            </label>
            <select
              id="tarea-estado"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={loading}
            >
              {ESTADOS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/80" htmlFor="tarea-prioridad">
              Prioridad
            </label>
            <select
              id="tarea-prioridad"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              disabled={loading}
            >
              {PRIORIDADES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            {loading ? (isEdit ? 'Guardando…' : 'Creando…') : (isEdit ? 'Guardar cambios' : 'Crear tarea')}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
