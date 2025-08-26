const express = require('express')
const router = express.Router()

// Middleware de autenticación
const { verificarToken } = require('../auth/jwt')

// Controladores
const { crearTarea, listarTareasPorProyecto } = require('../controllers/tarea.controller')

// Protege todas las rutas de este archivo
router.use(verificarToken)

// POST /tareas  -> Crea una tarea nueva
router.post('/', crearTarea)

// GET /tareas/:proyectoId -> Lista tareas del proyecto
router.get('/:proyectoId', listarTareasPorProyecto)

module.exports = router
