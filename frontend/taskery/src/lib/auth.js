// src/lib/auth.js
// Encapsula todo lo de "token" para que App.jsx quede limpio

const KEY = 'token'; // si prefieres sessionStorage, cambia aquí

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

export function pickTokenFromURL() {
  // Lee ?token=... y lo elimina de la barra de direcciones
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    setToken(urlToken);
    // Limpia el query para que al refrescar no repita el proceso
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
