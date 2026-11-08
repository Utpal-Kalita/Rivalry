import { escrowKeypair, RPC } from "@/lib/server/solana";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({ cluster: "devnet", rpc: RPC.includes("devnet") ? RPC : "https://api.devnet.solana.com", escrow: escrowKeypair()?.publicKey.toBase58() ?? null });
}
