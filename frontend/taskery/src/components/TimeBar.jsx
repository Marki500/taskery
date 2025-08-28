import React from 'react';
import { useActiveTimer } from '@/context/ActiveTimerContext';

function msToHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

export default function TimerBar({ onStopped }) {
  const { active, runningForMs, stop } = useActiveTimer();
  if (!active) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50
                    max-w-[92vw] w-fit px-4 py-2 rounded-xl
                    bg-neutral-900/90 text-white shadow-lg backdrop-blur
                    flex items-center gap-3">
      <span className="text-sm opacity-70">Temporizador</span>
      <strong className="text-sm max-w-[32ch] truncate">
        {active?.tarea?.nombre || `Tarea ${active?.tareaId}`}
      </strong>
      <span className="font-mono tabular-nums">{msToHMS(runningForMs)}</span>
      <button
        onClick={async () => {
          await stop();
          onStopped?.();
        }}
        className="ml-2 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm"
        title="Parar temporizador"
      >
        Parar
      </button>
    </div>
  );
}
