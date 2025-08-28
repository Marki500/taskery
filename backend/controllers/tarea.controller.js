// controllers/tarea.controller.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mapeos a enums de Prisma (ajusta si tu schema usa otros nombres)
const ESTADO_MAP = {
  pendiente: 'PENDIENTE',
  en_progreso: 'EN_PROGRESO',
  'en progreso': 'EN_PROGRESO',
  completada: 'COMPLETADA',
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADA: 'COMPLETADA',
}

const PRIORIDAD_MAP = {
  baja: 'BAJA',
  media: 'MEDIA',
  alta: 'ALTA',
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
}

// Crear tarea y asignar usuarios
async function crearTarea(req, res) {
  let { nombre, descripcion, proyectoId, estado, prioridad, asignadosIds } = req.body

  // Validaciones básicas
  if (!nombre || !proyectoId) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre y proyectoId',
    })
  }

  // Normalizaciones
  nombre = String(nombre).trim()
  descripcion = typeof descripcion === 'string' ? descripcion.trim() : descripcion
  const estadoEnum = ESTADO_MAP[estado] || ESTADO_MAP['PENDIENTE']
  const prioridadEnum = PRIORIDAD_MAP[prioridad] || PRIORIDAD_MAP['MEDIA']
  const proyectoIdNum = Number(proyectoId)

  if (!proyectoIdNum || Number.isNaN(proyectoIdNum)) {
    return res.status(400).json({ error: 'proyectoId inválido' })
  }

  try {
    // 1) Cargar proyecto + empresa
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoIdNum },
      select: { id: true, nombre: true, empresaId: true },
    })

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    // 2) Verificar que el usuario autenticado pertenece a la empresa del proyecto
    const perteneceUsuario = await prisma.empresa.findFirst({
      where: {
        id: proyecto.empresaId,
        usuarios: { some: { id: req.usuario.id } }, // usuario autenticado es miembro
      },
      select: { id: true },
    })

    if (!perteneceUsuario) {
      return res.status(403).json({ error: 'No tienes acceso a esta empresa/proyecto' })
    }

    // 3) Resolver asignados
    let conectarUsuarios = []
    if (Array.isArray(asignadosIds) && asignadosIds.length > 0) {
      // Convertir a números y filtrar inválidos
      const asignadosNums = asignadosIds
        .map((x) => Number(x))
        .filter((x) => Number.isInteger(x) && x > 0)

      if (asignadosNums.length === 0) {
        return res.status(400).json({ error: 'asignadosIds inválidos' })
      }

      // a) Comprobar que existen
      const usuariosEncontrados = await prisma.usuario.findMany({
        where: { id: { in: asignadosNums } },
        select: { id: true },
      })
      const idsEncontrados = new Set(usuariosEncontrados.map((u) => u.id))
      const idsNoEncontrados = asignadosNums.filter((id) => !idsEncontrados.has(id))
      if (idsNoEncontrados.length > 0) {
        return res.status(400).json({
          error: 'Algunos usuarios no existen',
          detalles: { idsNoEncontrados },
        })
      }

      // b) Comprobar que TODOS pertenecen a la misma empresa del proyecto
      const miembrosEmpresa = await prisma.usuario.findMany({
        where: {
          id: { in: asignadosNums },
          // 👇 el usuario debe pertenecer a la empresa del proyecto
          empresas: { some: { id: proyecto.empresaId } },
        },
        select: { id: true },
      })
      const idsMiembros = new Set(miembrosEmpresa.map((u) => u.id))
      const idsEmpresaDistinta = asignadosNums.filter((id) => !idsMiembros.has(id))
      if (idsEmpresaDistinta.length > 0) {
        return res.status(400).json({
          error: 'Algunos usuarios no pertenecen a la misma empresa del proyecto',
          detalles: { idsEmpresaDistinta },
        })
      }

      conectarUsuarios = asignadosNums.map((id) => ({ id }))
    } else {
      // Si no se especifican asignados → asignar al usuario autenticado
      conectarUsuarios = [{ id: req.usuario.id }]
    }

    // 4) Crear tarea
    const tarea = await prisma.tarea.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        // Conectamos mediante la relación (recomendado) o usa proyectoId si lo tienes como escalar
        proyecto: { connect: { id: proyectoIdNum } },
        estado: estadoEnum,
        prioridad: prioridadEnum,
        usuariosAsignados: { connect: conectarUsuarios },
      },
      include: {
        usuariosAsignados: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    })

    return res.status(201).json(tarea)
  } catch (error) {
    console.error('[crearTarea] Error:', error)
    return res.status(500).json({ error: 'Error al crear la tarea' })
  }
}

