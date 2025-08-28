// src/pages/ProyectosPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { listarProyectosPorEmpresa } from '@/services/proyectos';
import { listarMisEmpresas } from '@/services/empresas';
import ProyectoCreateModal from '@/components/ProyectoCreateModal';
import Navbar from '@/components/Navbar';
import { ActiveTimerProvider } from '@/context/ActiveTimerContext';
import TimeBar from '@/components/TimeBar';
import { api } from '@/lib/api';
import { clearToken } from '@/lib/auth';

export default function ProyectosPage({ empresaId: initialEmpresaId }) {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState(initialEmpresaId || '');
  const [proyectos, setProyectos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [usuario, setUsuario] = useState(null);

  async function loadEmpresas() {
    const data = await listarMisEmpresas();
    setEmpresas(data || []);
    if (!empresaId && data && data.length > 0) {
      const firstId = String(data[0].id);
      setEmpresaId(firstId);
      const url = new URL(window.location);
      url.searchParams.set('empresaId', firstId);
      window.history.replaceState({}, '', url);
    }
  }

  useEffect(() => {
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function handleEmpresaChange(e) {
    const id = e.target.value;
    setEmpresaId(id);
    const url = new URL(window.location);
    if (id) {
      url.searchParams.set('empresaId', id);
    } else {
      url.searchParams.delete('empresaId');
    }
    window.history.replaceState({}, '', url);
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
              href: empresaId
                ? `/proyectos?empresaId=${empresaId}`
                : '/proyectos',
              label: 'Proyectos',
            },
          ]}
        />
        <main className="flex-1 p-4">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl text-sky-200">Proyectos</h1>
              <select
                value={empresaId}
                onChange={handleEmpresaChange}
                className="bg-slate-800 text-white rounded-lg px-2 py-1"
              >
                {empresas.map((e) => (
                  <option key={e.id} value={e.id} className="bg-slate-800 text-white">
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
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
                <button
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                  className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </main>

        <ProyectoCreateModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          empresa={empresaId ? { id: empresaId } : null}
          onCreated={load}
          onUpdated={load}
          initialData={editing}
        />
      </div>
      <TimeBar />
    </ActiveTimerProvider>
  );
}

