"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Avatar from "@/components/Avatar";
import WalletLink, { short } from "@/components/WalletLink";
import { modeName, timeLeft } from "@/components/ChallengeCard";
import { fmt } from "@/components/PlayView";
import { api } from "@/lib/client/api";
import { useMe } from "@/lib/client/useMe";
import { explorer, sendCommit } from "@/lib/client/wallet";
import type { LeaderRow, PublicChallenge, Reward } from "@/lib/types";

interface Detail { challenge: PublicChallenge; seed: string | null; participants: { id: string; username: string; avatar: string }[]; leaderboard: LeaderRow[]; reward: Reward | null }

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const isNew = useSearchParams().get("new") === "1";
  const [me] = useMe(); const [d, setD] = useState<Detail | null>(null); const [error, setError] = useState("");
  const [busy, setBusy] = useState(""); const [copied, setCopied] = useState(false); const [cfg, setCfg] = useState<{ rpc: string; escrow: string | null } | null>(null);
  const load = useCallback(() => api<Detail>(`/api/challenges/${id}`).then(setD).catch(e => setError(e.message)), [id]);
  useEffect(() => { load(); fetch("/api/config").then(r => r.json()).then(setCfg); const t = setInterval(load, 8000); return () => clearInterval(t); }, [load]);
  if (error && !d) return <div className="wrap pb-24 pt-32"><h1 className="text-4xl">Challenge not found</h1><p className="mt-4 text-muted">{error}</p><Link href="/discover" className="btn-primary mt-8">Browse challenges</Link></div>;
  if (!d) return <div className="wrap pb-24 pt-32"><div className="card h-96 animate-pulse" /></div>;
  const c = d.challenge; const joined = !!me && d.participants.some(p => p.id === me.id); const isCreator = me?.id === c.creator.id;
  const url = typeof window !== "undefined" ? `${location.origin}/c/${c.id}` : "";
  const winner = !c.open ? d.leaderboard[0] : undefined;
  const run = async (label: string, fn: () => Promise<unknown>) => { setBusy(label); setError(""); try { await fn(); await load(); } catch (e: any) { setError(e.message); } finally { setBusy(""); } };
  const share = async () => {
    const text = winner && me?.id === winner.userId ? `I just won "${c.title}" on Rivalry. Who's next?` : `Beat me on "${c.title}" on Rivalry. Same level, verified times.`;
    if (navigator.share) { try { await navigator.share({ title: "Rivalry", text, url }); return; } catch {} }
    await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const commit = () => run("commit", async () => {
    if (!cfg) throw new Error("Config not loaded yet.");
    const sig = await sendCommit(cfg.rpc, `rivalry:v1:${c.id}:${c.seedCommitment}`, c.prizeSol > 0 && cfg.escrow ? { escrow: cfg.escrow, sol: c.prizeSol } : undefined);
    await api(`/api/challenges/${c.id}/commit`, { body: { signature: sig } });
  });

  return (
    <div className="wrap grid gap-12 pb-24 pt-28 lg:grid-cols-12">
      <div className="grid content-start gap-8 lg:col-span-7">
        <div>
          <p className="eyebrow">{modeName(c.mode)} · {c.difficulty} · Obstacle Rush</p>
          <h1 className="mt-3 text-[clamp(36px,5.5vw,72px)] leading-[1.02]">{c.title}</h1>
          <p className="mt-4 flex items-center gap-2 text-muted">Set by <Link href={`/profile/${c.creator.id}`} className="link flex items-center gap-2 text-ink"><Avatar name={c.creator.username} avatar={c.creator.avatar} size={24} />{c.creator.username}</Link></p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4">
          {[["Players", `${c.players}/${c.maxPlayers}`], ["Status", c.open ? timeLeft(c.deadline) : c.status === "rewarded" ? "Paid out" : "Closed"], ["Prize", c.prizeSol > 0 ? `${c.prizeSol} SOL${c.escrowFunded ? "" : " (unfunded)"}` : "None"], ["On-chain", c.commitTx ? "Committed" : "Not yet"]].map(([k, v]) =>
            <div key={k} className="bg-surface p-4"><dt className="label">{k}</dt><dd className="mt-1 text-lg">{v}</dd></div>)}
        </dl>

        {isNew && isCreator && (
          <div className="card grid gap-4 border-accent/60 p-6">
            <h2 className="text-xl">Send this link to your friends</h2>
            <div className="flex flex-col gap-3 sm:flex-row"><input readOnly value={url} className="field font-mono text-sm" aria-label="Challenge link" onFocus={e => e.target.select()} /><button className="btn-primary shrink-0" onClick={share}>{copied ? "Copied" : "Copy the link"}</button></div>
          </div>)}

        <div className="flex flex-col gap-3 sm:flex-row">
          {!me ? <Link href={`/c/${c.id}/play`} className="btn-primary">Join and play</Link>
            : joined ? (c.open && <Link href={`/c/${c.id}/play`} className="btn-primary">{d.leaderboard.some(r => r.userId === me.id) ? "Improve your run" : "Play your run"}</Link>)
            : c.open && c.players < c.maxPlayers ? <button className="btn-primary" disabled={!!busy} onClick={() => run("join", () => api(`/api/challenges/${c.id}/join`, { body: {} }))}>{busy === "join" ? "Joining…" : "Join the challenge"}</button>
            : <span className="text-muted">{c.open ? "This challenge is full." : "This challenge has closed."}</span>}
          {!isNew && <button className="btn-ghost" onClick={share}>{copied ? "Copied" : "Share the challenge"}</button>}
          {!c.open && <Link href="/create" className="btn-ghost">Challenge again</Link>}
        </div>
        {error && <p className="text-danger" role="alert">{error}</p>}

        {isCreator && !c.commitTx && (
          <div className="card grid gap-4 p-6">
            <h2 className="text-xl">Commit the rules on Solana devnet</h2>
            <p className="text-muted">Your wallet signs a memo holding the hash <span className="break-all font-mono text-sm text-ink">{c.seedCommitment.slice(0, 16)}…</span>{c.prizeSol > 0 ? ` and sends ${c.prizeSol} SOL to escrow in the same transaction.` : "."} Anyone can check it against the seed once the challenge closes.</p>
            {me?.wallet ? <button className="btn-primary w-full sm:w-fit" disabled={!!busy} onClick={commit}>{busy === "commit" ? "Confirming on devnet…" : c.prizeSol > 0 ? `Commit and fund ${c.prizeSol} SOL` : "Commit on devnet"}</button> : <WalletLink />}
          </div>)}
        {isCreator && c.open && <button className="link w-fit text-sm text-muted" onClick={() => confirm("Close the challenge now? No more runs will count.") && run("close", () => api(`/api/challenges/${c.id}/close`, { body: {} }))}>Close the challenge now</button>}

        <div className="grid gap-2 text-sm text-muted">
          {c.commitTx && <a className="link w-fit" href={explorer(c.commitTx)}>Commitment transaction {short(c.commitTx)}</a>}
          {d.reward?.tx && <a className="link w-fit" href={explorer(d.reward.tx)}>Payout transaction {short(d.reward.tx)}</a>}
          {d.seed && <p className="break-all">Seed revealed: <span className="font-mono text-ink">{d.seed}</span>. SHA-256 of “{c.id}|seed|{c.difficulty}|{c.mode}” equals {c.seedCommitment.slice(0, 16)}…</p>}
        </div>
      </div>

      <div className="grid content-start gap-6 lg:col-span-5">
        {winner && (
          <div className="card grid gap-4 p-6">
            <p className="label">Winner</p>
            <div className="flex items-center gap-4"><Avatar name={winner.username} avatar={winner.avatar} size={56} /><div><p className="text-3xl">{winner.username}</p><p className="font-mono text-muted">{c.mode === "fastest" ? fmt(winner.ticks) : `${winner.score} pts`}</p></div></div>
            {c.prizeSol > 0 && c.escrowFunded && !d.reward && me?.id === winner.userId && (
              me.wallet ? <button className="btn-primary" disabled={!!busy} onClick={() => run("claim", () => api("/api/rewards/claim", { body: { challengeId: c.id } }))}>{busy === "claim" ? "Sending on devnet…" : `Claim ${c.prizeSol} SOL`}</button> : <WalletLink />)}
            {d.reward?.status === "paid" && <p className="text-ok">{d.reward.amountSol} SOL paid to the winner.</p>}
          </div>)}
        <section className="card overflow-hidden" aria-labelledby="lb-h">
          <h2 id="lb-h" className="border-b border-line px-6 py-4 text-xl">Leaderboard</h2>
          {d.leaderboard.length === 0 ? <p className="px-6 py-8 text-muted">No verified runs yet.</p> : (
            <ol>{d.leaderboard.map(r => (
              <li key={r.userId} className={`flex items-center gap-4 border-b border-line px-6 py-4 last:border-0 ${r.userId === me?.id ? "bg-bg" : ""}`}>
                <span className={`w-6 font-mono ${r.rank === 1 ? "text-accent" : "text-muted"}`}>{r.rank}</span>
                <Avatar name={r.username} avatar={r.avatar} size={32} />
                <Link href={`/profile/${r.userId}`} className="flex-1 truncate hover:underline">{r.username}</Link>
                <span className="font-mono tabular-nums">{c.mode === "fastest" ? fmt(r.ticks) : r.score}</span>
              </li>))}</ol>)}
        </section>
        <section className="card p-6" aria-labelledby="pl-h">
          <h2 id="pl-h" className="text-xl">Players</h2>
          <ul className="mt-4 flex flex-wrap gap-3">{d.participants.map(p => <li key={p.id}><Link href={`/profile/${p.id}`} className="flex min-h-[44px] items-center gap-2 rounded-full border border-line py-1 pl-1 pr-4 hover:border-muted"><Avatar name={p.username} avatar={p.avatar} size={30} />{p.username}</Link></li>)}</ul>
        </section>
      </div>
    </div>
  );
}
