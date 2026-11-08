// Obstacle Rush: deterministic level generation + fixed-step simulation.
// The same code runs in the browser (to play) and on the server (to replay and verify).

export type Difficulty = "easy" | "medium" | "hard";
export type Mode = "fastest" | "score";

export interface Rect { x: number; y: number; w: number; h: number }
export interface Saw { x: number; y: number; r: number; ax: number; ay: number; period: number; phase: number }
export interface Coin { x: number; y: number }
export interface Level {
  seed: string; difficulty: Difficulty; width: number;
  solids: Rect[]; spikes: Rect[]; saws: Saw[]; coins: Coin[]; checkpoints: number[]; finishX: number;
}

export const TICK_HZ = 60;
export const SCORE_MODE_TICKS = 60 * TICK_HZ; // highest-score runs last 60 s
export const MAX_TICKS = 5 * 60 * TICK_HZ;   // no run may be longer than 5 minutes
export const VIEW_H = 540;
export const INPUT = { LEFT: 1, RIGHT: 2, JUMP: 4 } as const;

const GROUND_Y = 440, PW = 26, PH = 34;
const GRAVITY = 0.62, JUMP_V = -11.6, MAX_FALL = 14, RUN = 4.4, ACCEL = 0.7, FRICTION = 0.75;
const COYOTE = 6, BUFFER = 6;

