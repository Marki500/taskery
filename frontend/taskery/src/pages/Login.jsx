// pages/Login.jsx
import React from "react";

// ✅ Usa rutas relativas: Apache ProxyPass ya las enviará al backend
const GOOGLE_AUTH_URL = "/auth/google";
const GITHUB_AUTH_URL = "/auth/github";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      {/* Fondo con radiales sutiles (no estridentes) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40rem 28rem at 20% 5%, rgba(59,162,237,0.10), transparent 60%), radial-gradient(50rem 30rem at 80% 0%, rgba(59,162,237,0.08), transparent 55%)",
        }}
      />
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-[0_10px_40px_-20px_rgba(59,162,237,0.25)] p-8 w-[420px] backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <img src="/vite.svg" alt="Taskery" className="w-10 h-10 opacity-90" />
          <div>
            <div className="text-xl font-semibold text-sky-300">Taskery</div>
            <div className="text-xs text-slate-300/80">by Cram</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-white mb-2">Iniciar sesión</h1>
        <p className="text-sm text-slate-300/80 mb-6">
          Accede con tu cuenta corporativa
        </p>

        <div className="grid gap-3">
          <button
            onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
            className="w-full rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
          >
            Continuar con Google
          </button>
          <button
            onClick={() => (window.location.href = GITHUB_AUTH_URL)}
            className="w-full rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
          >
            Continuar con GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
