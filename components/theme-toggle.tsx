"use client";

import { Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("fintrack-theme") as Theme | null;
    const initial = saved === "light" || saved === "dark" ? saved : "dark";
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
  }, []);

  function updateTheme(nextTheme: Theme) {
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("fintrack-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div className={`flex rounded-md border border-white/10 bg-white/5 p-1 ${compact ? "" : "min-w-[92px]"}`}>
      <button
        onClick={() => updateTheme("dark")}
        className={`rounded-md p-2 transition ${theme === "dark" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
        aria-label="Dark mode"
      >
        <Moon size={15} />
      </button>
      <button
        onClick={() => updateTheme("light")}
        className={`rounded-md p-2 transition ${theme === "light" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
        aria-label="Light mode"
      >
        <SunMedium size={15} />
      </button>
    </div>
  );
}
