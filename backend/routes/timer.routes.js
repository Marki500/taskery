// routes/timers.js
const express = require('express')
const router = express.Router()

const {
  iniciarTimer,
  detenerTimerActual,   // 👈 nuevo
  detenerTimerPorId,    // 👈 renombrado del tuyo
  obtenerTimerActivo,   // 👈 nuevo
  listarTimersPorTarea
} = require('../controllers/timer.controller')

const { verificarToken } = require('../auth/jwt')

// Iniciar o cambiar timer
router.post('/start', verificarToken, iniciarTimer)

// Detener el timer activo del usuario
router.post('/stop', verificarToken, detenerTimerActual)

// (Opcional) detener por ID
router.post('/stop/:id', verificarToken, detenerTimerPorId)

// Consultar el timer activo
router.get('/active', verificarToken, obtenerTimerActivo)

// Histórico por tarea
router.get('/tarea/:tareaId', verificarToken, listarTimersPorTarea)

module.exports = router
