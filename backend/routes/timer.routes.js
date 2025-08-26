// Importamos router de Express
const express = require('express')
const router = express.Router()

// Importamos las funciones del controlador
const { iniciarTimer, detenerTimer, listarTimersPorTarea } = require('../controllers/timer.controller')

// Importamos el middleware de autenticación
const { verificarToken } = require('../auth/jwt')

// POST /timers/start -> Iniciar un temporizador
router.post('/start', verificarToken, iniciarTimer)

// POST /timers/stop/:id -> Detener un temporizador por su ID
router.post('/stop/:id', verificarToken, detenerTimer)

// GET /timers/tarea/:tareaId -> Lista timers de una tarea
router.get('/tarea/:tareaId', verificarToken, listarTimersPorTarea)

module.exports = router
