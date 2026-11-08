"use client";
export interface Me { id: string; username: string; avatar: string; wallet?: string; token: string }
const KEY = "rivalry.me";
export function getMe(): Me | null { try { const m = JSON.parse(localStorage.getItem(KEY) || "null"); return m && m.id && m.token && m.username ? m : null; } catch { return null; } }
export function setMe(m: Me | null) { try { m ? localStorage.setItem(KEY, JSON.stringify(m)) : localStorage.removeItem(KEY); } catch {} window.dispatchEvent(new Event("rivalry:me")); }

export async function api<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const me = getMe();
  const res = await fetch(path, { method: init.method ?? (init.body ? "POST" : "GET"), headers: { "content-type": "application/json", ...(me ? { "x-rivalry-token": me.token } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !(data && data.result)) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
