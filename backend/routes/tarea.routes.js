const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');

// Middleware de autenticación
const { verificarToken } = require('../auth/jwt')

// Protege todas las rutas de este archivo
router.use(verificarToken)

// Ruta para crear una tarea
// Ahora acepta nombre, descripcion, estado y prioridad
router.post('/', tareaController.crearTarea);

// Ruta para editar una tarea
// Ahora acepta nombre, descripcion, estado y prioridad
router.put('/:id', tareaController.editarTarea);

// GET /tareas/:proyectoId -> Lista tareas del proyecto
// Usamos la función desde el controlador
router.get('/:proyectoId', tareaController.listarTareasPorProyecto)

// PATCH /tareas/ordenar
router.patch('/ordenar', tareaController.reordenarTareas);

module.exports = router
