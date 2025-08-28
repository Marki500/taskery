const express = require('express')
const { verificarToken } = require('../auth/jwt')
const { enviarInvitacion, aceptarInvitacion } = require('../controllers/invitacion.controller')

const router = express.Router()

router.post('/', verificarToken, enviarInvitacion)
router.post('/aceptar', verificarToken, aceptarInvitacion)

module.exports = router
