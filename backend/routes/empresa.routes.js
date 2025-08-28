// Importamos el router de Express para definir rutas separadas
const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresa.controller');
const { verificarToken } = require('../auth/jwt');

// Ruta protegida para crear empresa
router.post('/', verificarToken, empresaController.crearEmpresa);

// Ruta protegida para listar empresas del usuario autenticado
router.get('/mis-empresas', verificarToken, empresaController.listarEmpresasDelUsuario)

// Ruta para editar una empresa
// Debe ser una función, por ejemplo:
router.put('/:id', verificarToken, empresaController.editarEmpresa);

// GET /empresas/:id  -> Devuelve la empresa, sus proyectos y usuarios
router.get('/:id', verificarToken, empresaController.obtenerEmpresaPorId);

// Eliminar empresa
router.delete('/:id', verificarToken, empresaController.eliminarEmpresa);

// Exportamos este router para poder usarlo en index.js
module.exports = router;


