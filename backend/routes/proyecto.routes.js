const express = require('express')
const router = express.Router()

const { crearProyecto, listarProyectosPorEmpresa, editarProyecto, eliminarProyecto } = require('../controllers/proyecto.controller')
const { verificarToken } = require('../auth/jwt')

// Crear nuevo proyecto (requiere token)
router.post('/', verificarToken, crearProyecto)

// Obtener proyectos de la empresa del usuario autenticado
router.get('/', verificarToken, listarProyectosPorEmpresa)

// Editar proyecto
router.put('/:id', verificarToken, editarProyecto)

// Eliminar proyecto
router.delete('/:id', verificarToken, eliminarProyecto)

module.exports = router
