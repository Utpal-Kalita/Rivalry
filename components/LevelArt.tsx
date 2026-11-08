import { generateLevel, sawPos, type Difficulty } from "@/lib/game/sim";
/** A still drawing of an Obstacle Rush level, straight from the generator. */
export default function LevelArt({ seed, difficulty = "medium", from = 0, span = 2400, className }: { seed: string; difficulty?: Difficulty; from?: number; span?: number; className?: string }) {
  const l = generateLevel(seed, difficulty); const x1 = from + span, H = 320, top = 220;
  const vis = <T extends { x: number }>(a: T[], w = (o: T) => 0) => a.filter(o => o.x + w(o) >= from && o.x <= x1);
  return (
    <svg viewBox={`${from} ${top} ${span} ${H}`} preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <rect x={from} y={top} width={span} height={H} fill="#151515" />
      {vis(l.solids, r => r.w).map((r, i) => r.h <= 20
        ? <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill="#4a4038" />
        : <g key={i}><rect x={r.x} y={r.y} width={r.w} height={H} fill="#2b2b2b" /><rect x={r.x} y={r.y} width={r.w} height={6} fill="#3a3a3a" /></g>)}
      {vis(l.spikes, k => k.w).map((k, i) => <path key={i} fill="#e0705a" d={Array.from({ length: k.w / 15 }, (_, j) => `M${k.x + j * 15} ${k.y + k.h}l7.5 -${k.h}l7.5 ${k.h}z`).join("")} />)}
      {vis(l.saws).map((s, i) => { const p = sawPos(s, 0); return <circle key={i} cx={p.x} cy={p.y} r={s.r} fill="#d9d9d9" />; })}
      {vis(l.coins).map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={8} fill="#e8c48a" />)}
      <rect x={from + 140} y={406} width={26} height={34} rx={6} fill="#bfa38d" />
    </svg>
  );
}
