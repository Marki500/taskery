// Importamos PrismaClient para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * POST /empresas
 * Crea una nueva empresa con el nombre dado.
 * Body esperado: { "nombre": "Mi Empresa" }
 */
async function crearEmpresa(req, res) {
  const { nombre } = req.body

  // Validación básica
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  try {
    // Creamos la empresa en la BD
    const empresa = await prisma.empresa.create({
      data: { nombre }
    })

    // Devolvemos la empresa creada
    return res.status(201).json(empresa)
  } catch (error) {
    console.error('[crearEmpresa] Error:', error)
    return res.status(500).json({ error: 'Error al crear la empresa' })
  }
}

/**
 * GET /empresas/:id
 * Devuelve una empresa por id, incluyendo sus proyectos y usuarios.
 */
async function obtenerEmpresaPorId(req, res) {
  const { id } = req.params

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(id) },
      include: {
        proyectos: {
          select: { id: true, nombre: true, horasMensuales: true, createdAt: true }
        },
        usuarios: {
          select: { id: true, nombre: true, email: true, rol: true, createdAt: true }
        }
      }
    })

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' })
    }

    return res.json(empresa)
  } catch (error) {
    console.error('[obtenerEmpresaPorId] Error:', error)
    return res.status(500).json({ error: 'Error al obtener la empresa' })
  }
}

// Exportamos ambas funciones
module.exports = { crearEmpresa, obtenerEmpresaPorId }
