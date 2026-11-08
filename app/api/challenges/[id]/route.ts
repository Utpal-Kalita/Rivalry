import { read, tx } from "@/lib/server/db";
import { leaderboard, publicChallenge, settle, userCard } from "@/lib/server/logic";
import { err, json } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let db = await read(); if (settle(db)) { await tx(settle); db = await read(); }
  const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
  const participants = db.participants.filter(p => p.challengeId === id).map(p => ({ ...userCard(db, p.userId), joinedAt: p.joinedAt }));
  const reward = db.rewards.find(r => r.challengeId === id) ?? null;
  // The seed is revealed once the challenge is closed, so anyone can re-check the commitment.
  return json({ challenge: publicChallenge(db, c), seed: c.status === "open" ? null : c.seed, participants, leaderboard: leaderboard(db, c), reward });
}
