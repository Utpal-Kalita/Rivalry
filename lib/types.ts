import type { Difficulty, Mode } from "./game/sim";
export interface User { id: string; username: string; avatar: string; wallet?: string; createdAt: string }
export type ChallengeStatus = "open" | "completed" | "rewarded";
export interface Challenge {
  id: string; creatorId: string; gameId: "obstacle-rush"; title: string;
  seed: string; seedCommitment: string; difficulty: Difficulty; mode: Mode;
  maxPlayers: number; prizeSol: number; deadline: string; status: ChallengeStatus; createdAt: string;
  commitTx?: string; escrowTx?: string; escrowFunded?: boolean; closedAt?: string;
}
export interface Participant { id: string; challengeId: string; userId: string; joinedAt: string }
export interface Session { id: string; challengeId: string; userId: string; nonce: string; startedAt: number; used: boolean }
export interface Result {
  id: string; challengeId: string; userId: string; score: number; ticks: number; coins: number; deaths: number;
  verification: "verified" | "rejected"; reason?: string; submittedAt: string; signature: string;
}
export interface Reward { id: string; challengeId: string; winnerId: string; amountSol: number; tx?: string; status: "paid" | "failed"; error?: string }
export interface LeaderRow { rank: number; userId: string; username: string; avatar: string; score: number; ticks: number; coins: number; attempts: number }
export interface PublicChallenge extends Omit<Challenge, "seed"> {
  creator: Pick<User, "id" | "username" | "avatar">; players: number; open: boolean;
}
