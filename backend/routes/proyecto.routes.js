const express = require('express')
const router = express.Router()

const { crearProyecto, listarProyectosPorEmpresa } = require('../controllers/proyecto.controller')
const { verificarToken } = require('../auth/jwt')

// Crear nuevo proyecto (requiere token)
router.post('/', verificarToken, crearProyecto)

// Obtener proyectos de la empresa del usuario autenticado
router.get('/', verificarToken, listarProyectosPorEmpresa)

module.exports = router