// FNV-1a hash -> mulberry32 PRNG
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
export function rng(seed: string) {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIFF = {
  easy:   { segments: 14, gap: [50, 95],  spike: 0.25, saw: 0.10, plat: 0.30 },
  medium: { segments: 20, gap: [70, 120], spike: 0.40, saw: 0.25, plat: 0.40 },
  hard:   { segments: 26, gap: [90, 140], spike: 0.55, saw: 0.40, plat: 0.50 },
} as const;

export function generateLevel(seed: string, difficulty: Difficulty): Level {
  const r = rng(seed + ":" + difficulty);
  const d = DIFF[difficulty];
  const int = (a: number, b: number) => Math.floor(a + r() * (b - a + 1));
  const solids: Rect[] = [], spikes: Rect[] = [], saws: Saw[] = [], coins: Coin[] = [], checkpoints: number[] = [40];
  let x = 0;
  solids.push({ x: -200, y: GROUND_Y, w: 600, h: 200 }); // safe start
  x = 400;
  for (let i = 0; i < d.segments; i++) {
    x += int(d.gap[0], d.gap[1]);                       // a gap to jump
    const segW = int(220, 420);
    const y = GROUND_Y - int(0, 2) * 30;                 // gentle steps, max 60px
    solids.push({ x, y, w: segW, h: 640 - y });
    if (i % 5 === 4) checkpoints.push(x + 20);
    let platSpan: [number, number] | null = null;
    if (r() < d.plat) {
      const pw = int(90, 150), px = x + int(20, Math.max(21, segW - pw - 20)), py = y - int(100, 112);
      solids.push({ x: px, y: py, w: pw, h: 16 });
      coins.push({ x: px + pw / 2, y: py - 24 });
      platSpan = [px - 60, px + pw + 40];
    } else {
      coins.push({ x: x + segW / 2, y: y - 70 });
    }
    if (r() < d.spike && segW > 260) {
      const sx = x + int(110, segW - 90), sw = int(1, 2) * 30;
      const clear = !platSpan || sx + sw < platSpan[0] || sx > platSpan[1];
      if (clear) spikes.push({ x: sx, y: y - 18, w: sw, h: 18 });
    }
    if (r() < d.saw) {
      const vertical = r() < 0.5;
      saws.push({
        x: x + segW / 2, y: y - (vertical ? 120 : 140), r: 18,
        ax: vertical ? 0 : int(60, Math.max(61, segW / 2 - 30)), ay: vertical ? int(50, 70) : 0,
        period: int(90, 150), phase: int(0, 89),
      });
    }
    x += segW;
  }
  x += 80;
  solids.push({ x, y: GROUND_Y, w: 500, h: 200 });
  return { seed, difficulty, width: x + 500, solids, spikes, saws, coins, checkpoints, finishX: x + 200 };
}

// Triangle wave instead of sin: plain arithmetic, identical on every engine.
export function sawPos(s: Saw, tick: number) {
  const p = ((tick + s.phase) % s.period) / s.period;
  const tri = p < 0.5 ? p * 4 - 1 : 3 - p * 4; // -1..1
  return { x: s.x + s.ax * tri, y: s.y + s.ay * tri };
}

export interface State {
  tick: number; x: number; y: number; vx: number; vy: number; onGround: boolean;
  coyote: number; buffer: number; prevJump: boolean; checkpoint: number;
  coins: boolean[]; deaths: number; maxX: number; finished: boolean; finishTick: number;
}

export function initState(level: Level): State {
  return { tick: 0, x: level.checkpoints[0], y: GROUND_Y - PH, vx: 0, vy: 0, onGround: true, coyote: 0, buffer: 0,
    prevJump: false, checkpoint: level.checkpoints[0], coins: level.coins.map(() => false), deaths: 0,
    maxX: 0, finished: false, finishTick: 0 };
}

const hit = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function respawn(s: State, level: Level) {
  s.deaths++; s.x = s.checkpoint; s.vx = 0; s.vy = 0;
  // drop onto the highest solid under the checkpoint
  const under = level.solids.filter(r => r.x <= s.x && r.x + r.w >= s.x + PW).sort((a, b) => a.y - b.y)[0];
  s.y = (under ? under.y : GROUND_Y) - PH;
}

export function step(s: State, level: Level, input: number): void {
  if (s.finished) return;
  const left = (input & INPUT.LEFT) !== 0, right = (input & INPUT.RIGHT) !== 0, jump = (input & INPUT.JUMP) !== 0;
  const dir = (right ? 1 : 0) - (left ? 1 : 0);
  if (dir) s.vx = Math.max(-RUN, Math.min(RUN, s.vx + dir * ACCEL)); else s.vx *= FRICTION;
  if (Math.abs(s.vx) < 0.05) s.vx = 0;

  if (jump && !s.prevJump) s.buffer = BUFFER; else if (s.buffer > 0) s.buffer--;
  if (!jump && s.vy < -4) s.vy = -4; // short hop when released early
  s.prevJump = jump;
  s.coyote = s.onGround ? COYOTE : Math.max(0, s.coyote - 1);
  if (s.buffer > 0 && s.coyote > 0) { s.vy = JUMP_V; s.buffer = 0; s.coyote = 0; s.onGround = false; }

  s.vy = Math.min(MAX_FALL, s.vy + GRAVITY);

  // horizontal move + resolve
  s.x += s.vx;
  if (s.x < -150) { s.x = -150; s.vx = 0; }
  for (const r of level.solids) {
    const p = { x: s.x, y: s.y, w: PW, h: PH };
    if (!hit(p, r)) continue;
    if (s.vx > 0) s.x = r.x - PW; else if (s.vx < 0) s.x = r.x + r.w;
    s.vx = 0;
  }
  // vertical move + resolve
  s.y += s.vy; s.onGround = false;
  for (const r of level.solids) {
    const p = { x: s.x, y: s.y, w: PW, h: PH };
    if (!hit(p, r)) continue;
    if (s.vy > 0) { s.y = r.y - PH; s.onGround = true; } else if (s.vy < 0) s.y = r.y + r.h;
    s.vy = 0;
  }

  const p = { x: s.x, y: s.y, w: PW, h: PH };
  for (const cp of level.checkpoints) if (s.x >= cp && cp > s.checkpoint) s.checkpoint = cp;
  level.coins.forEach((c, i) => { if (!s.coins[i] && hit(p, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) s.coins[i] = true; });

  let dead = s.y > 640 || level.spikes.some(k => hit(p, { x: k.x + 4, y: k.y + 4, w: k.w - 8, h: k.h - 4 }));
  if (!dead) for (const sw of level.saws) {
    const c = sawPos(sw, s.tick);
    const cx = Math.max(p.x, Math.min(c.x, p.x + p.w)), cy = Math.max(p.y, Math.min(c.y, p.y + p.h));
    if ((cx - c.x) ** 2 + (cy - c.y) ** 2 < (sw.r - 3) ** 2) { dead = true; break; }
  }
  if (dead) respawn(s, level);

  s.maxX = Math.max(s.maxX, s.x);
  s.tick++;
  if (s.x >= level.finishX) { s.finished = true; s.finishTick = s.tick; }
}

export function score(s: State, mode: Mode): number {
  const coins = s.coins.filter(Boolean).length;
  const base = coins * 100 + Math.floor(s.maxX / 10) - s.deaths * 50;
  const bonus = s.finished ? 1000 + (mode === "score" ? Math.floor((SCORE_MODE_TICKS - s.finishTick) / 3) : 0) : 0;
  return Math.max(0, base + bonus);
}

// Input log: run-length encoded [mask, ticks] pairs.
export type InputLog = [number, number][];
export class Recorder {
  log: InputLog = [];
  push(mask: number) {
    const last = this.log[this.log.length - 1];
    if (last && last[0] === mask) last[1]++; else this.log.push([mask, 1]);
  }
}

export interface Replay { ok: boolean; reason?: string; finished: boolean; ticks: number; coins: number; deaths: number; score: number }

export function replay(level: Level, mode: Mode, log: InputLog): Replay {
  const fail = (reason: string): Replay => ({ ok: false, reason, finished: false, ticks: 0, coins: 0, deaths: 0, score: 0 });
  if (!Array.isArray(log) || log.length > 20000) return fail("bad input log");
  const limit = mode === "score" ? SCORE_MODE_TICKS : MAX_TICKS;
  const s = initState(level);
  for (const pair of log) {
    if (!Array.isArray(pair) || pair.length !== 2) return fail("bad input log");
    const [mask, n] = pair;
    if (!Number.isInteger(mask) || mask < 0 || mask > 7 || !Number.isInteger(n) || n < 1) return fail("bad input log");
    for (let i = 0; i < n; i++) {
      if (s.finished || s.tick >= limit) break;
      step(s, level, mask);
    }
  }
  if (mode === "fastest" && !s.finished) return fail("run did not reach the finish");
  return { ok: true, finished: s.finished, ticks: s.finished ? s.finishTick : s.tick, coins: s.coins.filter(Boolean).length, deaths: s.deaths, score: score(s, mode) };
}
