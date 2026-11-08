"use client";
import Link from "next/link";
import { useState } from "react";
import { useMe } from "@/lib/client/useMe";
import Avatar from "./Avatar";

const LINKS = [["/discover", "Challenges"], ["/practice", "Practice"], ["/#how", "How it works"]] as const;
export default function Nav() {
  const [me] = useMe(); const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex min-h-[44px] items-center gap-2 text-lg font-medium tracking-tight" aria-label="Rivalry home">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden><rect x="6" y="5" width="20" height="23" rx="5" fill="#bfa38d"/><rect x="16" y="11" width="5" height="5" fill="#111"/></svg>
          Rivalry
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className="text-[15px] text-muted transition hover:text-ink">{l}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {me && <Link href={`/profile/${me.id}`} className="flex min-h-[44px] items-center gap-2 text-sm text-muted hover:text-ink"><Avatar name={me.username} avatar={me.avatar} size={28} />{me.username}</Link>}
          <Link href="/create" className="btn-primary">Create a challenge</Link>
        </div>
        <button className="btn-ghost px-4 md:hidden" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </div>
      {open && (
        <nav id="menu" aria-label="Mobile" className="fixed inset-0 top-16 bg-bg px-4 pt-6 md:hidden">
          {[...LINKS, ...(me ? [[`/profile/${me.id}`, "Your profile"] as const] : [])].map(([h, l]) =>
            <Link key={h} href={h} onClick={() => setOpen(false)} className="flex min-h-[56px] items-center border-b border-line text-2xl">{l}</Link>)}
          <Link href="/create" onClick={() => setOpen(false)} className="btn-primary mt-8 w-full">Create a challenge</Link>
        </nav>
      )}
    </header>
  );
}
