"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import PlayerGate from "@/components/PlayerGate";
import PlayView, { fmt } from "@/components/PlayView";
import { api } from "@/lib/client/api";
import { useMe } from "@/lib/client/useMe";
import type { Difficulty, Mode, InputLog } from "@/lib/game/sim";

interface Sess { sessionId: string; nonce: string; seed: string; difficulty: Difficulty; mode: Mode; attemptsLeft: number }
type Outcome = { status: "verified"; ticks: number; score: number; rank: number | null } | { status: "rejected"; reason: string } | { status: "sending" };

function Runner({ id }: { id: string }) {
  const [sess, setSess] = useState<Sess | null>(null); const [error, setError] = useState("");
  const [run, setRun] = useState(0); const [out, setOut] = useState<Outcome | null>(null);
  async function start() {
    setError(""); setOut(null);
    try {
      await api(`/api/challenges/${id}/join`, { body: {} });
      const s = await api<Sess>(`/api/challenges/${id}/start`, { body: {} }); setSess(s); setRun(r => r + 1);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { start(); }, [id]); // eslint-disable-line
  async function end(log: InputLog) {
    if (!sess) return; setOut({ status: "sending" });
    try {
      const r = await api(`/api/results/submit`, { body: { sessionId: sess.sessionId, nonce: sess.nonce, inputs: log } });
      setOut(r.result.verification === "verified" ? { status: "verified", ticks: r.result.ticks, score: r.result.score, rank: r.rank } : { status: "rejected", reason: r.result.reason });
    } catch (e: any) { setOut({ status: "rejected", reason: e.message }); }
  }
  if (error) return <div className="card grid gap-4 p-8"><p className="text-lg">{error}</p><Link href={`/c/${id}`} className="btn-primary w-fit">Back to the challenge</Link></div>;
  if (!sess) return <div className="aspect-[16/9] w-full animate-pulse rounded-card bg-surface" />;
  return <PlayView seed={sess.seed} difficulty={sess.difficulty} mode={sess.mode} runKey={run} onEnd={end} overlay={out && (
    <div className="grid justify-items-center gap-3 text-center" aria-live="polite">
      {out.status === "sending" && <p className="text-2xl">Replaying your run on the server…</p>}
      {out.status === "verified" && <>
        <p className="label text-ok">Verified{out.rank ? ` · you are #${out.rank}` : ""}</p>
        <p className="text-6xl tabular-nums">{sess.mode === "fastest" ? fmt(out.ticks) : `${out.score} pts`}</p>
      </>}
      {out.status === "rejected" && <><p className="label text-danger">Not counted</p><p className="max-w-md text-xl">{out.reason}</p></>}
      {out.status !== "sending" && <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="btn-ghost" onClick={start}>Try again ({Math.max(0, sess.attemptsLeft - 1)} left)</button>
        <Link href={`/c/${id}`} className="btn-primary">See the leaderboard</Link>
      </div>}
    </div>)} />;
}

export default function Play({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); useMe();
  return (
    <div className="wrap pb-24 pt-24">
      <div className="mb-6 flex items-center justify-between gap-4"><h1 className="text-2xl">Obstacle Rush</h1><Link href={`/c/${id}`} className="link text-muted">Challenge details</Link></div>
      <PlayerGate why="Your runs are saved under this name."><Runner id={id} /></PlayerGate>
    </div>
  );
}
