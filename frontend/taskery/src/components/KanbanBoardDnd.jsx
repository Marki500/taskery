// src/components/KanbanBoardDnd.jsx
import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Play, Square, Trash } from "lucide-react";
import TareaCreateModal from "@/components/TareaCreateModal";

// 👇 IMPORTA EL CONTEXTO DEL TIMER
import { useActiveTimer } from "@/context/ActiveTimerContext";

const COLUMNS = [
  { id: "pendiente", title: "Pendiente" },
  { id: "en_progreso", title: "En progreso" },
  { id: "completada", title: "Completadas" },
];

function normalizeEstado(e) {
  const s = String(e || "").toLowerCase();
  if (s.startsWith("en")) return "en_progreso";
  if (s.startsWith("comp")) return "completada";
  return "pendiente";
}

function badgeColor(p) {
  switch ((p || "").toLowerCase()) {
    case "alta":
      return "bg-red-500/20 text-red-300 border border-red-500/30";
    case "media":
      return "bg-yellow-500/20 text-yellow-200 border border-yellow-500/30";
    case "baja":
      return "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30";
    default:
      return "bg-slate-500/20 text-slate-200 border border-slate-500/30";
  }
}

function msToHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

function TareaCardSortable({ tarea, onEdit, activeTareaId, startTimer, stopTimer, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(tarea.id) });

  const esActiva = Number(activeTareaId) === Number(tarea.id);

  const collapsedWhileDragging = isDragging
    ? { opacity: 0, height: 0, padding: 0, margin: 0, borderWidth: 0, overflow: "hidden" }
    : {};

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...collapsedWhileDragging,
  };

  // Para que los botones no disparen el drag
  const stopDnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border px-4 py-3 shadow-sm transition 
                  bg-white/5 border-white/10 hover:bg-white/10
                  ${esActiva ? "ring-2 ring-sky-400/40" : ""}`}
    >
      {!isDragging && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sky-200 truncate">{tarea.nombre}</span>
            {tarea.descripcion && (
              <span className="text-xs text-slate-300/80 mt-0.5 line-clamp-2">
                {tarea.descripcion}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {tarea.prioridad && (
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeColor(
                  tarea.prioridad
                )}`}
              >
                {tarea.prioridad}
              </span>
            )}

            {typeof tarea.totalMs === 'number' && (
              <span className="text-[11px] font-mono text-slate-400">
                {msToHMS(tarea.totalMs)}
              </span>
            )}

            {/* Botones de timer */}
            {!activeTareaId && (
              <button
                onMouseDown={stopDnd}
                onClick={async (e) => {
                  stopDnd(e);
                  const r = await startTimer(tarea.id);
                  if (r?.error) {
                    alert(r.error?.response?.data?.error || r.error.message || 'No se pudo iniciar temporizador');
                  }
                }}
                className="p-1.5 rounded bg-emerald-600/20 hover:bg-emerald-600/30"
                title="Iniciar temporizador"
              >
                <Play className="w-4 h-4 text-emerald-300" />
              </button>
            )}

            {activeTareaId && !esActiva && (
              <button
                onMouseDown={stopDnd}
                onClick={async (e) => {
                  stopDnd(e);
                  const r = await startTimer(tarea.id); // switch atómico en backend
                  if (r?.error) {
                    alert(r.error?.response?.data?.error || r.error.message || 'No se pudo iniciar temporizador');
                  }
                }}
                className="p-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30"
                title="Cambiar a esta tarea"
              >
                <Play className="w-4 h-4 text-sky-300" />
              </button>
            )}

            {esActiva && (
              <button
                onMouseDown={stopDnd}
                onClick={async (e) => {
                  stopDnd(e);
                  await stopTimer();
                }}
                className="p-1.5 rounded bg-red-600/20 hover:bg-red-600/30"
                title="Parar temporizador"
              >
                <Square className="w-4 h-4 text-red-300" />
              </button>
            )}

            {/* Editar */}
            <button
              onMouseDown={stopDnd}
              onClick={(e) => {
                stopDnd(e);
                onEdit?.(tarea);
              }}
              className="p-1 rounded hover:bg-slate-700"
              title="Editar tarea"
            >
              <Pencil className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onMouseDown={stopDnd}
              onClick={(e) => {
                stopDnd(e);
                onDelete?.(tarea);
              }}
              className="p-1 rounded hover:bg-slate-700 text-red-400"
              title="Eliminar tarea"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Column({ id, title, tareas, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/20 p-3 transition ${
        isOver ? "ring-2 ring-sky-400/30" : ""
      }`}
    >
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-sky-200">{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
          {tareas.length}
        </span>
      </header>
      <div>{children(setNodeRef)}</div>
    </div>
  );
}

function DragCard({ tarea }) {
  if (!tarea) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium text-sky-200">{tarea.nombre}</span>
          {tarea.descripcion && (
            <span className="text-xs text-slate-200/80 mt-0.5 line-clamp-2">
              {tarea.descripcion}
            </span>
          )}
        </div>
        {tarea.prioridad && (
          <span
            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeColor(
              tarea.prioridad
            )}`}
          >
            {tarea.prioridad}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoardDnd({
  tareas = [],
  loading = false,
  onReorderSameColumn, // (col, idsOrdenados)
  onMoveToColumn, // (tareaId, toCol, idsTarget, idsSource)
  onAfterSave, // opcional: refrescar tras guardar en el modal
  onDelete,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  // 👇 CONSUME EL CONTEXTO DEL TIMER
  const { active, start, stop } = useActiveTimer();
  const activeTareaId = active?.tareaId ?? null;

  const grouped = useMemo(() => {
    const g = { pendiente: [], en_progreso: [], completada: [] };
    for (const t of tareas) {
      const e = normalizeEstado(t.estado);
      (g[e] || g.pendiente).push(t);
    }
    return g;
  }, [tareas]);

  const [activeId, setActiveId] = useState(null);
  const [, setOverId] = useState(null);
  const [insertion, setInsertion] = useState({ to: null, index: -1 });

  // Estado para edición (modal)
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const getById = (id) => tareas.find((t) => String(t.id) === String(id));

  const findContainer = (id) => {
    if (grouped.pendiente.some((t) => String(t.id) === String(id))) return "pendiente";
    if (grouped.en_progreso.some((t) => String(t.id) === String(id))) return "en_progreso";
    if (grouped.completada.some((t) => String(t.id) === String(id))) return "completada";
    return null;
  };

  const indexInCol = (col, id) =>
    grouped[col].findIndex((t) => String(t.id) === String(id));

  function computeInsertion(e) {
    const over = e?.over;
    const active = e?.active;
    if (!over || !active) return { to: null, index: -1 };

    const sortable = over.data?.current?.sortable;
    if (sortable && sortable.containerId) {
      const to = sortable.containerId;
      const overIndex = sortable.index ?? -1;

      if (overIndex < 0) return { to, index: grouped[to]?.length ?? 0 };

      const activeTop =
        active.rect?.current?.translated?.top ??
        active.rect?.current?.initial?.top ??
        0;
      const overTop = over.rect?.top ?? 0;
      const overMiddle = overTop + (over.rect?.height ?? 0) / 2;
      const isBelow = activeTop > overMiddle;

      return { to, index: overIndex + (isBelow ? 1 : 0) };
    }

    if (["pendiente", "en_progreso", "completada"].includes(over.id)) {
      const to = over.id;
      return { to, index: grouped[to].length };
    }

    const to = findContainer(over.id);
    if (!to) return { to: null, index: -1 };
    const overIndex = indexInCol(to, over.id);
    if (overIndex < 0) return { to, index: grouped[to].length };

    const activeTop =
      active.rect?.current?.translated?.top ??
      active.rect?.current?.initial?.top ??
      0;
    const overTop = over.rect?.top ?? 0;
    const overMiddle = overTop + (over.rect?.height ?? 0) / 2;
    const isBelow = activeTop > overMiddle;

    return { to, index: overIndex + (isBelow ? 1 : 0) };
  }

  function handleDragStart(e) {
    setActiveId(e.active.id);
  }

  function handleDragEnd(e) {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);
    setInsertion({ to: null, index: -1 });

    if (!over) return;
    if (String(over.id) === String(active.id)) return;

    let to = over.id;
    if (!["pendiente", "en_progreso", "completada"].includes(to)) {
      to =
        over.data?.current?.sortable?.containerId ||
        findContainer(to) ||
        to;
    }
    const from =
      e.active?.data?.current?.sortable?.containerId ||
      findContainer(active.id);

    if (!from || !to) return;

    let targetIndex = grouped[to].length;

    if (!["pendiente", "en_progreso", "completada"].includes(over.id)) {
      const ins = computeInsertion(e);
      if (ins.to === to && ins.index >= 0) targetIndex = ins.index;
    }

    if (from === to) {
      const currIds = grouped[from].map((t) => t.id);
      const fromIndex = indexInCol(from, active.id);
      if (fromIndex === -1) return;

      const newIds = arrayMove(currIds, fromIndex, targetIndex);
      onReorderSameColumn?.(from, newIds);
    } else {
      const sourceIds = grouped[from].map((t) => t.id).filter((id) => String(id) !== String(active.id));
      const targetIds = [...grouped[to].map((t) => t.id)];
      targetIds.splice(targetIndex, 0, active.id);
      onMoveToColumn?.(active.id, to, targetIds, sourceIds);
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={(e) => {
          handleDragStart(e);
          setOverId(e.over?.id ?? null);
          setInsertion(computeInsertion(e));
        }}
        onDragOver={(e) => {
          setOverId(e.over?.id ?? null);
          setInsertion(computeInsertion(e));
        }}
        onDragMove={(e) => {
          setOverId(e.over?.id ?? null);
          setInsertion(computeInsertion(e));
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const items = grouped[col.id];
            const placeholderIndex =
              insertion.to === col.id ? Math.max(0, Math.min(items.length, insertion.index)) : -1;

            return (
              <Column key={col.id} id={col.id} title={col.title} tareas={items}>
                {(setListRef) => (
                  <SortableContext
                    id={col.id}
                    items={items.map((t) => String(t.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul ref={setListRef} className="space-y-2 min-h-24 p-1 rounded-md">
                      {items.map((t, i) => (
                        <React.Fragment key={t.id}>
                          {i === placeholderIndex && activeId && (
                            <li className="h-20 rounded-xl border-2 border-dashed border-sky-400/40 bg-transparent" />
                          )}
                          <TareaCardSortable
                            tarea={t}
                            activeTareaId={activeTareaId}
                            startTimer={async (id) => {
                              const r = await start(id);
                              onAfterSave?.();
                              return r;
                            }}
                            stopTimer={async () => {
                              await stop();
                              onAfterSave?.();
                            }}
                            onEdit={(task) => {
                          setEditing(task);
                          setEditOpen(true);
                        }}
                        onDelete={(task) => {
                          onDelete?.(task);
                        }}
                      />
                        </React.Fragment>
                      ))}

                      {placeholderIndex === items.length && activeId && (
                        <li className="h-20 rounded-xl border-2 border-dashed border-sky-400/40 bg-transparent" />
                      )}

                      {!loading && items.length === 0 && (
                        <li className="text-xs text-slate-400/70 italic">Vacío</li>
                      )}
                    </ul>
                  </SortableContext>
                )}
              </Column>
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          <DragCard tarea={getById(activeId)} />
        </DragOverlay>
      </DndContext>

      {/* Modal crear/editar tarea */}
      <TareaCreateModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        initialData={editing}
        onSaved={() => {
          setEditOpen(false);
          setEditing(null);
          onAfterSave?.();
        }}
      />
    </>
  );
}
