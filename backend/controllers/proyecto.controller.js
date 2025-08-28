// controllers/proyecto.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * POST /proyectos
 * Body:
 *  - nombre: string (requerido)
 *  - empresaId: number (requerido)
 *  - horasMensuales?: number
 *  - descripcion?: string
 */
async function crearProyecto(req, res) {
  const { nombre, empresaId, horasMensuales, descripcion } = req.body
  const usuarioId = req.usuario?.id

  // Validaciones básicas
  if (!nombre || !empresaId) {
    return res.status(400).json({ error: 'nombre y empresaId son obligatorios' })
  }

  try {
    // 1) Verificar que el usuario pertenece a la empresa
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: Number(empresaId),
        usuarios: { some: { id: Number(usuarioId) } },
      },
      select: { id: true },
    })

    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' })
    }

    // 2) Crear el proyecto conectándolo a la empresa (relación requerida por Prisma)
    const proyecto = await prisma.proyecto.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        horasMensuales:
          typeof horasMensuales === 'number'
            ? horasMensuales
            : horasMensuales !== undefined
            ? Number(horasMensuales)
            : null,
        empresa: { connect: { id: Number(empresaId) } },
        usuarios: { connect: { id: Number(usuarioId) } },
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        horasMensuales: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.status(201).json(proyecto)
  } catch (error) {
    console.error('[crearProyecto] Error:', error)
    return res.status(500).json({ error: 'Error al crear el proyecto' })
  }
}

/**
 * GET /proyectos?empresaId=123
 * Lista proyectos de una empresa a la que el usuario pertenece
 */
async function listarProyectosPorEmpresa(req, res) {
  const empresaId = Number(req.query.empresaId)
  const usuarioId = req.usuario?.id

  if (!empresaId) {
    return res.status(400).json({ error: 'empresaId es obligatorio' })
  }

  try {
    // Verificar pertenencia
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuarios: { some: { id: Number(usuarioId) } },
      },
      select: { id: true },
    })

    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' })
    }

    // Listar
    const proyectos = await prisma.proyecto.findMany({
      where: { empresaId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        horasMensuales: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(proyectos)
  } catch (error) {
    console.error('[listarProyectosPorEmpresa] Error:', error)
    return res.status(500).json({ error: 'Error al listar proyectos' })
  }
}

/**
 * GET /proyectos/mis-proyectos
 * Lista todos los proyectos a los que pertenece el usuario
 */
async function listarMisProyectos(req, res) {
  const usuarioId = req.usuario?.id
  try {
    const proyectos = await prisma.proyecto.findMany({
      where: {
        empresa: { usuarios: { some: { id: Number(usuarioId) } } },
      },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        horasMensuales: true,
        empresa: { select: { id: true, nombre: true } },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(proyectos)
  } catch (error) {
    console.error('[listarMisProyectos] Error:', error)
    return res.status(500).json({ error: 'Error al listar proyectos' })
  }
}


/**
 * PUT /proyectos/:id
 * Body opcional: { nombre?, descripcion?, horasMensuales? }
 */
async function editarProyecto(req, res) {
  const { id } = req.params
  const { nombre, descripcion, horasMensuales } = req.body
  const usuarioId = req.usuario?.id

  try {
    const proyectoId = Number(id)
    if (!proyectoId) return res.status(400).json({ error: 'id inválido' })

    // 1) Cargar proyecto para conocer empresaId
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { id: true, empresaId: true },
    })
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    // 2) Autorizar: usuario debe pertenecer a la empresa del proyecto
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: proyecto.empresaId,
        usuarios: { some: { id: Number(usuarioId) } },
      },
      select: { id: true },
    })
    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' })
    }

    // 3) Construir data parcial
    const data = {}
    if (typeof nombre === 'string') data.nombre = nombre.trim()
    if (typeof descripcion === 'string') data.descripcion = descripcion.trim() || null
    if (horasMensuales !== undefined) {
      const hm = Number(horasMensuales)
      if (!Number.isNaN(hm)) data.horasMensuales = hm
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Sin cambios enviados' })
    }

    const actualizado = await prisma.proyecto.update({
      where: { id: proyectoId },
      data,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        horasMensuales: true,
        updatedAt: true,
      },
    })

    return res.json(actualizado)
  } catch (error) {
    console.error('[editarProyecto] Error:', error)
    return res.status(500).json({ error: 'Error al editar el proyecto' })
  }
}

/**
 * POST /proyectos/:id/invitaciones
 * Body: { email }
 */
async function invitarUsuarioAProyecto(req, res) {
  const { id } = req.params
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email es requerido' })
  try {
    const proyectoId = Number(id)
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { id: true, empresaId: true },
    })
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const pertenece = await prisma.empresa.findFirst({
      where: { id: proyecto.empresaId, usuarios: { some: { id: req.usuario.id } } },
      select: { id: true },
    })
    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' })
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

    await prisma.proyecto.update({
      where: { id: proyectoId },
      data: { usuarios: { connect: { id: usuario.id } } },
    })
    // asegura que el usuario pertenezca a la empresa
    await prisma.empresa.update({
      where: { id: proyecto.empresaId },
      data: { usuarios: { connect: { id: usuario.id } } },
    }).catch(() => {})

    return res.json({ ok: true })
  } catch (error) {
    console.error('[invitarUsuarioAProyecto] Error:', error)
    return res.status(500).json({ error: 'Error al invitar usuario' })
  }
}


module.exports = {
  crearProyecto,
  listarProyectosPorEmpresa,
  listarMisProyectos,
  editarProyecto,
  invitarUsuarioAProyecto,
}
