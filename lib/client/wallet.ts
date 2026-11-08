"use client";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import bs58 from "bs58";

const MEMO = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
type Provider = { publicKey?: PublicKey; connect(): Promise<{ publicKey: PublicKey }>; signMessage(m: Uint8Array, e?: string): Promise<{ signature: Uint8Array }>;
  signAndSendTransaction(t: Transaction): Promise<{ signature: string }> };

export function provider(): Provider | null {
  const w = window as any;
  return w.phantom?.solana ?? w.solflare ?? (w.solana?.isPhantom ? w.solana : null) ?? w.backpack?.solana ?? null;
}

export async function connectAndSign(message: string) {
  const p = provider(); if (!p) throw new Error("No Solana wallet found. Install Phantom or Solflare and switch it to devnet.");
  const { publicKey } = await p.connect();
  const { signature } = await p.signMessage(new TextEncoder().encode(message), "utf8");
  return { wallet: publicKey.toBase58(), signature: bs58.encode(signature) };
}

/** Sends the challenge commitment memo (and the prize into escrow) on devnet, signed by the creator's wallet. */
export async function sendCommit(rpc: string, memo: string, prize?: { escrow: string; sol: number }) {
  const p = provider(); if (!p) throw new Error("No Solana wallet found.");
  const { publicKey } = await p.connect();
  const conn = new Connection(rpc, "confirmed");
  const tx = new Transaction();
  if (prize && prize.sol > 0) tx.add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(prize.escrow), lamports: Math.round(prize.sol * LAMPORTS_PER_SOL) }));
  tx.add(new TransactionInstruction({ keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }], programId: MEMO, data: new TextEncoder().encode(memo) as any }));
  tx.feePayer = publicKey;
  const bh = await conn.getLatestBlockhash();
  tx.recentBlockhash = bh.blockhash;
  const { signature } = await p.signAndSendTransaction(tx);
  await conn.confirmTransaction({ signature, ...bh }, "confirmed");
  return signature;
}
export const explorer = (sig: string, kind: "tx" | "address" = "tx") => `https://explorer.solana.com/${kind}/${sig}?cluster=devnet`;
