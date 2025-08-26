// Importamos PrismaClient para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Crear un nuevo proyecto
async function crearProyecto(req, res) {
  const { nombre, descripcion, horasMensuales } = req.body
  const empresaId = req.usuario.empresaId

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' })
  }

  try {
    const proyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        horasMensuales,
        empresaId
      }
    })

    res.status(201).json(proyecto)
  } catch (error) {
    console.error('[crearProyecto] Error:', error)
    res.status(500).json({ error: 'Error al crear el proyecto' })
  }
}

// Listar proyectos por empresa
async function listarProyectosPorEmpresa(req, res) {
  const empresaId = req.usuario.empresaId

  try {
    const proyectos = await prisma.proyecto.findMany({
      where: { empresaId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        horasMensuales: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return res.json(proyectos)
  } catch (error) {
    console.error('[listarProyectosPorEmpresa] Error:', error)
    return res.status(500).json({ error: 'Error al listar proyectos' })
  }
}

module.exports = { crearProyecto, listarProyectosPorEmpresa }
