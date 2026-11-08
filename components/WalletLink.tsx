"use client";
import { useState } from "react";
import { api, setMe, getMe } from "@/lib/client/api";
import { connectAndSign, explorer } from "@/lib/client/wallet";

export const short = (a: string) => a.slice(0, 4) + "…" + a.slice(-4);
export default function WalletLink() {
  const me = getMe(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  if (!me) return null;
  if (me.wallet) return <a href={explorer(me.wallet, "address")} className="link font-mono text-sm">Wallet {short(me.wallet)}</a>;
  async function link() {
    setBusy(true); setError("");
    try {
      const { wallet, signature } = await connectAndSign(`Rivalry: link this wallet to player ${me!.id}`);
      const r = await api(`/api/users/${me!.id}/wallet`, { body: { wallet, signature } });
      setMe({ ...me!, wallet: r.user.wallet });
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="grid gap-2">
      <button className="btn-ghost w-full sm:w-fit" onClick={link} disabled={busy}>{busy ? "Waiting for wallet…" : "Connect a Solana wallet"}</button>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </div>
  );
}
