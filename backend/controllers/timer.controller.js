const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

const ACTIVE = 'ACTIVE'

/**
 * POST /api/timers/start
 * body: { tareaId: number, note?: string }
 * Cierra cualquier timer activo del usuario y abre uno nuevo (switch atómico)
 */
async function iniciarTimer(req, res) {
  const usuarioId = req.usuario.id
  const { tareaId, note } = req.body || {}

  if (!tareaId) {
    return res.status(400).json({ error: 'tareaId es obligatorio' })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Cierra activo (si existe)
      await tx.timer.updateMany({
        where: { usuarioId, activeKey: ACTIVE },
        data: { fin: new Date(), activeKey: null }
      })

      // 2) Crea el nuevo activo
      const newTimer = await tx.timer.create({
        data: {
          usuarioId,
          tareaId: Number(tareaId),
          inicio: new Date(),
          note: note?.trim() || null,
          source: 'timer',
          activeKey: ACTIVE
        },
        include: {
          usuario: { select: { id: true, nombre: true, email: true } },
          tarea:   { select: { id: true, nombre: true } }
        }
      })

      return { newTimer }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return res.status(201).json(result)
  } catch (error) {
    // Si dos pestañas compiten exactamente a la vez, el @@unique lanza P2002
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Ya hay un timer activo' })
    }
    console.error('[iniciarTimer] Error:', error)
    return res.status(500).json({ error: 'Error al iniciar el timer' })
  }
}

/**
 * POST /api/timers/stop
 * Detiene el timer ACTIVO del usuario (si hay)
 */
async function detenerTimerActual(req, res) {
  const usuarioId = req.usuario.id
  try {
    const result = await prisma.timer.updateMany({
      where: { usuarioId, activeKey: ACTIVE },
      data: { fin: new Date(), activeKey: null }
    })
    // result.count será 0 o 1
    return res.json({ stoppedCount: result.count })
  } catch (error) {
    console.error('[detenerTimerActual] Error:', error)
    return res.status(500).json({ error: 'Error al detener el timer' })
  }
}

/**
 * POST /api/timers/stop/:id
 * (Opcional) Detener un timer por id, sólo si pertenece al usuario y está activo
 */
async function detenerTimerPorId(req, res) {
  const usuarioId = req.usuario.id
  const id = Number(req.params.id)

  try {
    const timer = await prisma.timer.findUnique({ where: { id } })
    if (!timer) return res.status(404).json({ error: 'Timer no encontrado' })
    if (timer.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'No puedes detener un timer que no es tuyo' })
    }
    if (timer.fin !== null && timer.activeKey === null) {
      return res.status(400).json({ error: 'El timer ya estaba detenido' })
    }

    const timerDetenido = await prisma.timer.update({
      where: { id },
      data: { fin: new Date(), activeKey: null },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        tarea:   { select: { id: true, nombre: true } }
      }
    })

    return res.json(timerDetenido)
  } catch (error) {
    console.error('[detenerTimerPorId] Error:', error)
    return res.status(500).json({ error: 'Error al detener el timer' })
  }
}

/**
 * GET /api/timers/active
 * Devuelve el timer activo del usuario o null
 */
async function obtenerTimerActivo(req, res) {
  const usuarioId = req.usuario.id
  try {
    const active = await prisma.timer.findFirst({
      where: { usuarioId, activeKey: ACTIVE },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        tarea:   { select: { id: true, nombre: true } }
      }
    })
    return res.json(active || null)
  } catch (error) {
    console.error('[obtenerTimerActivo] Error:', error)
    return res.status(500).json({ error: 'Error al obtener el timer activo' })
  }
}

/**
 * GET /api/timers/tarea/:tareaId
 * Lista timers de una tarea (histórico)
 */
async function listarTimersPorTarea(req, res) {
  const tareaId = Number(req.params.tareaId)
  try {
    const timers = await prisma.timer.findMany({
      where: { tareaId },
      orderBy: { inicio: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        tarea:   { select: { id: true, nombre: true } } // <-- nombre (no 'titulo')
      }
    })
    return res.json(timers)
  } catch (error) {
    console.error('[listarTimersPorTarea] Error:', error)
    return res.status(500).json({ error: 'Error al listar timers' })
  }
}

module.exports = {
  iniciarTimer,
  detenerTimerActual,
  detenerTimerPorId,
  obtenerTimerActivo,
  listarTimersPorTarea
}
