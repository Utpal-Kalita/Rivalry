import Link from "next/link";
export default function Footer() {
  return (
    <footer className="border-t border-line bg-[#0c0c0c]">
      <div className="wrap grid gap-10 py-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="text-[clamp(40px,7vw,96px)] font-medium leading-none tracking-[-0.04em]" style={{ fontStretch: "120%" }}>Rivalry</p>
          <p className="mt-4 max-w-sm text-muted">One seeded level, one link, every run replayed on the server. Built for the Solana devnet.</p>
        </div>
        <nav className="grid gap-1 md:col-span-3" aria-label="Footer">
          <span className="label mb-2">Play</span>
          <Link className="link w-fit py-2" href="/create">Create a challenge</Link>
          <Link className="link w-fit py-2" href="/discover">Open challenges</Link>
          <Link className="link w-fit py-2" href="/practice">Practice run</Link>
        </nav>
        <div className="grid content-start gap-1 md:col-span-3">
          <span className="label mb-2">Network</span>
          <a className="link w-fit py-2" href="https://explorer.solana.com/?cluster=devnet">Solana devnet explorer</a>
          <a className="link w-fit py-2" href="https://faucet.solana.com/">Devnet faucet</a>
        </div>
      </div>
      <div className="wrap border-t border-line py-6 text-sm text-muted">Devnet only. No real money moves through Rivalry.</div>
    </footer>
  );
}
