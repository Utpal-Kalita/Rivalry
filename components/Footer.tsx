import Link from "next/link";
import LevelArt from "./LevelArt";
export default function Footer() {
  return (
    <footer className="closing screen border-t border-line bg-[#0c0c0c]" aria-labelledby="close-h">
      <div className="wrap grid flex-1 content-between gap-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="close-h" className="text-[clamp(32px,4.5vw,56px)] leading-[1.05]">Make a level and send the link</h2>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted">One seed, one course, every run replayed on the server. Built for the Solana devnet.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create" className="btn-primary">Create a challenge</Link>
              <Link href="/practice" className="btn-ghost">Try a practice run</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-card border border-line lg:col-span-6"><LevelArt seed="rivalry-close" difficulty="hard" from={1200} span={1300} className="block h-full min-h-[200px] w-full" /></div>
        </div>
        <div className="grid gap-6 border-t border-line pt-8 sm:grid-cols-12">
          <nav className="flex flex-wrap gap-x-6 sm:col-span-8" aria-label="Footer">
            <Link className="link flex min-h-[44px] items-center" href="/discover">Open challenges</Link>
            <Link className="link flex min-h-[44px] items-center" href="/practice">Practice run</Link>
            <a className="link flex min-h-[44px] items-center" href="https://explorer.solana.com/?cluster=devnet">Devnet explorer</a>
            <a className="link flex min-h-[44px] items-center" href="https://faucet.solana.com/">Devnet faucet</a>
          </nav>
          <p className="flex items-center text-sm text-muted sm:col-span-4 sm:justify-end">Devnet only. No real money moves here.</p>
        </div>
      </div>
    </footer>
  );
}
