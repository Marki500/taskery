import React from "react";

export default function Navbar({ usuario, onLogout, pages = [] }) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white/5 backdrop-blur border-b border-white/10">
      <div className="flex items-center gap-6">
        <img src="/Taskery-logo.webp" alt="Taskery Logo" className="h-12" />
        <ul className="flex items-center gap-4">
          {pages.map((p, index) => (
            <li key={index}>
              <a
                href={p.href}
                className="text-sm text-slate-200 hover:text-white"
              >
                {p.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3">
        {usuario && (
          <div className="flex items-center gap-2">
            <span className="text-sm">{usuario.nombre}</span>
            {usuario.avatar && (
              <img
                src={usuario.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
          </div>
        )}
        <button
          onClick={onLogout}
          className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
