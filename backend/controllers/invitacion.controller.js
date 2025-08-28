const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const crypto = require('crypto')
const nodemailer = require('nodemailer')

// Envia una invitación por correo electrónico
exports.enviarInvitacion = async (req, res) => {
  const { email, empresaId } = req.body

  if (!email || !empresaId) {
    return res.status(400).json({ mensaje: 'Email y empresaId son obligatorios' })
  }

  // Verifica que el usuario pertenece a la empresa
  const pertenece = await prisma.empresa.findFirst({
    where: {
      id: Number(empresaId),
      usuarios: { some: { id: req.usuario.id } }
    },
    select: { id: true }
  })

  if (!pertenece) {
    return res.status(403).json({ mensaje: 'No tienes acceso a esta empresa' })
  }

  const token = crypto.randomBytes(20).toString('hex')

  try {
    await prisma.invitacion.create({
      data: {
        email,
        token,
        empresa: { connect: { id: Number(empresaId) } }
      }
    })

    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?invite=${token}`

    let transporter

    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    }

    if (transporter) {
      await transporter.sendMail({
        to: email,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        subject: 'Invitación a Taskery',
        text: `Has sido invitado a Taskery. Regístrate aquí: ${link}`,
      })
    } else {
      console.log(`Invitación para ${email}: ${link}`)
    }

    res.json({ mensaje: 'Invitación enviada' })
  } catch (error) {
    console.error('Error enviando invitación', error)
    res.status(500).json({ mensaje: 'Error enviando invitación' })
  }
}

// Acepta una invitación y agrega el usuario a la empresa
exports.aceptarInvitacion = async (req, res) => {
  const { token } = req.body
  if (!token) {
    return res.status(400).json({ mensaje: 'Token requerido' })
  }

  try {
    const invitacion = await prisma.invitacion.findUnique({ where: { token } })
    if (!invitacion || invitacion.aceptada) {
      return res.status(400).json({ mensaje: 'Invitación inválida' })
    }

    await prisma.usuario.update({
      where: { id: req.usuario.id },
      data: {
        empresas: { connect: { id: invitacion.empresaId } }
      }
    })

    await prisma.invitacion.update({
      where: { id: invitacion.id },
      data: { aceptada: true }
    })

    res.json({ mensaje: 'Invitación aceptada' })
  } catch (error) {
    console.error('Error aceptando invitación', error)
    res.status(500).json({ mensaje: 'Error aceptando invitación' })
  }
}
