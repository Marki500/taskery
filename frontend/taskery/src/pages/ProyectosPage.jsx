// src/pages/ProyectosPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { listarProyectosPorEmpresa } from '@/services/proyectos';
import ProyectoCreateModal from '@/components/ProyectoCreateModal';
import Navbar from '@/components/Navbar';
import { ActiveTimerProvider } from '@/context/ActiveTimerContext';
import TimeBar from '@/components/TimeBar';
import { api } from '@/lib/api';
import { clearToken } from '@/lib/auth';

export default function ProyectosPage({ empresaId }) {
  const [proyectos, setProyectos] = useState([]);
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const load = useCallback(async () => {
    if (!empresaId) return;
    const data = await listarProyectosPorEmpresa(empresaId);
    setProyectos(data || []);
  }, [empresaId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
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
        <Navbar
          usuario={usuario}
          onLogout={handleLogout}
          pages={[
            { href: '/empresas', label: 'Empresas' },
            {
              href: empresaId ? `/proyectos/${empresaId}` : '/proyectos',
              label: 'Proyectos',
            },
          ]}
        />
        <main className="flex-1 p-4">
          <div className="flex justify-between mb-3">
            <h1 className="text-xl text-sky-200">Proyectos</h1>
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500"
            >
              Nuevo
            </button>
          </div>

          <ul className="space-y-2">
            {proyectos.map((p) => (
              <li
                key={p.id}
                className="p-3 rounded-xl bg-slate-800 border border-white/10 flex justify-between items-center"
              >
                <div>
                  <div className="text-slate-100 font-medium">{p.nombre}</div>
                  {p.descripcion && (
                    <div className="text-slate-300/80 text-sm">{p.descripcion}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </main>

        <ProyectoCreateModal
          open={open}
          onClose={() => setOpen(false)}
          empresa={empresaId ? { id: empresaId } : null}
          onCreated={load}
        />
      </div>
      <TimeBar />
    </ActiveTimerProvider>
  );
}

