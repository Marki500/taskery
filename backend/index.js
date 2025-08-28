const express = require('express')
const cors = require('cors')
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')
const { PrismaClient } = require('@prisma/client')

// Inicializaciones
const app = express()
const prisma = new PrismaClient()

// Middleware básico
app.use(cors())
app.use(express.json())

// Sesión para Passport (necesaria aunque no guardemos sesión real)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}))

// Passport inicialización
app.use(passport.initialize())
app.use(passport.session())

// Cargar estrategias
require('./auth/google')(passport)
require('./auth/github')(passport)

// Rutas públicas de autenticación
const authRoutes = require('./routes/auth.routes')
app.use('/auth', authRoutes)

// Rutas protegidas de la API
app.use('/api/empresas', require('./routes/empresa.routes'))
app.use('/api/usuarios', require('./routes/usuario.routes'))
app.use('/api/proyectos', require('./routes/proyecto.routes'))
app.use('/api/tareas', require('./routes/tarea.routes'))
app.use('/api/timers', require('./routes/timer.routes'))
app.use('/api/invitaciones', require('./routes/invitacion.routes'))

// 👇 Añade esto para habilitar /api/me
app.use('/api', require('./routes/auth.routes'))

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('🚀 Backend de Taskery funcionando!')
})

// Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`)
})
