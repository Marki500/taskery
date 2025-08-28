// src/pages/EmpresasPage.jsx
import React, { useEffect, useState } from 'react';
import { listarMisEmpresas } from '@/services/empresas';
import EmpresaCreateModal from '@/components/EmpresaCreateModal';
import Navbar from '@/components/Navbar';
import { ActiveTimerProvider } from '@/context/ActiveTimerContext';
import TimeBar from '@/components/TimeBar';
import { api } from '@/lib/api';
import { clearToken } from '@/lib/auth';

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState([]);
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  async function load() {
    const data = await listarMisEmpresas();
    setEmpresas(data || []);
  }

  useEffect(() => {
    load();
    api
      .get('/me')
      .then((res) => setUsuario(res.data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    clearToken();
    window.location.href = '/';
  }

  return (
    <ActiveTimerProvider>
      <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
        <Navbar usuario={usuario} onLogout={handleLogout} />
        <main className="flex-1 p-4">
          <div className="flex justify-between mb-3">
            <h1 className="text-xl text-sky-200">Empresas</h1>
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500"
            >
              Nueva
            </button>
          </div>

          <ul className="space-y-2">
            {empresas.map((e) => (
              <li
                key={e.id}
                className="p-3 rounded-xl bg-slate-800 border border-white/10 flex justify-between items-center"
              >
                <div>
                  <div className="text-slate-100 font-medium">{e.nombre}</div>
                  {e.descripcion && (
                    <div className="text-slate-300/80 text-sm">{e.descripcion}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </main>

        <EmpresaCreateModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={load}
        />
      </div>
      <TimeBar />
    </ActiveTimerProvider>
  );
}

