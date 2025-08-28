// components/Sidebar/Sidebar.jsx
import { useState } from "react"

export default function Sidebar({
  empresas = [],
  selectedEmpresa,
  onSelectEmpresa,
  proyectos = [],
  selectedProyecto,
  onSelectProyecto,
  onNuevaEmpresa,
  onNuevoProyecto, // ← NUEVO
}) {
  const [projectSearch, setProjectSearch] = useState("")
  const filteredProyectos = proyectos.filter((p) =>
    p.nombre.toLowerCase().includes(projectSearch.toLowerCase())
  )

  return (
    <aside className="w-72 bg-white/5 backdrop-blur border border-white/10 shadow-[0_10px_40px_-20px_rgba(59,162,237,0.25)] flex flex-col p-6">
      {/* Empresa selector */}
      <div className="mb-4">
        <label className="block text-xs text-slate-300/80 mb-1">Empresa</label>
        <div className="flex gap-2">
          <select
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/40"
            value={selectedEmpresa?.id || ""}
            onChange={(e) => {
              const id = Number(e.target.value)
              const empresa = empresas.find((em) => em.id === id) || null
              onSelectEmpresa?.(empresa)
            }}
          >
            {empresas.length === 0 && <option value="">Sin empresas</option>}
            {empresas.map((em) => (
              <option key={em.id} value={em.id}>
                {em.nombre}
              </option>
            ))}
          </select>
          {onNuevaEmpresa && (
            <button
              type="button"
              onClick={onNuevaEmpresa}
              className="shrink-0 rounded-lg px-3 py-2 text-sm bg-sky-500 hover:bg-sky-600 font-semibold"
              title="Nueva empresa"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Proyectos */}
      <nav className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-slate-300/80">Proyectos</h2>
          {onNuevoProyecto && (
            <button
              type="button"
              onClick={onNuevoProyecto}
              className="text-xs rounded-lg px-2 py-1 bg-white/10 hover:bg-white/15 border border-white/10"
              title="Nuevo proyecto"
              disabled={!selectedEmpresa}
            >
              + Proyecto
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
          className="w-full mb-2 px-3 py-1 text-sm rounded-lg bg-white/10 border border-white/10 placeholder-slate-400/80 focus:outline-none"
        />
        <ul className="space-y-1.5">
          {filteredProyectos.map((proy) => {
            const isActive = selectedProyecto && proy.id === selectedProyecto.id
            return (
              <li
                key={proy.id}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm border ${
                  isActive
                    ? "bg-sky-400/15 text-sky-200 border-sky-400/20"
                    : "text-slate-200 hover:bg-white/5 border-transparent"
                }`}
                onClick={() => onSelectProyecto?.(proy)}
              >
                {proy.nombre}
              </li>
            )
          })}
          {filteredProyectos.length === 0 && (
            <li className="text-xs text-slate-400/80">No hay proyectos.</li>
          )}
        </ul>
      </nav>
    </aside>
  )
}
