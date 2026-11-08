"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlayerGate from "@/components/PlayerGate";
import WalletLink from "@/components/WalletLink";
import { api } from "@/lib/client/api";
import { useMe } from "@/lib/client/useMe";

const Seg = <T extends string>({ name, value, set, opts }: { name: string; value: T; set: (v: T) => void; opts: [T, string, string][] }) => (
  <fieldset><legend className="mb-3 text-sm">{name}</legend>
    <div className="grid gap-2 sm:grid-cols-3">
      {opts.map(([v, l, d]) => (
        <label key={v} className={`flex min-h-[44px] cursor-pointer flex-col rounded-xl border p-4 transition ${value === v ? "border-accent bg-bg" : "border-line hover:border-muted"}`}>
          <input type="radio" className="sr-only" name={name} checked={value === v} onChange={() => set(v)} />
          <span className="font-medium">{l}</span><span className="mt-1 text-sm text-muted">{d}</span>
        </label>))}
    </div>
  </fieldset>);

export default function Create() {
  const router = useRouter(); const [me] = useMe();
  const [title, setTitle] = useState("Beat my record");
  const [difficulty, setDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [mode, setMode] = useState<"fastest" | "score">("fastest");
  const [maxPlayers, setMax] = useState(4); const [hours, setHours] = useState(24); const [prize, setPrize] = useState(0);
  const [escrow, setEscrow] = useState<string | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/config").then(r => r.json()).then(c => setEscrow(c.escrow)).catch(() => {}); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { const c = await api("/api/challenges", { body: { title, difficulty, mode, maxPlayers, hours, prizeSol: prize } }); router.push(`/c/${c.id}?new=1`); }
    catch (x: any) { setError(x.message); setBusy(false); }
  }
  return (
    <div className="wrap grid gap-12 pb-24 pt-28 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h1 className="text-[clamp(36px,5vw,64px)] leading-none">Create a challenge</h1>
        <p className="mt-4 text-lg text-muted">The rules lock when you create it. A fresh seed is drawn on the server and its hash can be written to Solana devnet from the next screen.</p>
      </div>
      <div className="lg:col-span-8">
        <PlayerGate why="Your name shows on the challenge and on the leaderboard.">
          <form onSubmit={submit} className="card grid gap-8 p-6 sm:p-8" noValidate>
            <label className="grid gap-2"><span className="text-sm">Challenge name</span>
              <input className="field" value={title} onChange={e => setTitle(e.target.value)} maxLength={48} required /></label>
            <Seg name="Format" value={mode} set={setMode} opts={[["fastest", "Fastest finish", "Lowest time to the flag wins"], ["score", "Highest score", "60 seconds: coins, distance, finish bonus"]]} />
            <Seg name="Difficulty" value={difficulty} set={setDiff} opts={[["easy", "Easy", "14 sections, few hazards"], ["medium", "Medium", "20 sections, moving saws"], ["hard", "Hard", "26 sections, wide gaps"]]} />
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2"><span className="text-sm">Players</span>
                <select className="field" value={maxPlayers} onChange={e => setMax(+e.target.value)}>{[2, 3, 4, 5, 6, 8, 10, 16, 32].map(n => <option key={n} value={n}>{n} players</option>)}</select></label>
              <label className="grid gap-2"><span className="text-sm">Open for</span>
                <select className="field" value={hours} onChange={e => setHours(+e.target.value)}>{[[0.5, "30 minutes"], [1, "1 hour"], [6, "6 hours"], [24, "24 hours"], [72, "3 days"], [168, "7 days"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>
            <div className="grid gap-3 rounded-xl border border-line p-4 sm:p-5">
              <label className="grid gap-2"><span className="text-sm">Prize in devnet SOL (optional)</span>
                <input className="field" type="number" min={0} max={5} step={0.01} value={prize} onChange={e => setPrize(Math.max(0, +e.target.value))} disabled={!escrow || !me?.wallet} /></label>
              {!escrow ? <p className="text-sm text-muted">Prizes are off on this server: no escrow wallet is configured.</p>
                : !me?.wallet ? <div className="grid gap-2"><p className="text-sm text-muted">Connect a wallet to put up a prize. You fund it on the next screen.</p><WalletLink /></div>
                : <p className="text-sm text-muted">You send the prize to escrow in the commitment transaction on the next screen.</p>}
            </div>
            {error && <p className="text-danger" role="alert">{error}</p>}
            <button className="btn-primary w-full sm:w-fit" disabled={busy}>{busy ? "Creating…" : "Create the challenge"}</button>
          </form>
        </PlayerGate>
      </div>
    </div>
  );
}
