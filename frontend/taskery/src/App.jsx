// App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./pages/Login";
import EmpresaCreateModal from "./components/EmpresaCreateModal";
import ProyectoCreateModal from "./components/ProyectoCreateModal";
import TareaCreateModal from "./components/TareaCreateModal";
import { api } from "./lib/api";
import { getToken, pickTokenFromURL, clearToken, getInviteToken, clearInviteToken } from "./lib/auth";

// ✅ Importa el board con dnd-kit
import KanbanBoardDnd from "./components/KanbanBoardDnd";
import { actualizarEstadoTarea, reordenarTareas } from "./services/tareas";
import { getTimersByTask } from "./services/timers";

// ✅ NUEVO: Contexto del timer + barra
import { ActiveTimerProvider } from "./context/ActiveTimerContext";
import TimeBar from "./components/TimeBar";
import Navbar from "./components/Navbar";

export default function App() {
  // Auth & data
  const [token, setToken] = useState(getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);

  // Empresas / Proyectos / Tareas
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);

  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);

  const [tareas, setTareas] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);

  // UI
  const [showCreateEmpresa, setShowCreateEmpresa] = useState(false);
  const [showCreateProyecto, setShowCreateProyecto] = useState(false);
  const [showCreateTarea, setShowCreateTarea] = useState(false);

  // 1) Captura token de la URL una sola vez
  useEffect(() => {
    pickTokenFromURL();
    setToken(getToken());
  }, []);

  async function loadEmpresas() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/empresas/mis-empresas");
      const list = res.data || [];
      setEmpresas(list);
      if (list.length > 0 && !selectedEmpresa) {
        setSelectedEmpresa(list[0]);
      }
    } catch (err) {
      console.error("Error al cargar empresas:", err);
      setError("No se pudieron cargar las empresas.");
    } finally {
      setLoading(false);
    }
  }

  // 2) Carga empresas del usuario autenticado
  useEffect(() => {
    if (!token) return;
    loadEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 2.1) Obtiene datos del usuario y acepta invitación si existe
  useEffect(() => {
    if (!token) return;

    api
      .get('/me')
      .then((res) => setUsuario(res.data))
      .catch(() => setUsuario(null));

    const invite = getInviteToken();
    if (invite) {
      api
        .post('/invitaciones/aceptar', { token: invite })
        .then(() => {
          clearInviteToken();
          loadEmpresas();
        })
        .catch((err) => console.error('Error aceptando invitación:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 3) Cuando cambia la empresa, carga sus proyectos
  useEffect(() => {
    if (!token || !selectedEmpresa) return;

    setLoading(true);
    setError("");

    api
      .get(`/empresas/${selectedEmpresa.id}`)
      .then((res) => {
        const proys = res.data?.proyectos || [];
        setProyectos(proys);
        setSelectedProyecto(proys[0] || null);
      })
      .catch((err) => {
        console.error("Error al cargar proyectos:", err);
        setError("No se pudieron cargar los proyectos.");
        setProyectos([]);
        setSelectedProyecto(null);
      })
      .finally(() => setLoading(false));
  }, [token, selectedEmpresa]);

  // 🔁 Reutilizable para refrescar tareas cuando quieras
  async function loadTareas() {
    if (!token || !selectedProyecto) {
      setTareas([]);
      return;
    }
    setLoadingTareas(true);
    setError("");
    try {
      const res = await api.get(`/tareas/${selectedProyecto.id}`);
      const list = res.data || [];
      const withTimes = await Promise.all(
        list.map(async (t) => {
          try {
            const timers = await getTimersByTask(t.id);
            const totalMs = timers
              .filter((tm) => tm.fin)
              .reduce(
                (sum, tm) => sum + (new Date(tm.fin) - new Date(tm.inicio)),
                0
              );
            return { ...t, totalMs };
          } catch {
            return { ...t, totalMs: 0 };
          }
        })
      );
      setTareas(withTimes);
    } catch (err) {
      console.error("Error al cargar tareas:", err);
      setError("No se pudieron cargar las tareas.");
      setTareas([]);
    } finally {
      setLoadingTareas(false);
    }
  }

  // 4) Cuando cambia el proyecto, carga sus tareas
  useEffect(() => {
    if (!token || !selectedProyecto) {
      setTareas([]);
      return;
    }
    loadTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedProyecto]);

  function handleInvite() {
    const email = prompt('Correo del usuario a invitar:');
    if (!email || !selectedEmpresa) return;
    api
      .post('/invitaciones', { email, empresaId: selectedEmpresa.id })
      .then(() => alert('Invitación enviada'))
      .catch((err) => {
        console.error('Error enviando invitación:', err);
        alert('No se pudo enviar la invitación');
      });
  }

  // 5) Logout manual
  function handleLogout() {
    clearToken();
    setToken("");
    setEmpresas([]);
    setProyectos([]);
    setSelectedEmpresa(null);
    setSelectedProyecto(null);
    setUsuario(null);
    setTareas([]);
  }

  if (!token) return <Login />;

  return (
    <ActiveTimerProvider>
      <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
        <Navbar
          usuario={usuario}
          onLogout={handleLogout}
          pages={[
            { href: "/empresas", label: "Empresas" },
            {
              href: selectedEmpresa
                ? `/proyectos?empresaId=${selectedEmpresa.id}`
                : "/proyectos",
              label: "Proyectos",
            },
          ]}
        />
        <div className="flex flex-1 relative">
          {/* Fondo */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60rem 40rem at -10% -20%, rgba(59,162,237,0.10), transparent 60%), radial-gradient(40rem 30rem at 110% -10%, rgba(59,162,237,0.08), transparent 55%)",
            }}
          />

          {/* Sidebar */}
          <Sidebar
            empresas={empresas}
            selectedEmpresa={selectedEmpresa}
            onSelectEmpresa={(em) => setSelectedEmpresa(em)}
            proyectos={proyectos}
            selectedProyecto={selectedProyecto}
            onSelectProyecto={(proy) => setSelectedProyecto(proy)}
            onNuevaEmpresa={() => setShowCreateEmpresa(true)}
            onNuevoProyecto={() => setShowCreateProyecto(true)}
          />

          {/* Área principal: tareas */}
          <main className="flex-1 p-10">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-sky-300">
                {selectedProyecto
                  ? selectedProyecto.nombre
                  : selectedEmpresa
                  ? `Proyectos de ${selectedEmpresa.nombre}`
                  : "Selecciona una empresa"}
              </h1>
              {selectedEmpresa && (
                <p className="text-sm text-slate-300/80 mt-1">
                  Empresa: <span className="text-sky-200">{selectedEmpresa.nombre}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedProyecto && (
                <button
                  onClick={() => setShowCreateTarea(true)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold"
                >
                  + Nueva tarea
                </button>
              )}
              {(loading || loadingTareas) && (
                <span className="text-xs text-slate-300/80">Cargando…</span>
              )}
              {error && (
                <span className="text-xs px-2 py-1 rounded bg-red-400/20 text-red-200 border border-red-400/30">
                  {error}
                </span>
              )}
              <button
                onClick={handleInvite}
                className="text-xs px-3 py-1.5 rounded-xl bg:white/5 hover:bg-white/10 border border-white/10"
                disabled={!selectedEmpresa}
              >
                Invitar
              </button>
            </div>
          </header>

          {/* Kanban de tareas (3 columnas con Drag & Drop) */}
          <section>
            <h2 className="text-sm font-medium text-slate-300/80 mb-3">Tareas</h2>
            {!selectedProyecto && (
              <div className="text-sm text-slate-400/80">
                Selecciona un proyecto para ver sus tareas.
              </div>
            )}

            {selectedProyecto && (
              <KanbanBoardDnd
                tareas={tareas}
                loading={loading || loadingTareas}
                onAfterSave={loadTareas}
                onReorderSameColumn={async (col, idsOrdenados) => {
                  // Normaliza estado igual que el board
                  const norm = (e) => {
                    const s = String(e || "").toLowerCase();
                    if (s.startsWith("en")) return "en_progreso";
                    if (s.startsWith("comp")) return "completada";
                    return "pendiente";
                  };

                  // Optimista en UI: reordena solo esa columna
                  setTareas((prev) => {
                    const byId = Object.fromEntries(prev.map((t) => [t.id, t]));
                    const inColSet = new Set(
                      prev.filter((t) => norm(t.estado) === col).map((t) => t.id)
                    );
                    const otros = prev.filter((t) => !inColSet.has(t.id));
                    const reordenados = idsOrdenados.map((id) => byId[id]).filter(Boolean);
                    return [...otros, ...reordenados];
                  });

                  try {
                    await reordenarTareas(selectedProyecto.id, col, idsOrdenados);
                  } catch (e) {
                    console.error("Fallo reordenando", e);
                    await loadTareas(); // recupera estado del servidor
                  } finally {
                    // Garantiza consistencia
                    await loadTareas();
                  }
                }}
                onMoveToColumn={async (tareaId, toCol, targetIds, sourceIds) => {
                  const to = toCol; // 'pendiente' | 'en_progreso' | 'completada'

                  // Optimista en UI: cambia estado y aplica orden en ambas columnas
                  setTareas((prev) => {
                    const byId = Object.fromEntries(prev.map((t) => [t.id, t]));

                    const targetTasks = targetIds.map((id) => ({ ...byId[id], estado: to }));
                    const sourceTasks = sourceIds.map((id) => byId[id]); // mantiene estado de origen
                    const keep = prev.filter(
                      (t) =>
                        !targetIds.includes(t.id) &&
                        !sourceIds.includes(t.id) &&
                        String(t.id) !== String(tareaId)
                    );
                    return [...keep, ...sourceTasks, ...targetTasks];
                  });

                  try {
                    // 1) Cambia estado del ítem movido
                    await actualizarEstadoTarea(Number(tareaId), to);
                    // 2) Persiste orden en destino
                    await reordenarTareas(selectedProyecto.id, to, targetIds);
                    // 3) Persiste orden en origen
                    const movedPrev = tareas.find((t) => t.id === Number(tareaId));
                    if (movedPrev) {
                      const s = String(movedPrev.estado || "").toLowerCase();
                      const fromCol =
                        s.startsWith("en")
                          ? "en_progreso"
                          : s.startsWith("comp")
                          ? "completada"
                          : "pendiente";
                      await reordenarTareas(selectedProyecto.id, fromCol, sourceIds);
                    }
                  } catch (e) {
                    console.error("Fallo moviendo/reordenando", e);
                  } finally {
                    // Asegura consistencia final desde el backend
                    await loadTareas();
                  }
                }}
              />
            )}
          </section>
        </main>

        {/* Modales */}
        <EmpresaCreateModal
          open={showCreateEmpresa}
          onClose={() => setShowCreateEmpresa(false)}
          onCreated={(nueva) => {
            setEmpresas((prev) => [...prev, nueva]);
            setSelectedEmpresa(nueva);
            setProyectos([]);
            setSelectedProyecto(null);
            setTareas([]);
          }}
        />

        <ProyectoCreateModal
          open={showCreateProyecto}
          onClose={() => setShowCreateProyecto(false)}
          empresa={selectedEmpresa}
          onCreated={(nuevo) => {
            setProyectos((prev) => [nuevo, ...prev]);
            setSelectedProyecto(nuevo);
          }}
        />

        <TareaCreateModal
          open={showCreateTarea}
          onClose={() => setShowCreateTarea(false)}
          proyecto={selectedProyecto}
          onCreated={(nueva) => {
            setTareas((prev) => [nueva, ...prev]);
          }}
        />
        </div>
      </div>

      {/* Barra global del temporizador */}
      <TimeBar onStop={loadTareas} />
    </ActiveTimerProvider>
  );
}
