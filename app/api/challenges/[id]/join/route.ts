import { tx } from "@/lib/server/db";
import { id as newId, userFromRequest } from "@/lib/server/auth";
import { isOpen, settle } from "@/lib/server/logic";
import { err, json } from "@/lib/server/http";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const uid = userFromRequest(req); if (!uid) return err("Create a player first.", 401);
  return tx(db => {
    settle(db);
    const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
    if (db.participants.some(p => p.challengeId === id && p.userId === uid)) return json({ joined: true, already: true });
    if (!isOpen(c)) return err("This challenge has closed.", 409);
    if (db.participants.filter(p => p.challengeId === id).length >= c.maxPlayers) return err("This challenge is full.", 409);
    db.participants.push({ id: newId(), challengeId: id, userId: uid, joinedAt: new Date().toISOString() });
    return json({ joined: true });
  });
}
