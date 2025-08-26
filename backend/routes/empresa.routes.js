// Importamos el router de Express para definir rutas separadas
const express = require('express')
const router = express.Router()

// Importamos las funciones del controlador (¡ambas!)
const { crearEmpresa, obtenerEmpresaPorId } = require('../controllers/empresa.controller')

// Definimos la ruta POST /empresas que ejecuta la función crearEmpresa
router.post('/', crearEmpresa)

// GET /empresas/:id  -> Devuelve la empresa, sus proyectos y usuarios
router.get('/:id', obtenerEmpresaPorId)

// Exportamos este router para poder usarlo en index.js
module.exports = router


