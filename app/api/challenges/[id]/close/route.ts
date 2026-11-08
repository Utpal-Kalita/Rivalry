import { tx } from "@/lib/server/db";
import { userFromRequest } from "@/lib/server/auth";
import { err, json } from "@/lib/server/http";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const uid = userFromRequest(req);
  return tx(db => {
    const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
    if (c.creatorId !== uid) return err("Only the creator can close this challenge.", 403);
    if (c.status === "open") { c.status = "completed"; c.closedAt = new Date().toISOString(); c.deadline = c.closedAt; }
    return json({ status: c.status });
  });
}
