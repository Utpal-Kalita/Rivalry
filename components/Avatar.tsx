const COLORS: Record<string, string> = { bolt: "#bfa38d", comet: "#7fa7c9", fox: "#d98a5f", crown: "#e8c48a", rocket: "#8fbf7a", ghost: "#cfcfcf", flame: "#e0705a", orbit: "#6fb7b0" };
export const AVATAR_IDS = Object.keys(COLORS);
export default function Avatar({ name, avatar, size = 36 }: { name: string; avatar: string; size?: number }) {
  return <span aria-hidden className="inline-grid shrink-0 place-items-center rounded-full font-medium text-bg" style={{ width: size, height: size, background: COLORS[avatar] ?? COLORS.bolt, fontSize: size * 0.42 }}>{name.slice(0, 1).toUpperCase()}</span>;
}
