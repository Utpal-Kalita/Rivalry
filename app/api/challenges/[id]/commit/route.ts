import { read, tx } from "@/lib/server/db";
import { userFromRequest } from "@/lib/server/auth";
import { commitMemo, verifyCommitTx } from "@/lib/server/solana";
import { body, err, json } from "@/lib/server/http";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const uid = userFromRequest(req);
  const { signature } = await body<{ signature?: string }>(req);
  const db = await read();
  const c = db.challenges.find(x => x.id === id); if (!c) return err("Challenge not found.", 404);
  if (c.creatorId !== uid) return err("Only the creator can commit this challenge.", 403);
  if (c.commitTx) return json({ commitTx: c.commitTx });
  const wallet = db.users.find(u => u.id === uid)?.wallet; if (!wallet) return err("Connect a wallet first.");
  if (!signature) return err("Missing transaction signature.");
  let v = { ok: false, reason: "devnet did not answer", funded: false } as any;
  for (let i = 0; i < 6; i++) { // the RPC can lag a few seconds behind confirmation
    try { v = await verifyCommitTx(signature, wallet, commitMemo(c.id, c.seedCommitment), c.prizeSol); } catch (e: any) { v = { ok: false, reason: e.message }; }
    if (v.ok) break; await new Promise(r => setTimeout(r, 1500));
  }
  if (!v.ok) return err(v.reason, 400);
  return tx(db2 => {
    const c2 = db2.challenges.find(x => x.id === id)!;
    c2.commitTx = signature; if (c2.prizeSol > 0) { c2.escrowTx = signature; c2.escrowFunded = true; }
    return json({ commitTx: signature });
  });
}
