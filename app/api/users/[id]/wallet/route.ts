import { tx } from "@/lib/server/db";
import { userFromRequest, verifyWalletSignature, walletMessage } from "@/lib/server/auth";
import { body, err, json } from "@/lib/server/http";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (userFromRequest(req) !== id) return err("Sign in as this player first.", 401);
  const b = await body<{ wallet?: string; signature?: string }>(req);
  if (!b.wallet || !b.signature || !verifyWalletSignature(b.wallet, walletMessage(id), b.signature)) return err("The wallet signature did not check out.", 400);
  return tx(db => {
    if (db.users.some(u => u.wallet === b.wallet && u.id !== id)) return err("That wallet belongs to another player.", 409);
    const u = db.users.find(x => x.id === id); if (!u) return err("Player not found.", 404);
    u.wallet = b.wallet; return json({ user: u });
  });
}
