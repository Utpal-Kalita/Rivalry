"use client";
import { useState } from "react";
import Link from "next/link";
import PlayView, { fmt } from "@/components/PlayView";
import type { Difficulty } from "@/lib/game/sim";

export default function Practice() {
  const [diff, setDiff] = useState<Difficulty>("medium");
  const [seed, setSeed] = useState("practice-1");
  const [run, setRun] = useState(0);
  const [end, setEnd] = useState<{ ticks: number; score: number } | null>(null);
  return (
    <div className="wrap pb-24 pt-28">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><h1 className="text-[clamp(36px,5vw,64px)] leading-none">Practice run</h1><p className="mt-3 text-muted">Nothing is recorded here. Learn the jump, then challenge someone.</p></div>
        <div className="flex flex-wrap gap-2">
          {(["easy", "medium", "hard"] as const).map(d => <button key={d} onClick={() => { setDiff(d); setEnd(null); setRun(r => r + 1); }} className={d === diff ? "btn-primary" : "btn-ghost"} aria-pressed={d === diff}>{d[0].toUpperCase() + d.slice(1)}</button>)}
          <button className="btn-ghost" onClick={() => { setSeed("practice-" + Math.floor(Math.random() * 1e6)); setEnd(null); setRun(r => r + 1); }}>New level</button>
        </div>
      </div>
      <PlayView seed={seed} difficulty={diff} mode="fastest" runKey={run} onEnd={(_, s) => setEnd({ ticks: s.finishTick, score: 0 })}
        overlay={end && (
          <div className="text-center">
            <p className="label">Finished</p><p className="mt-2 text-6xl tabular-nums">{fmt(end.ticks)}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button className="btn-ghost" onClick={() => { setEnd(null); setRun(r => r + 1); }}>Run it again</button>
              <Link href="/create" className="btn-primary">Challenge a friend</Link>
            </div>
          </div>)} />
    </div>
  );
}
