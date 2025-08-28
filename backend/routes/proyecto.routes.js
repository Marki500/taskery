const express = require('express')
const router = express.Router()

const {
  crearProyecto,
  listarProyectosPorEmpresa,
  listarMisProyectos,
  editarProyecto,
  invitarUsuarioAProyecto,
} = require('../controllers/proyecto.controller')
const { verificarToken } = require('../auth/jwt')

// Crear nuevo proyecto (requiere token)
router.post('/', verificarToken, crearProyecto)

// Obtener proyectos de la empresa del usuario autenticado
router.get('/', verificarToken, listarProyectosPorEmpresa)

// Obtener todos los proyectos del usuario
router.get('/mis-proyectos', verificarToken, listarMisProyectos)

// Editar proyecto
router.put('/:id', verificarToken, editarProyecto)

// Invitar usuario a proyecto
router.post('/:id/invitaciones', verificarToken, invitarUsuarioAProyecto)

module.exports = router
