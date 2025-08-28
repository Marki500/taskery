import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getActiveTimer, startTimer, stopTimer, getTimersByTask } from '@/services/timers';

const ActiveTimerContext = createContext(null);

export function ActiveTimerProvider({ children, refreshMs = 15000 }) {
  const [active, setActive] = useState(null); // timer activo o null
  const [runningForMs, setRunningForMs] = useState(0);
  const [baseMs, setBaseMs] = useState(0); // tiempo acumulado previo
  const tickRef = useRef(null);

  // Cargar el activo al montar
  useEffect(() => {
    (async () => {
      try {
        const a = await getActiveTimer();
        setActive(a);
        if (a?.tareaId) await computeBaseMs(a.tareaId, a.id);
      } catch (e) {
        console.error('getActiveTimer:', e);
      }
    })();
  }, []);

  // Cronómetro visible
  useEffect(() => {
    if (active?.inicio) {
      const started = new Date(active.inicio).getTime();
      clearInterval(tickRef.current);
      const update = () => setRunningForMs(baseMs + (Date.now() - started));
      update();
      tickRef.current = setInterval(update, 1000);
      return () => clearInterval(tickRef.current);
    } else {
      clearInterval(tickRef.current);
      setRunningForMs(0);
    }
  }, [active?.id, active?.inicio, baseMs]);

  // Auto-refresh para sincronizar multi-pestaña
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const a = await getActiveTimer();
        setActive(a);
        if (a?.tareaId) await computeBaseMs(a.tareaId, a.id);
      } catch { /* empty */ }
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  async function start(tareaId, note) {
    try {
      const res = await startTimer(tareaId, note);
      setActive(res.newTimer);
      await computeBaseMs(tareaId, res.newTimer.id);
      return res;
    } catch (e) {
      // si el backend devuelve 409 por carrera, sincroniza
      try {
        const a = await getActiveTimer();
        setActive(a);
        if (a?.tareaId) await computeBaseMs(a.tareaId, a.id);
      } catch { /* empty */ }
      console.error('startTimer:', e);
      return { error: e };
    }
  }

  async function stop() {
    await stopTimer();
    setActive(null);
    setBaseMs(0);
    setRunningForMs(0);
  }

  async function computeBaseMs(tareaId, activeId) {
    try {
      const list = await getTimersByTask(tareaId);
      const ms = list
        .filter((t) => t.id !== activeId && t.fin)
        .reduce((acc, t) => acc + (new Date(t.fin) - new Date(t.inicio)), 0);
      setBaseMs(ms);
    } catch (e) {
      console.error('computeBaseMs:', e);
      setBaseMs(0);
    }
  }

  const value = useMemo(() => ({ active, runningForMs, start, stop }), [active, runningForMs, start, stop]);

  return (
    <ActiveTimerContext.Provider value={value}>
      {children}
    </ActiveTimerContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useActiveTimer() {
  const ctx = useContext(ActiveTimerContext);
  if (!ctx) throw new Error('useActiveTimer debe usarse dentro de <ActiveTimerProvider>');
  return ctx;
}
