const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Iniciar un timer (usando usuario autenticado)
async function iniciarTimer(req, res) {
  const usuarioId = req.usuario.id
  const { tareaId } = req.body

  if (!tareaId) {
    return res.status(400).json({ error: 'tareaId es obligatorio' })
  }

  try {
    const timerActivo = await prisma.timer.findFirst({
      where: { usuarioId, fin: null }
    })

    if (timerActivo) {
      return res.status(400).json({ error: 'Ya tienes un timer activo' })
    }

    const timer = await prisma.timer.create({
      data: { usuarioId, tareaId, inicio: new Date() }
    })

    return res.status(201).json(timer)
  } catch (error) {
    console.error('[iniciarTimer] Error:', error)
    return res.status(500).json({ error: 'Error al iniciar el timer' })
  }
}

// Detener un timer (solo si pertenece al usuario autenticado)
async function detenerTimer(req, res) {
  const usuarioId = req.usuario.id
  const { id } = req.params

  try {
    const timer = await prisma.timer.findUnique({ where: { id: parseInt(id) } })

    if (!timer) return res.status(404).json({ error: 'Timer no encontrado' })

    if (timer.usuarioId !== usuarioId) {
      return res.status(403).json({ error: 'No puedes detener un timer que no es tuyo' })
    }

    if (timer.fin !== null) {
      return res.status(400).json({ error: 'El timer ya estaba detenido' })
    }

    const timerDetenido = await prisma.timer.update({
      where: { id: timer.id },
      data: { fin: new Date() }
    })

    return res.json(timerDetenido)
  } catch (error) {
    console.error('[detenerTimer] Error:', error)
    return res.status(500).json({ error: 'Error al detener el timer' })
  }
}

// Listar timers de una tarea
async function listarTimersPorTarea(req, res) {
  const tareaId = parseInt(req.params.tareaId)

  try {
    const timers = await prisma.timer.findMany({
      where: { tareaId },
      orderBy: { inicio: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        tarea:   { select: { id: true, titulo: true } }
      }
    })
    return res.json(timers)
  } catch (error) {
    console.error('[listarTimersPorTarea] Error:', error)
    return res.status(500).json({ error: 'Error al listar timers' })
  }
}

module.exports = { iniciarTimer, detenerTimer, listarTimersPorTarea }
