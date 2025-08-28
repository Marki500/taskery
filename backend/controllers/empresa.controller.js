// Importamos PrismaClient para interactuar con la base de datos
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * POST /empresas
 * Crea una nueva empresa con el nombre dado.
 * Body esperado: { "nombre": "Mi Empresa" }
 */
async function crearEmpresa(req, res) {
  const { nombre, color } = req.body // color es el nuevo campo

  // Validación básica
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' })
  }

  try {
    const usuarioId = req.usuario.id // El usuario autenticado

    // Creamos la empresa en la BD
    const empresa = await prisma.empresa.create({
      data: {
        nombre,
        color, // Nuevo campo: color
        usuarios: {
          connect: [{ id: usuarioId }]
        }
      },
      include: {
        usuarios: true
      }
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

/**
 * PUT /empresas/:id
 * Edita una empresa existente.
 * Body esperado: { "nombre": "...", "color": "..." }
 */
async function editarEmpresa(req, res) {
  const { id } = req.params
  const { nombre, color } = req.body

  try {
    const empresaId = Number(id)
    if (!empresaId) return res.status(400).json({ error: 'id inválido' })

    // 1) Comprobar que el usuario pertenece a la empresa
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuarios: { some: { id: req.usuario.id } },
      },
      select: { id: true },
    })
    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' })
    }

    // 2) Construir data solo con campos presentes
    const data = {}
    if (typeof nombre === 'string') data.nombre = nombre.trim()
    if (typeof color === 'string') data.color = color.trim()

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Sin cambios (nombre/color no enviados)' })
    }

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data,
    })

    return res.json(empresa)
  } catch (error) {
    console.error('[editarEmpresa] Error:', error)
    return res.status(500).json({ error: 'Error al editar empresa' })
  }
}


/**
 * Devuelve todas las empresas a las que pertenece el usuario autenticado.
 */
async function listarEmpresasDelUsuario(req, res) {
  try {
    const usuarioId = req.usuario.id

    // Busca todas las empresas donde el usuario es miembro
    const empresas = await prisma.empresa.findMany({
      where: {
        usuarios: {
          some: { id: usuarioId }
        }
      }
    })

    return res.json(empresas)
  } catch (error) {
    console.error("Error al listar empresas del usuario:", error)
    return res.status(500).json({ error: "Error al listar empresas" })
  }
}

/**
 * POST /empresas/:id/invitaciones
 * Body: { email }
 */
async function invitarUsuarioAEmpresa(req, res) {
  const { id } = req.params
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email es requerido' })
  try {
    const empresaId = Number(id)
    // verificar que solicitante pertenece a la empresa
    const pertenece = await prisma.empresa.findFirst({
      where: { id: empresaId, usuarios: { some: { id: req.usuario.id } } },
      select: { id: true }
    })
    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa' })
    }
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    await prisma.empresa.update({
      where: { id: empresaId },
      data: { usuarios: { connect: { id: usuario.id } } }
    })
    return res.json({ ok: true })
  } catch (error) {
    console.error('[invitarUsuarioAEmpresa] Error:', error)
    return res.status(500).json({ error: 'Error al invitar usuario' })
  }
}

// Exporta cada función como propiedad del objeto exports
exports.crearEmpresa = crearEmpresa
exports.editarEmpresa = editarEmpresa
exports.obtenerEmpresaPorId = obtenerEmpresaPorId
exports.listarEmpresasDelUsuario = listarEmpresasDelUsuario
exports.invitarUsuarioAEmpresa = invitarUsuarioAEmpresa
