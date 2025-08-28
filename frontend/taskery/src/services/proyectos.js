// src/services/proyectos.js
import { api } from '@/lib/api';

export async function crearProyecto(payload) {
  const { data } = await api.post('/proyectos', payload);
  return data;
}

export async function listarProyectosPorEmpresa(empresaId) {
  const { data } = await api.get('/proyectos', { params: { empresaId } });
  return data;
}

export async function editarProyecto(id, payload) {
  const { data } = await api.put(`/proyectos/${id}`, payload);
  return data;
}