// Listar tareas por proyecto (solo si el usuario pertenece a la empresa del proyecto)
async function listarTareasPorProyecto(req, res) {
  const proyectoId = Number(req.params.proyectoId)
  if (!proyectoId || Number.isNaN(proyectoId)) {
    return res.status(400).json({ error: 'proyectoId inválido' })
  }

  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { id: true, empresaId: true },
    })

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' })
    }

    // Verificar pertenencia del usuario autenticado a la empresa del proyecto
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: proyecto.empresaId,
        usuarios: { some: { id: req.usuario.id } },
      },
      select: { id: true },
    })

    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' })
    }

    const tareas = await prisma.tarea.findMany({
      where: { proyectoId },
      include: {
        usuariosAsignados: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(tareas)
  } catch (error) {
    console.error('[listarTareasPorProyecto] Error:', error)
    return res.status(500).json({ error: 'Error al listar tareas' })
  }
}

// Editar una tarea existente (con autorización)
async function editarTarea(req, res) {
  try {
    const { id } = req.params
    let { nombre, descripcion, estado, prioridad } = req.body

    const tareaId = Number(id)
    if (!tareaId) return res.status(400).json({ error: 'id inválido' })

    // 1) Cargar tarea -> proyecto -> empresa
    const tareaActual = await prisma.tarea.findUnique({
      where: { id: tareaId },
      select: { id: true, proyecto: { select: { id: true, empresaId: true } } },
    })
    if (!tareaActual) return res.status(404).json({ error: 'Tarea no encontrada' })

    // 2) Autorizar: usuario debe pertenecer a la empresa
    const pertenece = await prisma.empresa.findFirst({
      where: {
        id: tareaActual.proyecto.empresaId,
        usuarios: { some: { id: req.usuario.id } },
      },
      select: { id: true },
    })
    if (!pertenece) {
      return res.status(403).json({ error: 'No tienes acceso a esta tarea' })
    }

    // 3) Normalizar opcionales
    if (typeof nombre === 'string') nombre = nombre.trim()
    if (typeof descripcion === 'string') descripcion = descripcion.trim()
    const estadoEnum = estado ? (ESTADO_MAP[estado] || null) : null
    const prioridadEnum = prioridad ? (PRIORIDAD_MAP[prioridad] || null) : null

    // 4) Data parcial
    const data = {
      ...(nombre !== undefined ? { nombre } : {}),
      ...(descripcion !== undefined ? { descripcion: descripcion || null } : {}),
      ...(estadoEnum ? { estado: estadoEnum } : {}),
      ...(prioridadEnum ? { prioridad: prioridadEnum } : {}),
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Sin cambios enviados' })
    }

    const tarea = await prisma.tarea.update({
      where: { id: tareaId },
      data,
      include: {
        usuariosAsignados: { select: { id: true, nombre: true, email: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    })

    return res.json(tarea)
  } catch (error) {
    console.error('Error al editar tarea:', error)
    return res.status(500).json({ error: 'Error al editar tarea' })
  }
}



// PATCH /tareas/ordenar
// body: { proyectoId: number, estado: 'pendiente'|'en_progreso'|'completada', ordenIds: number[] }
async function reordenarTareas(req, res) {
  const { proyectoId, estado, ordenIds } = req.body;
  if (!proyectoId || !estado || !Array.isArray(ordenIds)) {
    return res.status(400).json({ error: 'proyectoId, estado y ordenIds son obligatorios' });
  }

  try {
    // normaliza a minúsculas
    let estadoNorm = String(estado || '').toLowerCase();
    if (estadoNorm.startsWith('en')) estadoNorm = 'en_progreso';
    else if (estadoNorm.startsWith('comp')) estadoNorm = 'completada';
    else estadoNorm = 'pendiente';

    // mapea a enum de Prisma (MAYÚSCULAS)
    const ESTADO_MAP = {
      pendiente: 'PENDIENTE',
      en_progreso: 'EN_PROGRESO',
      completada: 'COMPLETADA',
    };
    const estadoEnum = ESTADO_MAP[estadoNorm] || 'PENDIENTE';

    // Si SOLO estás reordenando en la misma columna, bastaría con actualizar 'posicion'.
    // Aquí actualizamos 'posicion' y (por seguridad) también 'estado' al enum correcto.
    const ops = ordenIds.map((id, idx) =>
      prisma.tarea.update({
        where: { id: Number(id) },
        data: {
          posicion: idx,
          estado: estadoEnum, // <- ahora coincide con tu enum de Prisma
        },
      })
    );

    await prisma.$transaction(ops);
    return res.json({ ok: true });
  } catch (e) {
    console.error('Error reordenando tareas', e);
    return res.status(500).json({ error: 'No se pudo reordenar' });
  }
}


module.exports = {
  crearTarea,
  listarTareasPorProyecto,
  editarTarea,
  reordenarTareas,
}
