import { tx } from "@/lib/server/db";
import { id, tokenFor } from "@/lib/server/auth";
import { AVATARS } from "@/lib/server/logic";
import { body, err, json } from "@/lib/server/http";
export async function POST(req: Request) {
  const b = await body<{ username?: string; avatar?: string }>(req);
  const username = String(b.username ?? "").trim();
  if (!/^[A-Za-z0-9_\- ]{2,20}$/.test(username)) return err("Pick a name of 2 to 20 letters, numbers, spaces, - or _.");
  const avatar = AVATARS.includes(String(b.avatar)) ? String(b.avatar) : AVATARS[0];
  return tx(db => {
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return err("That name is taken.", 409);
    const user = { id: id(), username, avatar, createdAt: new Date().toISOString() };
    db.users.push(user);
    return json({ user, token: tokenFor(user.id) }, 201);
  });
}
