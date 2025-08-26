const { PrismaClient, Rol } = require('@prisma/client')
const prisma = new PrismaClient()

// Crear nuevo usuario
async function crearUsuario(req, res) {
  const { email, nombre, avatar, proveedor, oauthId, rol, empresaId } = req.body

  if (!email || !nombre || !rol || !empresaId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' })
    }

    const usuario = await prisma.usuario.create({
      data: { email, nombre, avatar, proveedor, oauthId, rol, empresaId }
    })

    res.status(201).json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

// Listar usuarios de la misma empresa que el usuario autenticado
async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { empresaId: req.usuario.empresaId },
      select: { id: true, nombre: true, email: true, rol: true, createdAt: true }
    })

    res.json(usuarios)
  } catch (error) {
    console.error('[listarUsuarios] Error:', error)
    res.status(500).json({ error: 'Error al listar usuarios' })
  }
}

module.exports = { crearUsuario, listarUsuarios }
