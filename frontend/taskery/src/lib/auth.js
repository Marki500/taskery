// src/lib/auth.js
// Encapsula todo lo de "token" para que App.jsx quede limpio

const KEY = 'token'; // si prefieres sessionStorage, cambia aquí
const INVITE_KEY = 'invite-token';

export function setToken(token) {
  // Para MVP, localStorage. En producción: cookie httpOnly + refresh token.
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY) || '';
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export function setInviteToken(token) {
  localStorage.setItem(INVITE_KEY, token);
}

export function getInviteToken() {
  return localStorage.getItem(INVITE_KEY) || '';
}

export function clearInviteToken() {
  localStorage.removeItem(INVITE_KEY);
}

export function pickTokenFromURL() {
  // Lee ?token=... y ?invite=... y lo elimina de la barra de direcciones
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  const inviteToken = params.get('invite');
  if (urlToken) setToken(urlToken);
  if (inviteToken) setInviteToken(inviteToken);
  if (urlToken || inviteToken) {
    // Limpia los parámetros de la URL y vuelve a la raíz para evitar rutas como /login/success
    window.history.replaceState({}, document.title, '/');
  }
}
