const express = require('express')
const passport = require('passport')
const { generarToken, verificarToken } = require('../auth/jwt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const router = express.Router()

// ----------- GOOGLE -----------

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: '/auth/failed'
}), (req, res) => {
  const token = generarToken(req.user)
  res.redirect(`https://todo.bycram.dev/login/success?token=${token}`)
})

// ----------- GITHUB -----------

router.get('/github', passport.authenticate('github', {
  scope: ['user:email']
}))

router.get('/github/callback', passport.authenticate('github', {
  session: false,
  failureRedirect: '/auth/failed'
}), (req, res) => {
  const token = generarToken(req.user)
  res.redirect(`https://todo.bycram.dev/login/success?token=${token}`)
})

// ----------- FALLO -----------

router.get('/failed', (req, res) => {
  res.status(401).json({ mensaje: 'Autenticación fallida' })
})

// ----------- /me -----------

router.get('/me', verificarToken, async (req, res) => {
  try {
    // Si por alguna razón el middleware no adjunta el usuario,
    // respondemos con 401 en lugar de provocar un fallo interno.
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ mensaje: 'No autenticado' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      include: { empresas: true }
    })

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    }
    // Prisma puede retornar campos BigInt que Express no sabe serializar.
    // Convertimos cualquier BigInt a Number antes de responder.
    const usuarioLimpio = JSON.parse(
      JSON.stringify(usuario, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      )
    )

    res.json(usuarioLimpio)
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario' })
  }
})

module.exports = router
