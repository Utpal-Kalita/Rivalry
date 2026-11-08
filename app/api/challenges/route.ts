import { createHash, randomBytes } from "crypto";
import { read, tx } from "@/lib/server/db";
import { id, userFromRequest } from "@/lib/server/auth";
import { publicChallenge, settle } from "@/lib/server/logic";
import { escrowKeypair } from "@/lib/server/solana";
import { body, err, json } from "@/lib/server/http";
import type { Challenge } from "@/lib/types";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url); const filter = url.searchParams.get("filter");
  const db = await read(); if (settle(db)) await tx(settle);
  let list = db.challenges.map(c => publicChallenge(db, c));
  if (filter === "open") list = list.filter(c => c.open);
  if (filter === "done") list = list.filter(c => !c.open);
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json(list.slice(0, 60));
}

export async function POST(req: Request) {
  const uid = userFromRequest(req); if (!uid) return err("Create a player first.", 401);
  const b = await body(req);
  const title = String(b.title ?? "").trim();
  if (title.length < 3 || title.length > 48) return err("Give the challenge a name of 3 to 48 characters.");
  const difficulty = ["easy", "medium", "hard"].includes(b.difficulty) ? b.difficulty : null;
  const mode = ["fastest", "score"].includes(b.mode) ? b.mode : null;
  const maxPlayers = Number(b.maxPlayers), hours = Number(b.hours), prizeSol = Number(b.prizeSol ?? 0);
  if (!difficulty || !mode) return err("Pick a difficulty and a format.");
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 50) return err("Players must be between 2 and 50.");
  if (!(hours >= 0.25 && hours <= 168)) return err("Duration must be between 15 minutes and 7 days.");
  if (!(prizeSol >= 0 && prizeSol <= 5)) return err("Prize must be between 0 and 5 SOL.");
  if (prizeSol > 0 && !escrowKeypair()) return err("Prizes are off: this server has no escrow wallet configured.");
  return tx(db => {
    const user = db.users.find(u => u.id === uid); if (!user) return err("Player not found.", 404);
    if (prizeSol > 0 && !user.wallet) return err("Connect a wallet to put up a prize.");
    const cid = id(), seed = randomBytes(16).toString("hex"), now = new Date();
    const seedCommitment = createHash("sha256").update(`${cid}|${seed}|${difficulty}|${mode}`).digest("hex");
    const c: Challenge = { id: cid, creatorId: uid, gameId: "obstacle-rush", title, seed, seedCommitment, difficulty, mode, maxPlayers, prizeSol,
      deadline: new Date(now.getTime() + hours * 3600e3).toISOString(), status: "open", createdAt: now.toISOString() };
    db.challenges.push(c);
    db.participants.push({ id: id(), challengeId: cid, userId: uid, joinedAt: now.toISOString() });
    return json(publicChallenge(db, c), 201);
  });
}
