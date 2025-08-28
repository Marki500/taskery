import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getActiveTimer, getTimersByTask, startTimer, stopTimer } from '@/services/timers';

const ActiveTimerContext = createContext(null);

export function ActiveTimerProvider({ children, refreshMs = 15000 }) {
  const [active, setActive] = useState(null);      // timer activo o null
  const [runningForMs, setRunningForMs] = useState(0);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [baseElapsedMs, setBaseElapsedMs] = useState(0);
  const tickRef = useRef(null);

  // Cargar el activo al montar
  useEffect(() => {
    (async () => {
      try {
        const a = await getActiveTimer();
        if (a?.inicio) {
          const timers = await getTimersByTask(a.tareaId);
          const base = timers
            .filter((t) => t.fin)
            .reduce((acc, t) => acc + (Date.parse(t.fin) - Date.parse(t.inicio)), 0);
          setBaseElapsedMs(base);
          setClockOffsetMs(Date.now() - Date.parse(a.inicio));
        } else {
          setBaseElapsedMs(0);
          setClockOffsetMs(0);
        }
        setActive(a);
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
      const compute = () => baseElapsedMs + Date.now() - started - clockOffsetMs;
      setRunningForMs(compute());
      tickRef.current = setInterval(() => {
        setRunningForMs(compute());
      }, 1000);
      return () => clearInterval(tickRef.current);
    } else {
      clearInterval(tickRef.current);
      setRunningForMs(0);
    }
  }, [active?.id, active?.inicio, clockOffsetMs, baseElapsedMs]);

  // Auto-refresh para sincronizar multi-pestaña
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const a = await getActiveTimer();
        if (a?.inicio) {
          const timers = await getTimersByTask(a.tareaId);
          const base = timers
            .filter((t) => t.fin)
            .reduce((acc, t) => acc + (Date.parse(t.fin) - Date.parse(t.inicio)), 0);
          setBaseElapsedMs(base);
          setClockOffsetMs(Date.now() - Date.parse(a.inicio));
        } else {
          setBaseElapsedMs(0);
          setClockOffsetMs(0);
        }
        setActive(a);
      } catch { /* empty */ }
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  async function start(tareaId, note) {
    try {
      const res = await startTimer(tareaId, note);
      const timers = await getTimersByTask(tareaId);
      const base = timers
        .filter((t) => t.fin)
        .reduce((acc, t) => acc + (Date.parse(t.fin) - Date.parse(t.inicio)), 0);
      setBaseElapsedMs(base);
      setClockOffsetMs(Date.now() - Date.parse(res.newTimer.inicio));
      setActive(res.newTimer);
      return res;
    } catch (e) {
      // si el backend devuelve 409 por carrera, sincroniza
      try {
        const a = await getActiveTimer();
        if (a?.inicio) {
          const timers = await getTimersByTask(a.tareaId);
          const base = timers
            .filter((t) => t.fin)
            .reduce((acc, t) => acc + (Date.parse(t.fin) - Date.parse(t.inicio)), 0);
          setBaseElapsedMs(base);
          setClockOffsetMs(Date.now() - Date.parse(a.inicio));
        } else {
          setBaseElapsedMs(0);
          setClockOffsetMs(0);
        }
        setActive(a);
      } catch { /* empty */ }
      console.error('startTimer:', e);
      return { error: e };
    }
  }

  async function stop() {
    const final = runningForMs;
    await stopTimer();
    setActive(null);
    setClockOffsetMs(0);
    setBaseElapsedMs(0);
    setRunningForMs(0);
    return final;
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
