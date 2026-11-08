"use client";
import { useEffect, useRef } from "react";
import { generateLevel, initState, step, sawPos, INPUT, Recorder, score, SCORE_MODE_TICKS, MAX_TICKS, VIEW_H,
  type Difficulty, type Mode, type State, type InputLog, type Level } from "@/lib/game/sim";

export interface Hud { ticks: number; coins: number; totalCoins: number; deaths: number; score: number; progress: number }
interface Props {
  seed: string; difficulty: Difficulty; mode: Mode; demo?: boolean; running?: boolean;
  touch?: React.MutableRefObject<number>;
  onHud?: (h: Hud) => void; onEnd?: (log: InputLog, s: State) => void; className?: string; label?: string;
}

const C = { sky: 0x111111, far: 0x1a1a1a, mid: 0x222222, ground: 0x2b2b2b, top: 0x3a3a3a, plat: 0x4a4038, spike: 0xe0705a,
  saw: 0xd9d9d9, coin: 0xe8c48a, player: 0xbfa38d, flag: 0xf2f2f2, check: 0x6a6a6a };

function botMask(s: State, l: Level) {
  const ahead = s.x + 50;
  const ground = l.solids.some(r => r.x <= ahead && r.x + r.w >= ahead && r.y >= s.y);
  const danger = l.spikes.some(k => k.x - s.x < 70 && k.x - s.x > 0);
  const need = !ground || danger || s.vx === 0;
  return INPUT.RIGHT | ((s.onGround && need) || (!s.onGround && s.vy < 0) ? INPUT.JUMP : 0);
}

