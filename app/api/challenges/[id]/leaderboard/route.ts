import { read } from "@/lib/server/db";
import { leaderboard } from "@/lib/server/logic";
import { err, json } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = await read();
  const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
  return json(leaderboard(db, c));
}
