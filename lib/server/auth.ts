import { createHmac, randomBytes, timingSafeEqual, createPublicKey, verify } from "crypto";
import bs58 from "bs58";

const SECRET = process.env.RIVALRY_SECRET || "dev-only-secret-change-me";
export const hmac = (s: string) => createHmac("sha256", SECRET).update(s).digest("hex");
export const id = () => randomBytes(9).toString("base64url");
export const tokenFor = (userId: string) => `${userId}.${hmac("user:" + userId).slice(0, 32)}`;

export function userFromRequest(req: Request): string | null {
  const t = req.headers.get("x-rivalry-token");
  if (!t) return null;
  const [uid, sig] = t.split(".");
  if (!uid || !sig) return null;
  const want = Buffer.from(hmac("user:" + uid).slice(0, 32)), got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got) ? uid : null;
}

export const walletMessage = (userId: string) => `Rivalry: link this wallet to player ${userId}`;
export function verifyWalletSignature(pubkeyB58: string, message: string, sigB58: string): boolean {
  try {
    const raw = Buffer.from(bs58.decode(pubkeyB58));
    if (raw.length !== 32) return false;
    const key = createPublicKey({ key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), raw]), format: "der", type: "spki" });
    return verify(null, Buffer.from(message), key, Buffer.from(bs58.decode(sigB58)));
  } catch { return false; }
}
