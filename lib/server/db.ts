import { promises as fs } from "fs";
import path from "path";
import type { User, Challenge, Participant, Session, Result, Reward } from "../types";

export interface DB { users: User[]; challenges: Challenge[]; participants: Participant[]; sessions: Session[]; results: Result[]; rewards: Reward[] }
const FILE = path.join(process.env.RIVALRY_DATA_DIR || path.join(process.cwd(), ".data"), "db.json");
const empty = (): DB => ({ users: [], challenges: [], participants: [], sessions: [], results: [], rewards: [] });

let queue: Promise<unknown> = Promise.resolve();
async function load(): Promise<DB> {
  try { return { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) }; } catch { return empty(); }
}
export async function read(): Promise<DB> { await queue; return load(); }
/** Serialised read-modify-write so concurrent requests cannot lose writes. */
export function tx<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const out = await fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE + ".tmp", JSON.stringify(db));
    await fs.rename(FILE + ".tmp", FILE);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}
