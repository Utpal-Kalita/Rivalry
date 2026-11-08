"use client";
import dynamic from "next/dynamic";
const Game = dynamic(() => import("./Game"), { ssr: false, loading: () => null });
/** The hero's background: a computer-played run drawn straight onto a full-bleed canvas. */
export default function HeroGame() {
  return <Game seed="rivalry-attract" difficulty="medium" mode="fastest" demo asCanvas className="absolute inset-x-0 bottom-0 top-16 z-0 !m-0 !h-[calc(100%-4rem)] !w-full bg-[#151515] object-cover" />;
}
