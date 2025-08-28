// src/services/empresas.js
import { api } from '@/lib/api';

export async function crearEmpresa(payload) {
  const { data } = await api.post('/empresas', payload);
  return data;
}

export async function listarMisEmpresas() {
  const { data } = await api.get('/empresas/mis-empresas');
  return data;
}

export async function obtenerEmpresa(id) {
  const { data } = await api.get(`/empresas/${id}`);
  return data;
}

export async function editarEmpresa(id, payload) {
  const { data } = await api.put(`/empresas/${id}`, payload);
  return data;
}

export async function invitarUsuarioAEmpresa(id, email) {
  const { data } = await api.post(`/empresas/${id}/invitaciones`, { email });
  return data;
}
