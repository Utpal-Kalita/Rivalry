import { read } from "@/lib/server/db";
import { hmac } from "@/lib/server/auth";
import { body, err, json } from "@/lib/server/http";
/** Checks that a result record is genuine and unaltered. */
export async function POST(req: Request) {
  const { resultId } = await body<{ resultId?: string }>(req);
  const db = await read(); const r = db.results.find(x => x.id === resultId); if (!r) return err("Result not found.", 404);
  const ok = hmac(`${r.id}|${r.challengeId}|${r.userId}|${r.score}|${r.ticks}|${r.verification}`) === r.signature;
  return json({ valid: ok, verification: r.verification, reason: r.reason ?? null });
}
