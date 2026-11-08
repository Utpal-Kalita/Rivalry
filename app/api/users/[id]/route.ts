import { read } from "@/lib/server/db";
import { profileStats } from "@/lib/server/logic";
import { err, json } from "@/lib/server/http";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = await read();
  const user = db.users.find(u => u.id === id);
  if (!user) return err("Player not found.", 404);
  return json({ user, stats: profileStats(db, id) });
}
