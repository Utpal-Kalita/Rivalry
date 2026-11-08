import Link from "next/link";
import ChallengeList from "@/components/ChallengeList";
export const metadata = { title: "Challenges – Rivalry" };
export default function Discover() {
  return (
    <div className="wrap pb-24 pt-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h1 className="text-[clamp(36px,5vw,64px)] leading-none">Challenges</h1>
        <Link href="/create" className="btn-primary w-full md:w-auto">Create a challenge</Link>
      </div>
      <h2 className="mb-6 mt-16 text-2xl">Open now</h2>
      <ChallengeList filter="open" />
      <h2 className="mb-6 mt-20 text-2xl">Finished</h2>
      <ChallengeList filter="done" />
    </div>
  );
}
