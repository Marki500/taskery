const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Crear tarea y asignar usuarios
async function crearTarea(req, res) {
  const { titulo, descripcion, proyectoId, asignadosIds } = req.body

  if (!titulo || !proyectoId) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: titulo y proyectoId'
    })
  }

  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      include: { empresa: true }
    })

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    let conectarUsuarios = []

    if (Array.isArray(asignadosIds) && asignadosIds.length > 0) {
      const usuarios = await prisma.usuario.findMany({
        where: { id: { in: asignadosIds } },
        select: { id: true, empresaId: true }
      })

      const idsEncontrados = new Set(usuarios.map(u => u.id))
      const idsNoEncontrados = asignadosIds.filter(id => !idsEncontrados.has(id))

      if (idsNoEncontrados.length > 0) {
        return res.status(400).json({
          error: 'Algunos usuarios no existen',
          detalles: { idsNoEncontrados }
        })
      }

      const empresaProyectoId = proyecto.empresaId
      const idsEmpresaDistinta = usuarios
        .filter(u => u.empresaId !== empresaProyectoId)
        .map(u => u.id)

      if (idsEmpresaDistinta.length > 0) {
        return res.status(400).json({
          error: 'Algunos usuarios no pertenecen a la misma empresa del proyecto',
          detalles: { idsEmpresaDistinta }
        })
      }

      conectarUsuarios = asignadosIds.map(id => ({ id }))
    } else {
      // Asignar al usuario autenticado si no se especifican asignadosIds
      conectarUsuarios = [{ id: req.usuario.id }]
    }

    const tarea = await prisma.tarea.create({
      data: {
        titulo,
        descripcion,
        proyectoId,
        usuariosAsignados: { connect: conectarUsuarios }
      },
      include: {
        usuariosAsignados: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true } }
      }
    })

    return res.status(201).json(tarea)
  } catch (error) {
    console.error('[crearTarea] Error:', error)
    return res.status(500).json({ error: 'Error al crear la tarea' })
  }
}

// Listar tareas por proyecto (solo si el proyecto es de la misma empresa del usuario)
async function listarTareasPorProyecto(req, res) {
  const proyectoId = parseInt(req.params.proyectoId)

  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { id: true, empresaId: true }
    })

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    if (proyecto.empresaId !== req.usuario.empresaId) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' })
    }

    const tareas = await prisma.tarea.findMany({
      where: { proyectoId },
      include: {
        usuariosAsignados: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true } }
      }
    })

    return res.json(tareas)
  } catch (error) {
    console.error('[listarTareasPorProyecto] Error:', error)
    return res.status(500).json({ error: 'Error al listar tareas' })
  }
}

module.exports = {
  crearTarea,
  listarTareasPorProyecto
}
