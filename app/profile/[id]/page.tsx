"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import WalletLink, { short } from "@/components/WalletLink";
import { fmt } from "@/components/PlayView";
import { modeName } from "@/components/ChallengeCard";
import { api, setMe } from "@/lib/client/api";
import { useMe } from "@/lib/client/useMe";
import { explorer } from "@/lib/client/wallet";

export default function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); const [me] = useMe(); const [d, setD] = useState<any>(null); const [error, setError] = useState("");
  useEffect(() => { api(`/api/users/${id}`).then(setD).catch(e => setError(e.message)); }, [id, me?.wallet]);
  if (error) return <div className="wrap pb-24 pt-32"><h1 className="text-4xl">Player not found</h1></div>;
  if (!d) return <div className="wrap pb-24 pt-32"><div className="card h-80 animate-pulse" /></div>;
  const { user, stats } = d; const mine = me?.id === id;
  return (
    <div className="wrap grid gap-12 pb-24 pt-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5"><Avatar name={user.username} avatar={user.avatar} size={80} />
          <div><h1 className="text-[clamp(36px,5vw,64px)] leading-none">{user.username}</h1>
            <p className="mt-2 text-muted">{user.wallet ? <a className="link font-mono text-sm" href={explorer(user.wallet, "address")}>{short(user.wallet)}</a> : "No wallet linked"}</p></div></div>
        {mine && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{!user.wallet && <WalletLink />}<button className="btn-ghost" onClick={() => setMe(null)}>Sign out on this device</button></div>}
      </div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-5">
        {[["Challenges", stats.total], ["Wins", stats.wins], ["Win rate", `${stats.winRate}%`], ["Best score", stats.bestScore], ["Fastest finish", stats.fastestTicks ? fmt(stats.fastestTicks) : "–"]].map(([k, v]) =>
          <div key={k} className="bg-surface p-5"><dt className="label">{k}</dt><dd className="mt-2 text-3xl tabular-nums">{v}</dd></div>)}
      </dl>
      <section aria-labelledby="ach-h"><h2 id="ach-h" className="mb-6 text-2xl">Achievements</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stats.achievements.map((a: any) => (
          <li key={a.id} className={`card flex items-center gap-4 p-5 ${a.got ? "" : "opacity-50"}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-full font-mono text-sm ${a.got ? "bg-accent text-bg" : "border border-line text-muted"}`}>{a.got ? "✓" : "–"}</span>
            <div><p className="font-medium">{a.name}</p><p className="text-sm text-muted">{a.note}</p></div>
          </li>))}</ul>
      </section>
      <section aria-labelledby="hist-h"><h2 id="hist-h" className="mb-6 text-2xl">Competition history</h2>
        {stats.history.length === 0 ? <p className="text-muted">No challenges yet. <Link href="/discover" className="link">Find one to join</Link>.</p> : (
          <ul className="card overflow-hidden">{stats.history.map((h: any) => (
            <li key={h.id} className="border-b border-line last:border-0"><Link href={`/c/${h.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 py-4 hover:bg-bg">
              <span className="min-w-0 flex-1 truncate text-lg">{h.title}</span>
              <span className="label">{modeName(h.mode)} · {h.difficulty}</span>
              <span className="w-28 text-right font-mono text-sm">{h.rank ? `#${h.rank} of ${h.players}` : "No run"}</span>
              <span className={`w-20 text-right text-sm ${h.won ? "text-accent" : "text-muted"}`}>{h.status === "open" ? "Open" : h.won ? "Won" : "Closed"}</span>
            </Link></li>))}</ul>)}
      </section>
    </div>
  );
}
