import Link from "next/link";
import HeroGame from "@/components/HeroGame";
import ChallengeList from "@/components/ChallengeList";
import LevelArt from "@/components/LevelArt";
import Moments from "@/components/Moments";

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#bfa38d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
const STEPS = [
  ["01", "Set the rules", "Difficulty, format, player cap and deadline. Under a minute.", "M4 6h10M4 12h16M4 18h7M17 4v4M11 10v4M14 16v4"],
  ["02", "Send the link", "Every challenge has its own URL. Friends open it and join.", "M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"],
  ["03", "Run the same course", "One seed builds the level, so the gaps, saws and coins match.", "M3 18h5v-5h5V8h5V4M3 21h18"],
  ["04", "Let the server rank it", "Your key presses are replayed. Only runs it reproduces count.", "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"],
];
const CHAIN = [
  ["Rules commitment", "The creator's wallet signs a memo holding a SHA-256 hash of the seed and rules.", "rivalry:v1:9xlh…:a627…f6"],
  ["Prize escrow", "A prize moves to the escrow wallet in the same transaction, confirmed on devnet.", "transfer 0.05 SOL → 4Rb7…eQ1"],
  ["Winner payout", "When the challenge closes, the verified winner claims and escrow pays their wallet.", "transfer 0.05 SOL → 8kPz…Xw2"],
  ["Seed proof", "Each transaction links to the devnet explorer; the seed is published at close.", "seed 3f9a1c…  ✓ matches"],
];

export default function Home() {
  return (
    <>
      <Moments />
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-h">
        <HeroGame />
        <div className="wrap relative z-10 flex flex-1 items-end pb-10 pt-24 md:pb-[180px]">
          <div className="hero-text enter max-w-[620px] rounded-card bg-bg p-6 sm:p-10 md:p-12">
            <p className="eyebrow">Obstacle Rush · now on devnet</p>
            <h1 id="hero-h" className="mt-4 text-[clamp(40px,5.2vw,72px)] leading-[1.02]">Race your friends on the same level.</h1>
            <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-muted">Rivalry turns a seeded platformer into a challenge link. Everyone runs the identical course, the server replays every run, and the fastest verified time wins.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create" className="btn-primary">Create a challenge</Link>
              <Link href="/discover" className="btn-ghost">Browse open challenges</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="screen" aria-labelledby="open-h">
        <div className="wrap">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="open-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Open challenges</h2>
            <Link href="/discover" className="link flex min-h-[44px] items-center text-muted">See every challenge</Link>
          </div>
          <ChallengeList limit={3} phoneOne />
          <div className="mt-6 hidden overflow-hidden rounded-card border border-line md:block" data-visual><LevelArt seed="open-strip" difficulty="easy" from={0} span={2600} className="block h-44 w-full" /></div>
        </div>
      </section>

      <section id="how" className="screen border-y border-line bg-surface" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">How a challenge runs</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <ol className="grid gap-3 lg:col-span-6">
              {STEPS.map(([n, t, d, icon]) => (
                <li key={n} className="flex min-w-0 items-start gap-4 rounded-card border border-line bg-bg p-4">
                  <Icon d={icon} />
                  <div className="min-w-0"><h3 className="text-xl"><span className="mr-2 font-mono text-sm text-accent">{n}</span>{t}</h3><p className="mt-1 leading-relaxed text-ink/90">{d}</p></div>
                </li>
              ))}
            </ol>
            <div className="relative min-h-[260px] overflow-hidden rounded-card border border-line lg:col-span-6" data-visual>
              <LevelArt seed="how-demo" difficulty="medium" from={700} span={1200} className="absolute inset-0 h-full w-full" />
              <span className="absolute left-4 top-4 rounded-full bg-bg px-3 py-1 font-mono text-xs text-accent">seed 7f3a·medium</span>
            </div>
          </div>
        </div>
      </section>

      <section className="screen" aria-labelledby="fair-h">
        <div className="wrap grid items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="fair-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Scores the browser cannot fake</h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-ink/90">The game sends only its inputs. The server plays them back through the same physics, so edited timers and pasted scores fail the replay.</p>
            <ul className="mt-8 grid gap-3 text-[15px]">
              {["One-use nonce per attempt", "Run time checked against real time", "Deadline and membership checked", "Each result signed for re-checking"].map(t =>
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
          <div className="card overflow-hidden lg:col-span-6" aria-label="A result submission and the server's answer">
            <div className="border-b border-line px-5 py-3"><span className="label">POST /api/results/submit</span></div>
            <pre className="whitespace-pre-wrap break-all p-5 font-mono text-[13px] leading-6 text-ink/90">{`{ "sessionId": "q7Lm2k…", "nonce": "9f1c4e…",
  "inputs": [[2,41],[6,18],[2,77],[0,4],[6,22]] }`}</pre>
            <div className="border-t border-line px-5 py-3"><span className="label">Server replay</span></div>
            <pre className="whitespace-pre-wrap p-5 font-mono text-[13px] leading-6"><span className="text-ok">verified</span>{`  ticks 2846 → 47.43 s
coins 9 · respawns 1 · rank #2 of 4`}</pre>
            <LevelArt seed="fair-demo" difficulty="medium" from={600} span={1500} className="block h-48 w-full border-t border-line" />
          </div>
        </div>
      </section>

      <section className="screen justify-center border-t border-line" data-moment="word-highlight" aria-label="Why it is fair">
        <div className="wrap">
          <p className="label">Why it is fair</p>
          <p className="mo-wh__text mt-6 max-w-[24ch] text-[clamp(30px,4.2vw,56px)] font-medium leading-[1.1] tracking-[-0.03em]">Nobody gets an easier level. The seed is locked before anyone plays, and <strong>the server</strong> decides who won.</p>
        </div>
      </section>

      <section className="screen border-t border-line bg-surface" aria-labelledby="sol-h">
        <div className="wrap">
          <h2 id="sol-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Stakes settled on Solana devnet</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <ul className="grid content-start gap-6 lg:col-span-6">
              {CHAIN.map(([t, d]) => (
                <li key={t} className="flex min-w-0 flex-col gap-2">
                  <p className="min-w-0 text-lg leading-relaxed text-ink/90"><strong className="font-medium text-accent-hi">{t}.</strong> {d}</p>
                </li>))}
            </ul>
            <div className="card min-w-0 overflow-hidden lg:col-span-6" data-visual aria-label="A commitment transaction as the devnet explorer lists it">
              <div className="flex items-center justify-between border-b border-line px-5 py-3"><span className="label">Devnet transaction</span><span className="font-mono text-xs text-ok">Confirmed</span></div>
              <p className="grid gap-3 px-5 py-4 font-mono text-[13px]">
                {CHAIN.map(([t, , ui], i) => <span key={t} className="flex min-w-0 gap-4"><span className="w-6 shrink-0 text-muted">#{i + 1}</span><span className="min-w-0 truncate text-accent-hi">{ui}</span></span>)}
              </p>
              <LevelArt seed="sol-demo" difficulty="hard" from={900} span={1300} className="block h-64 w-full border-t border-line" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
