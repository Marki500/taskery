// Importamos el router de Express
const express = require('express')
const router = express.Router()

// Importamos la función del controlador que manejará la creación de usuarios
const { crearUsuario, listarUsuarios } = require('../controllers/usuario.controller')

// Importamos el middleware de autenticación
const { verificarToken } = require('../auth/jwt')

// Ruta pública: crear nuevo usuario
router.post('/', crearUsuario)

// Ruta protegida: listar usuarios de una empresa
router.get('/', verificarToken, listarUsuarios)

// Exportamos el router para poder usarlo en index.js
module.exports = router
