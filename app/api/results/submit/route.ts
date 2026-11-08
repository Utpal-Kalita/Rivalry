import { tx } from "@/lib/server/db";
import { hmac, id as newId, userFromRequest } from "@/lib/server/auth";
import { leaderboard, settle } from "@/lib/server/logic";
import { body, err, json } from "@/lib/server/http";
import { generateLevel, replay, TICK_HZ, type InputLog } from "@/lib/game/sim";

export async function POST(req: Request) {
  const uid = userFromRequest(req); if (!uid) return err("Create a player first.", 401);
  const b = await body<{ sessionId?: string; nonce?: string; inputs?: InputLog }>(req);
  return tx(db => {
    settle(db);
    const s = db.sessions.find(x => x.id === b.sessionId);
    if (!s || s.userId !== uid || s.nonce !== b.nonce) return err("Unknown game session.", 403);
    if (s.used) return err("This run was already submitted or replaced by a newer one.", 409);
    s.used = true;
    const c = db.challenges.find(x => x.id === s.challengeId)!;
    const now = Date.now();
    const rec = (verification: "verified" | "rejected", r: { score: number; ticks: number; coins: number; deaths: number }, reason?: string) => {
      const row = { id: newId(), challengeId: c.id, userId: uid, ...r, verification, reason, submittedAt: new Date(now).toISOString(), signature: "" };
      row.signature = hmac(`${row.id}|${c.id}|${uid}|${r.score}|${r.ticks}|${verification}`);
      db.results.push(row); return row;
    };
    const late = now > new Date(c.deadline).getTime() + 15000; // grace for a run started just before the deadline
    if (late) { rec("rejected", { score: 0, ticks: 0, coins: 0, deaths: 0 }, "submitted after the deadline"); return err("The deadline has passed.", 409); }
    // Server-side replay: the score is recomputed from the raw inputs, never taken from the client.
    const r = replay(generateLevel(c.seed, c.difficulty), c.mode, b.inputs as InputLog);
    if (!r.ok) { const row = rec("rejected", r, r.reason); return json({ result: row }, 422); }
    // A run cannot be shorter in real time than it is in game time.
    const elapsed = (now - s.startedAt) / 1000;
    if (elapsed + 1.5 < r.ticks / TICK_HZ) { const row = rec("rejected", r, "run arrived faster than real time"); return json({ result: row }, 422); }
    const row = rec("verified", r);
    const board = leaderboard(db, c);
    return json({ result: row, rank: board.find(x => x.userId === uid)?.rank ?? null, leaderboard: board });
  });
}
