"use client";
import { useEffect, useState } from "react";
import { getMe, type Me } from "./api";
export function useMe(): [Me | null, boolean] {
  const [me, set] = useState<Me | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { const f = () => { set(getMe()); setReady(true); }; f(); window.addEventListener("rivalry:me", f); return () => window.removeEventListener("rivalry:me", f); }, []);
  return [me, ready];
}
