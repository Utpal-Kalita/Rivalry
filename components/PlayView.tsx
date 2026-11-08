"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Hud } from "./Game";
import { INPUT, type Difficulty, type Mode, type InputLog, type State, SCORE_MODE_TICKS } from "@/lib/game/sim";
const Game = dynamic(() => import("./Game"), { ssr: false, loading: () => <div className="aspect-[16/9] w-full bg-surface" /> });

export const fmt = (ticks: number) => (ticks / 60).toFixed(2) + " s";

export default function PlayView({ seed, difficulty, mode, runKey, onEnd, overlay }: {
  seed: string; difficulty: Difficulty; mode: Mode; runKey: number;
  onEnd: (log: InputLog, s: State) => void; overlay?: React.ReactNode;
}) {
  const [hud, setHud] = useState<Hud | null>(null);
  const [count, setCount] = useState(3);
  const touch = useRef(0);
  useEffect(() => { setCount(3); setHud(null); const t = setInterval(() => setCount(c => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 700); return () => clearInterval(t); }, [runKey]);
  const press = (bit: number, on: boolean) => { touch.current = on ? touch.current | bit : touch.current & ~bit; };
  const onHud = useCallback((h: Hud) => setHud(h), []);
  const left = mode === "score" && hud ? Math.max(0, SCORE_MODE_TICKS - hud.ticks) : null;
  const Pad = ({ bit, label, children }: { bit: number; label: string; children: React.ReactNode }) => (
    <button aria-label={label} className="grid h-16 w-16 select-none place-items-center rounded-full border border-line bg-bg/80 text-xl active:bg-accent active:text-bg"
      onPointerDown={e => { e.preventDefault(); press(bit, true); }} onPointerUp={() => press(bit, false)} onPointerLeave={() => press(bit, false)} onPointerCancel={() => press(bit, false)}>{children}</button>);
  return (
    <div className="mx-auto grid w-full max-w-[max(320px,calc((100svh-230px)*16/9))] gap-3">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line font-mono text-sm sm:grid-cols-4">
        {[["Time", left !== null ? fmt(left) : fmt(hud?.ticks ?? 0)], ["Coins", `${hud?.coins ?? 0}/${hud?.totalCoins ?? "–"}`], ["Respawns", String(hud?.deaths ?? 0)], ["Score", String(hud?.score ?? 0)]].map(([k, v]) =>
          <div key={k} className="bg-surface px-4 py-3"><span className="label block">{k}</span><span className="text-lg text-ink tabular-nums">{v}</span></div>)}
      </div>
      <div className="relative overflow-hidden rounded-card border border-line">
        <div className="h-1 bg-line"><div className="h-1 bg-accent transition-[width]" style={{ width: `${(hud?.progress ?? 0) * 100}%` }} /></div>
        <Game key={runKey} seed={seed} difficulty={difficulty} mode={mode} running={count === 0} touch={touch} onHud={onHud} onEnd={onEnd} className="aspect-[16/9] w-full" />
        {count > 0 && <div className="absolute inset-0 grid place-items-center bg-bg/40"><span className="text-[120px] font-medium leading-none" aria-live="polite">{count}</span></div>}
        {overlay && <div className="absolute inset-0 grid place-items-center bg-bg/85 p-4">{overlay}</div>}
      </div>
      <div className="flex items-center justify-between gap-4 md:hidden">
        <div className="flex gap-3"><Pad bit={INPUT.LEFT} label="Move left">◀</Pad><Pad bit={INPUT.RIGHT} label="Move right">▶</Pad></div>
        <Pad bit={INPUT.JUMP} label="Jump">▲</Pad>
      </div>
      <p className="hidden text-sm text-muted md:block">Arrow keys or A / D to run, Space, W or Up to jump. Hold jump for height. Checkpoints are the posts on the ground.</p>
    </div>
  );
}
