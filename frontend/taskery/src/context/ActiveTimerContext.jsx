import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getActiveTimer, startTimer, stopTimer } from '@/services/timers';

const ActiveTimerContext = createContext(null);

export function ActiveTimerProvider({ children, refreshMs = 15000 }) {
  const [active, setActive] = useState(null);      // timer activo o null
  const [runningForMs, setRunningForMs] = useState(0);
  const tickRef = useRef(null);

  // Cargar el activo al montar
  useEffect(() => {
    (async () => {
      try {
        const a = await getActiveTimer();
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
      setRunningForMs(Date.now() - started);
      tickRef.current = setInterval(() => {
        setRunningForMs(Date.now() - started);
      }, 1000);
      return () => clearInterval(tickRef.current);
    } else {
      clearInterval(tickRef.current);
      setRunningForMs(0);
    }
  }, [active?.id, active?.inicio]);

  // Auto-refresh para sincronizar multi-pestaña
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const a = await getActiveTimer();
        setActive(a);
      } catch { /* empty */ }
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  async function start(tareaId, note) {
    try {
      const res = await startTimer(tareaId, note);
      setActive(res.newTimer);
      return res;
    } catch (e) {
      // si el backend devuelve 409 por carrera, sincroniza
      try {
        const a = await getActiveTimer();
        setActive(a);
      } catch { /* empty */ }
      console.error('startTimer:', e);
      return { error: e };
    }
  }

  async function stop() {
    await stopTimer();
    setActive(null);
  }

  const value = useMemo(() => ({ active, runningForMs, start, stop }), [active, runningForMs]);

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