export default function Game({ seed, difficulty, mode, demo, running = true, touch, onHud, onEnd, className, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ running, onHud, onEnd });
  live.current = { running, onHud, onEnd };

  useEffect(() => {
    let game: any; let dead = false;
    (async () => {
      const Phaser = (await import("phaser")).default;
      if (dead || !host.current) return;
      const level = generateLevel(seed, difficulty);
      const limit = mode === "score" ? SCORE_MODE_TICKS : MAX_TICKS;
      let s = initState(level), rec = new Recorder(), acc = 0, ended = false;
      const keys: Record<string, boolean> = {};

      class Run extends Phaser.Scene {
        g!: Phaser.GameObjects.Graphics; bg!: Phaser.GameObjects.Graphics;
        create() {
          this.bg = this.add.graphics().setScrollFactor(0); this.g = this.add.graphics();
          this.cameras.main.setBounds(-200, 0, level.width + 200, VIEW_H);
          if (!demo) {
            const kb = this.input.keyboard!;
            kb.addCapture("SPACE,UP,DOWN,LEFT,RIGHT");
            kb.on("keydown", (e: KeyboardEvent) => { keys[e.code] = true; });
            kb.on("keyup", (e: KeyboardEvent) => { keys[e.code] = false; });
          }
        }
        mask() {
          if (demo) return botMask(s, level);
          let m = touch?.current ?? 0;
          if (keys.ArrowLeft || keys.KeyA) m |= INPUT.LEFT;
          if (keys.ArrowRight || keys.KeyD) m |= INPUT.RIGHT;
          if (keys.Space || keys.ArrowUp || keys.KeyW) m |= INPUT.JUMP;
          return m;
        }
        update(_: number, dtMs: number) {
          if (live.current.running && !ended) {
            acc += Math.min(dtMs, 100);
            while (acc >= 1000 / 60 && !ended) {
              acc -= 1000 / 60;
              const m = this.mask(); rec.push(m); step(s, level, m);
              if (s.finished || s.tick >= limit) {
                ended = true;
                if (demo) { setTimeout(() => { s = initState(level); rec = new Recorder(); ended = false; }, 1200); }
                else live.current.onEnd?.(rec.log, s);
              }
            }
            live.current.onHud?.({ ticks: s.finished ? s.finishTick : s.tick, coins: s.coins.filter(Boolean).length, totalCoins: level.coins.length,
              deaths: s.deaths, score: score(s, mode), progress: Math.min(1, s.x / level.finishX) });
          }
          this.draw();
        }
        draw() {
          const cam = this.cameras.main, W = cam.width;
          cam.scrollX = Math.max(-200, Math.min(level.width - W, s.x - W * (demo ? 0.72 : 0.35)));
          const bg = this.bg; bg.clear(); bg.fillStyle(C.sky).fillRect(0, 0, W, VIEW_H);
          // two parallax ridgelines, generated from the seed
          for (const [col, f, h, step_] of [[C.far, 0.2, 170, 140], [C.mid, 0.45, 110, 90]] as const) {
            bg.fillStyle(col); bg.beginPath(); bg.moveTo(0, VIEW_H);
            const off = cam.scrollX * f;
            for (let x = -step_; x <= W + step_; x += step_ / 2) {
              const wx = Math.floor((x + off) / (step_ / 2));
              const n = ((wx * 2654435761 ^ level.width) >>> 0) % 1000 / 1000;
              bg.lineTo(x - (off % (step_ / 2)), VIEW_H - 120 - h * n);
            }
            bg.lineTo(W + step_, VIEW_H); bg.closePath(); bg.fillPath();
          }
          const g = this.g; g.clear();
          for (const cp of level.checkpoints.slice(1)) { g.fillStyle(cp <= s.checkpoint ? C.player : C.check).fillRect(cp, 380, 4, 60); }
          for (const r of level.solids) {
            if (r.h <= 20) { g.fillStyle(C.plat).fillRoundedRect(r.x, r.y, r.w, r.h, 4); continue; }
            g.fillStyle(C.ground).fillRect(r.x, r.y, r.w, r.h); g.fillStyle(C.top).fillRect(r.x, r.y, r.w, 6);
          }
          g.fillStyle(C.spike);
          for (const k of level.spikes) for (let x = k.x; x < k.x + k.w; x += 15) g.fillTriangle(x, k.y + k.h, x + 7.5, k.y, x + 15, k.y + k.h);
          for (const sw of level.saws) {
            const p = sawPos(sw, s.tick);
            g.lineStyle(2, 0x555555).lineBetween(sw.x - sw.ax, sw.y - sw.ay, sw.x + sw.ax, sw.y + sw.ay);
            g.fillStyle(C.saw).fillCircle(p.x, p.y, sw.r); g.fillStyle(C.sky).fillCircle(p.x, p.y, 5);
            for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + s.tick * 0.25; g.fillStyle(C.saw).fillTriangle(
              p.x + Math.cos(a) * sw.r, p.y + Math.sin(a) * sw.r, p.x + Math.cos(a + 0.3) * (sw.r + 6), p.y + Math.sin(a + 0.3) * (sw.r + 6), p.x + Math.cos(a + 0.5) * sw.r, p.y + Math.sin(a + 0.5) * sw.r); }
          }
          level.coins.forEach((c, i) => { if (!s.coins[i]) { const bob = Math.round(Math.sin((s.tick + i * 9) / 12) * 3); g.fillStyle(C.coin).fillCircle(c.x, c.y + bob, 8); g.fillStyle(0xfff1d6).fillCircle(c.x - 2, c.y + bob - 2, 2.5); } });
          g.fillStyle(C.flag).fillRect(level.finishX, 300, 5, 140);
          for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) g.fillStyle((i + j) % 2 ? C.flag : 0x111111).fillRect(level.finishX + 5 + i * 12, 300 + j * 12, 12, 12);
          // runner
          g.fillStyle(C.player).fillRoundedRect(s.x, s.y, 26, 34, 6);
          g.fillStyle(0x111111).fillRect(s.x + (s.vx < 0 ? 4 : 15), s.y + 9, 6, 6);
        }
      }
      game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, backgroundColor: "#111111", scene: Run, banner: false,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 960, height: VIEW_H }, fps: { target: 60 },
        render: { antialias: true }, input: { keyboard: !demo, mouse: false, touch: false } });
    })();
    return () => { dead = true; game?.destroy(true); };
  }, [seed, difficulty, mode, demo, touch]);

  return <div ref={host} className={className} role="img" aria-label={label ?? "Obstacle Rush game"} />;
}
