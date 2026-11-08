"use client";
import { useEffect } from "react";
/** Loads the taste-skill moment loader (public/assets/moments) for the page's dealt moment. */
export default function Moments() {
  useEffect(() => {
    document.documentElement.classList.add("mo-js");
    const t = setTimeout(() => document.documentElement.classList.add("mo-safe"), 2500);
    const s = document.createElement("script"); s.type = "module"; s.src = "/assets/moments/moments.js"; document.body.appendChild(s);
    return () => { clearTimeout(t); s.remove(); };
  }, []);
  return null;
}
