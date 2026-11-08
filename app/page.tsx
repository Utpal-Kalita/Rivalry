import Link from "next/link";
import HeroGame from "@/components/HeroGame";
import ChallengeList from "@/components/ChallengeList";

const STEPS = [
  ["01", "Set the rules", "Pick a difficulty, fastest finish or highest score, a player cap and a deadline. It takes under a minute."],
  ["02", "Send the link", "Each challenge gets its own URL. Friends open it, see who made it and who has joined, and get in."],
  ["03", "Run the same course", "The level comes from one seed, so every player gets the same gaps, spikes, saws and coins."],
  ["04", "Let the server rank it", "Your key presses are replayed on the server. Only runs it can reproduce reach the leaderboard."],
];

export default function Home() {
  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden" aria-labelledby="hero-h">
        <div className="absolute inset-0"><HeroGame /></div>
        <div className="wrap relative flex h-full items-end pb-10 pt-24 md:items-center md:pb-0">
          <div className="enter max-w-[620px] rounded-card bg-bg p-6 sm:p-10 md:p-12">
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

      <section className="py-24 md:py-32" aria-labelledby="open-h">
        <div className="wrap">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 id="open-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Open challenges</h2>
            <Link href="/discover" className="link text-muted">See every challenge</Link>
          </div>
          <ChallengeList limit={6} />
        </div>
      </section>

      <section id="how" className="border-y border-line bg-surface py-24 md:py-32" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h" className="max-w-[16ch] text-[clamp(32px,4.5vw,56px)] leading-[1.05]">How a challenge runs</h2>
          <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="flex flex-col gap-4 rounded-card border border-line bg-bg p-6">
                <span className="font-mono text-sm text-accent">{n}</span>
                <h3 className="text-xl">{t}</h3>
                <p className="leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-24 md:py-32" aria-labelledby="fair-h">
        <div className="wrap grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="fair-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Scores the browser cannot fake</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">The game never sends a time or a score. It sends the inputs, one entry per change of key, and the server plays them back through the same physics. Edited timers, pasted scores and reused runs fail the replay.</p>
            <ul className="mt-8 grid gap-3 text-[15px]">
              {["Single-use session nonce per attempt", "Run time checked against real elapsed time", "Deadline and membership checked on submit", "Each result signed so it can be re-checked"].map(t =>
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{t}</li>)}
            </ul>
          </div>
          <div className="card overflow-hidden lg:col-span-7" aria-label="Example of a result submission and the server's answer">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3"><span className="label">POST /api/results/submit</span></div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-muted">{`{
  "sessionId": "q7Lm2k…",
  "nonce": "9f1c4e…",
  "inputs": [[2, 41], [6, 18], [2, 77], [0, 4], [6, 22] …]
}`}</pre>
            <div className="border-t border-line px-5 py-3"><span className="label">Server replay</span></div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6"><span className="text-ok">verified</span>{`  ticks 2846 → 47.43 s
          coins 9 · respawns 1
          rank  #2 of 4`}</pre>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-24 md:py-32" aria-labelledby="sol-h">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <h2 id="sol-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05] lg:col-span-5">Stakes settled on Solana devnet</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {[
              ["Commitment", "The creator's wallet signs a memo with a SHA-256 hash of the seed and rules. Change the level afterwards and the hash no longer matches."],
              ["Escrow", "A prize travels in the same transaction to the escrow wallet. The server confirms the transfer on devnet before the prize shows."],
              ["Payout", "When the challenge closes, the verified winner claims and the escrow sends the SOL to their linked wallet."],
              ["Proof", "Every commitment and payout links to the devnet explorer, and the seed is published once the challenge closes."],
            ].map(([t, d]) => <div key={t} className="rounded-card border border-line bg-bg p-6"><h3 className="text-xl">{t}</h3><p className="mt-3 leading-relaxed text-muted">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="flex min-h-[70svh] items-center py-24" aria-labelledby="close-h">
        <div className="wrap">
          <h2 id="close-h" className="text-[clamp(48px,10vw,152px)] leading-[0.95] tracking-[-0.045em]" style={{ fontStretch: "120%" }}>Make the level.<br /><span className="text-muted">Send the link.</span></h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary">Create a challenge</Link>
            <Link href="/practice" className="btn-ghost">Try a practice run</Link>
          </div>
        </div>
      </section>
    </>
  );
}
