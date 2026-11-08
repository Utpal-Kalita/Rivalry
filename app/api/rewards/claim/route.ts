import { read, tx } from "@/lib/server/db";
import { id as newId, userFromRequest } from "@/lib/server/auth";
import { leaderboard, settle } from "@/lib/server/logic";
import { payout } from "@/lib/server/solana";
import { body, err, json } from "@/lib/server/http";

const inFlight = new Set<string>();
export async function POST(req: Request) {
  const uid = userFromRequest(req); if (!uid) return err("Sign in first.", 401);
  const { challengeId } = await body<{ challengeId?: string }>(req);
  await tx(settle);
  const db = await read();
  const c = db.challenges.find(x => x.id === challengeId); if (!c) return err("Challenge not found.", 404);
  if (c.status === "open") return err("The challenge is still running.", 409);
  if (!(c.prizeSol > 0) || !c.escrowFunded) return err("This challenge has no funded prize.", 409);
  const paid = db.rewards.find(r => r.challengeId === c.id && r.status === "paid"); if (paid) return json({ reward: paid });
  const winner = leaderboard(db, c)[0]; if (!winner || winner.userId !== uid) return err("Only the winner can claim the prize.", 403);
  const wallet = db.users.find(u => u.id === uid)?.wallet; if (!wallet) return err("Connect a wallet to receive the prize.");
  if (inFlight.has(c.id)) return err("A payout is already being sent.", 409);
  inFlight.add(c.id);
  try {
    const sig = await payout(wallet, c.prizeSol, `rivalry:v1:${c.id}:payout`);
    const reward = { id: newId(), challengeId: c.id, winnerId: uid, amountSol: c.prizeSol, tx: sig, status: "paid" as const };
    await tx(d => { d.rewards.push(reward); const cc = d.challenges.find(x => x.id === c.id)!; cc.status = "rewarded"; });
    return json({ reward });
  } catch (e: any) { return err("Payout failed: " + e.message, 502); }
  finally { inFlight.delete(c.id); }
}
