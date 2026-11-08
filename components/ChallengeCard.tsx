import Link from "next/link";
import Avatar from "./Avatar";
import type { PublicChallenge } from "@/lib/types";

export function timeLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const h = Math.floor(ms / 3600e3), m = Math.floor((ms % 3600e3) / 60e3);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : h ? `${h}h ${m}m left` : `${m}m left`;
}
export const modeName = (m: string) => m === "fastest" ? "Fastest finish" : "Highest score";

export default function ChallengeCard({ c }: { c: PublicChallenge }) {
  return (
    <Link href={`/c/${c.id}`} className="card-link flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="label">{modeName(c.mode)} · {c.difficulty}</span>
        <span className={`font-mono text-xs ${c.open ? "text-accent" : "text-muted"}`}>{c.open ? timeLeft(c.deadline) : c.status === "rewarded" ? "Paid out" : "Closed"}</span>
      </div>
      <h3 className="text-2xl leading-tight">{c.title}</h3>
      <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted">
        <span className="flex items-center gap-2"><Avatar name={c.creator.username} avatar={c.creator.avatar} size={24} />{c.creator.username}</span>
        <span>{c.players}/{c.maxPlayers} players{c.prizeSol > 0 ? ` · ${c.prizeSol} SOL` : ""}</span>
      </div>
    </Link>
  );
}
