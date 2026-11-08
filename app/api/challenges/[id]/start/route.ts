import { randomBytes } from "crypto";
import { tx } from "@/lib/server/db";
import { id as newId, userFromRequest } from "@/lib/server/auth";
import { isOpen, settle } from "@/lib/server/logic";
import { err, json } from "@/lib/server/http";
const MAX_ATTEMPTS = 10;
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const uid = userFromRequest(req); if (!uid) return err("Create a player first.", 401);
  return tx(db => {
    settle(db);
    const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
    if (!db.participants.some(p => p.challengeId === id && p.userId === uid)) return err("Join the challenge first.", 403);
    if (!isOpen(c)) return err("This challenge has closed.", 409);
    const mine = db.sessions.filter(s => s.challengeId === id && s.userId === uid);
    if (mine.filter(s => s.used).length >= MAX_ATTEMPTS) return err(`You have used all ${MAX_ATTEMPTS} attempts.`, 429);
    const last = mine.at(-1); if (last && Date.now() - last.startedAt < 2000) return err("Slow down a little.", 429);
    for (const s of mine) if (!s.used) s.used = true; // only the newest session can submit
    const session = { id: newId(), challengeId: id, userId: uid, nonce: randomBytes(12).toString("hex"), startedAt: Date.now(), used: false };
    db.sessions.push(session);
    return json({ sessionId: session.id, nonce: session.nonce, seed: c.seed, difficulty: c.difficulty, mode: c.mode,
      attemptsLeft: MAX_ATTEMPTS - mine.filter(s => s.used).length });
  });
}
