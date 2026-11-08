import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
export const RPC = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const connection = () => new Connection(RPC, "confirmed");

let escrow: Keypair | null | undefined;
export function escrowKeypair(): Keypair | null {
  if (escrow !== undefined) return escrow;
  const s = process.env.ESCROW_SECRET_KEY;
  try { escrow = s ? Keypair.fromSecretKey(s.trim().startsWith("[") ? Uint8Array.from(JSON.parse(s)) : bs58.decode(s.trim())) : null; }
  catch { escrow = null; }
  return escrow;
}

export const commitMemo = (challengeId: string, commitment: string) => `rivalry:v1:${challengeId}:${commitment}`;

/** Confirms on devnet that `sig` was signed by `wallet`, carries the commitment memo and, if a prize is set, moved it into escrow. */
export async function verifyCommitTx(sig: string, wallet: string, memo: string, prizeSol: number) {
  const tx = await connection().getParsedTransaction(sig, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
  if (!tx || tx.meta?.err) return { ok: false, reason: "transaction not found or failed on devnet" };
  const signer = tx.transaction.message.accountKeys.find(k => k.signer)?.pubkey.toBase58();
  if (signer !== wallet) return { ok: false, reason: "transaction was not signed by the linked wallet" };
  const ix = tx.transaction.message.instructions as any[];
  if (!ix.some(i => i.programId.toBase58() === MEMO_PROGRAM && i.parsed === memo)) return { ok: false, reason: "commitment memo missing" };
  let funded = false;
  if (prizeSol > 0) {
    const esc = escrowKeypair()?.publicKey.toBase58();
    funded = ix.some(i => i.program === "system" && i.parsed?.type === "transfer" && i.parsed.info.destination === esc &&
      i.parsed.info.source === wallet && Number(i.parsed.info.lamports) >= Math.round(prizeSol * LAMPORTS_PER_SOL));
    if (!funded) return { ok: false, reason: "prize transfer to escrow missing" };
  }
  return { ok: true, funded };
}

export async function payout(to: string, sol: number, memo: string): Promise<string> {
  const kp = escrowKeypair();
  if (!kp) throw new Error("escrow is not configured on this server");
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: kp.publicKey, toPubkey: new PublicKey(to), lamports: Math.round(sol * LAMPORTS_PER_SOL) }),
    { keys: [], programId: new PublicKey(MEMO_PROGRAM), data: Buffer.from(memo) },
  );
  return sendAndConfirmTransaction(connection(), tx, [kp]);
}
