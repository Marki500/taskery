// src/services/tareas.js
import { api } from '@/lib/api'

/** Normaliza el estado a los enums del backend/Prisma */
function toEstadoEnum(estado) {
  const s = String(estado || '').toLowerCase()
  if (s.startsWith('en')) return 'EN_PROGRESO'
  if (s.startsWith('comp')) return 'COMPLETADA'
  return 'PENDIENTE'
}

/** Normaliza la prioridad a enums del backend (por si envías en minúsculas) */
function toPrioridadEnum(prioridad) {
  const s = String(prioridad || '').toLowerCase()
  if (s.startsWith('al')) return 'ALTA'
  if (s.startsWith('me')) return 'MEDIA'
  if (s.startsWith('ba')) return 'BAJA'
  return undefined
}

/**
 * Crea una tarea
 * @param {{ proyectoId: number, nombre: string, descripcion?: string, estado?: string, prioridad?: string, asignadosIds?: number[] }} payload
 */
export async function crearTarea(payload) {
  const body = { ...payload }
  if (body.estado) body.estado = toEstadoEnum(body.estado)
  if (body.prioridad) body.prioridad = toPrioridadEnum(body.prioridad) || body.prioridad
  const { data } = await api.post('/tareas', body)
  return data
}

/**
 * Lista tareas de un proyecto
 * GET /tareas/:proyectoId
 */
export async function listarTareasDeProyecto(proyectoId) {
  const { data } = await api.get(`/tareas/${proyectoId}`)
  return data
}

/** (Opcional) Obtener una tarea concreta */
export async function obtenerTarea(id) {
  const { data } = await api.get(`/tareas/item/${id}`)
  return data
}

/**
 * Actualiza una tarea completa (PUT /tareas/:id)
 * @param {number} id
 * @param {{ nombre?: string, descripcion?: string, estado?: string, prioridad?: string, asignadosIds?: number[] }} payload
 */
export async function actualizarTarea(id, payload) {
  const body = { ...payload }
  if (body.estado) body.estado = toEstadoEnum(body.estado)
  if (body.prioridad) body.prioridad = toPrioridadEnum(body.prioridad) || body.prioridad
  const { data } = await api.put(`/tareas/${id}`, body)
  return data
}

/**
 * Actualiza solo el estado de una tarea (utiliza PUT general para simplificar)
 */
export async function actualizarEstadoTarea(id, estado) {
  return actualizarTarea(id, { estado })
}

/**
 * Reordena tareas dentro de una columna (PATCH /tareas/ordenar)
 * @param {number} proyectoId
 * @param {'pendiente'|'en_progreso'|'completada'|string} estado - acepta minúsculas; el backend lo normaliza
 * @param {number[]} idsOrdenados - IDs en el orden final de esa columna
 */
export async function reordenarTareas(proyectoId, estado, idsOrdenados) {
  const { data } = await api.patch('/tareas/ordenar', {
    proyectoId,
    estado,            // el backend ya lo normaliza a enum
    ordenIds: idsOrdenados,
  })
  return data
}

export async function eliminarTarea(id) {
  const { data } = await api.delete(`/tareas/${id}`)
  return data
}

/**
 * (Opcional) Mover una tarea entre columnas y reordenar ambas listas.
 * Útil si quieres orquestarlo desde aquí en lugar de App.jsx
 * @param {object} p
 * @param {number} p.tareaId
 * @param {number} p.proyectoId
 * @param {'pendiente'|'en_progreso'|'completada'|string} p.to
 * @param {number[]} p.targetIds - orden final en columna destino (incluida la tarea movida)
 * @param {number[]} p.sourceIds - orden final en columna origen (sin la tarea movida)
 */
export async function moverTarea({ tareaId, proyectoId, to, targetIds, sourceIds }) {
  // 1) Cambia estado
  await actualizarEstadoTarea(tareaId, to)
  // 2) Persiste orden destino
  await reordenarTareas(proyectoId, to, targetIds)
  // 3) Persiste orden origen (por si cambió hueco)
  const fromLower = guessFromFromDiff(targetIds, sourceIds) // best-effort si lo necesitas
  if (fromLower) {
    await reordenarTareas(proyectoId, fromLower, sourceIds)
  }
}

/** Heurística simple para deducir la columna origen (opcional) */
function guessFromFromDiff() {
  // Si quieres, puedes pasar el `from` explícito y no usar esto.
  // Lo dejo por si mueves esta lógica aquí y no quieres tocar más.
  // Devuelve 'pendiente' | 'en_progreso' | 'completada' | null
  return null
}
