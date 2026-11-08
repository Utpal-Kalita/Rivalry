"use client";
import dynamic from "next/dynamic";
const Game = dynamic(() => import("./Game"), { ssr: false, loading: () => <div className="h-full w-full bg-[#151515]" /> });
export default function HeroGame() {
  return <Game seed="rivalry-attract" difficulty="medium" mode="fastest" demo className="h-full w-full [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:object-cover" label="A computer-played run through an Obstacle Rush level" />;
}
