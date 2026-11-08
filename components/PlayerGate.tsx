"use client";
import { useState } from "react";
import { api, setMe } from "@/lib/client/api";
import { useMe } from "@/lib/client/useMe";
import Avatar, { AVATAR_IDS } from "./Avatar";

/** Renders children once a player exists; otherwise a short form to make one. */
export default function PlayerGate({ children, why = "Pick a player name to continue." }: { children: React.ReactNode; why?: string }) {
  const [me, ready] = useMe();
  const [name, setName] = useState(""); const [avatar, setAvatar] = useState("bolt");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  if (!ready) return <div className="card h-64 animate-pulse" />;
  if (me) return <>{children}</>;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { const r = await api("/api/users", { body: { username: name, avatar } }); setMe({ ...r.user, token: r.token }); }
    catch (x: any) { setError(x.message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card grid gap-6 p-6 sm:p-8" noValidate>
      <div><h2 className="text-2xl">Create your player</h2><p className="mt-2 text-muted">{why}</p></div>
      <label className="grid gap-2"><span className="text-sm">Player name</span>
        <input className="field" value={name} onChange={e => setName(e.target.value)} maxLength={20} autoComplete="nickname" required aria-describedby={error ? "name-err" : undefined} aria-invalid={!!error} />
        {error && <span id="name-err" className="text-sm text-danger">{error}</span>}
      </label>
      <fieldset className="grid gap-3"><legend className="mb-3 text-sm">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {AVATAR_IDS.map(a => (
            <label key={a} className={`grid h-12 w-12 cursor-pointer place-items-center rounded-full border-2 ${avatar === a ? "border-ink" : "border-transparent"}`}>
              <input type="radio" name="avatar" value={a} checked={avatar === a} onChange={() => setAvatar(a)} className="sr-only" aria-label={a} />
              <Avatar name={name || "R"} avatar={a} size={36} />
            </label>))}
        </div>
      </fieldset>
      <button className="btn-primary w-full sm:w-fit" disabled={busy}>{busy ? "Creating…" : "Create player"}</button>
    </form>
  );
}
