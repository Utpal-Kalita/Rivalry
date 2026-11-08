"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ChallengeCard from "./ChallengeCard";
import type { PublicChallenge } from "@/lib/types";

export default function ChallengeList({ filter = "open", limit, empty = true }: { filter?: "open" | "done" | "all"; limit?: number; empty?: boolean }) {
  const [list, set] = useState<PublicChallenge[] | null>(null);
  useEffect(() => { fetch(`/api/challenges?filter=${filter}`, { cache: "no-store" }).then(r => r.json()).then(set).catch(() => set([])); }, [filter]);
  if (!list) return <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="card h-48 animate-pulse" />)}</div>;
  const shown = limit ? list.slice(0, limit) : list;
  if (!shown.length) return empty ? (
    <div className="card flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
      <p className="text-lg text-muted">{filter === "done" ? "No finished challenges yet." : "No open challenges right now. Start the first one."}</p>
      <Link href="/create" className="btn-primary">Create a challenge</Link>
    </div>) : null;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{shown.map(c => <ChallengeCard key={c.id} c={c} />)}</div>;
}
