import type { DB } from "./db";
import type { Challenge, LeaderRow, PublicChallenge, User } from "../types";

export const AVATARS = ["bolt", "comet", "fox", "crown", "rocket", "ghost", "flame", "orbit"];

export function isOpen(c: Challenge, now = Date.now()) { return c.status === "open" && new Date(c.deadline).getTime() > now; }

/** Moves challenges whose deadline passed to completed. Returns true if anything changed. */
export function settle(db: DB, now = Date.now()) {
  let changed = false;
  for (const c of db.challenges) if (c.status === "open" && new Date(c.deadline).getTime() <= now) { c.status = "completed"; c.closedAt = new Date(now).toISOString(); changed = true; }
  return changed;
}

export function userCard(db: DB, id: string): Pick<User, "id" | "username" | "avatar"> {
  const u = db.users.find(x => x.id === id);
  return { id, username: u?.username ?? "unknown", avatar: u?.avatar ?? "bolt" };
}

export function publicChallenge(db: DB, c: Challenge): PublicChallenge {
  const { seed: _hidden, ...rest } = c;
  return { ...rest, creator: userCard(db, c.creatorId), players: db.participants.filter(p => p.challengeId === c.id).length, open: isOpen(c) };
}

export function leaderboard(db: DB, c: Challenge): LeaderRow[] {
  const best = new Map<string, { score: number; ticks: number; coins: number; attempts: number }>();
  for (const r of db.results) {
    if (r.challengeId !== c.id || r.verification !== "verified") continue;
    const cur = best.get(r.userId);
    const better = !cur || (c.mode === "fastest" ? r.ticks < cur.ticks : r.score > cur.score);
    const attempts = (cur?.attempts ?? 0) + 1;
    best.set(r.userId, better ? { score: r.score, ticks: r.ticks, coins: r.coins, attempts } : { ...cur!, attempts });
  }
  const rows = [...best.entries()].map(([userId, v]) => ({ userId, ...v, ...userCard(db, userId) }));
  rows.sort((a, b) => c.mode === "fastest" ? a.ticks - b.ticks || b.score - a.score : b.score - a.score || a.ticks - b.ticks);
  return rows.map((r, i) => ({ rank: i + 1, userId: r.userId, username: r.username, avatar: r.avatar, score: r.score, ticks: r.ticks, coins: r.coins, attempts: r.attempts }));
}

export function profileStats(db: DB, userId: string) {
  const joined = db.participants.filter(p => p.userId === userId).map(p => db.challenges.find(c => c.id === p.challengeId)!).filter(Boolean);
  const history = joined.map(c => {
    const board = leaderboard(db, c); const me = board.find(r => r.userId === userId);
    const done = c.status !== "open";
    return { id: c.id, title: c.title, mode: c.mode, difficulty: c.difficulty, status: c.status, rank: me?.rank ?? null, players: board.length,
      won: done && me?.rank === 1, score: me?.score ?? null, ticks: me?.ticks ?? null, createdAt: c.createdAt };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const wins = history.filter(h => h.won).length;
  const results = db.results.filter(r => r.userId === userId && r.verification === "verified");
  const bestScore = results.reduce((m, r) => Math.max(m, r.score), 0);
  const fastest = results.filter(r => db.challenges.find(c => c.id === r.challengeId)?.mode === "fastest").reduce((m, r) => Math.min(m, r.ticks), Infinity);
  const created = db.challenges.filter(c => c.creatorId === userId).length;
  const achievements = [
    { id: "first-run", name: "First run", got: results.length > 0, note: "Post a verified result" },
    { id: "first-win", name: "First win", got: wins >= 1, note: "Win a challenge" },
    { id: "hat-trick", name: "Hat trick", got: wins >= 3, note: "Win three challenges" },
    { id: "host", name: "Host", got: created >= 1, note: "Create a challenge" },
    { id: "flawless", name: "Flawless", got: results.some(r => r.deaths === 0), note: "Finish without a single respawn" },
    { id: "sub-60", name: "Under a minute", got: fastest < 60 * 60, note: "Finish a level in under 60 s" },
  ];
  return { total: history.length, wins, winRate: history.filter(h => h.status !== "open").length ? Math.round(100 * wins / history.filter(h => h.status !== "open").length) : 0,
    bestScore, fastestTicks: Number.isFinite(fastest) ? fastest : null, created, history, achievements };
}
