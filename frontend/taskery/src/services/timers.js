// src/services/timers.js
import { api } from '@/lib/api';

// Iniciar o CAMBIAR el timer a una tarea (switch atómico)
export async function startTimer(tareaId, note) {
  const { data } = await api.post('/timers/start', { tareaId, note });
  return data; // { newTimer: {...} }
}

// Parar el timer activo del usuario
export async function stopTimer() {
  const { data } = await api.post('/timers/stop');
  return data; // { stoppedCount: 0|1 }
}

// Consultar el timer activo
export async function getActiveTimer() {
  const { data } = await api.get('/timers/active');
  return data; // objeto timer o null
}

// Historial por tarea
export async function getTimersByTask(tareaId) {
  const { data } = await api.get(`/timers/tarea/${tareaId}`);
  return data; // Array timers
}
