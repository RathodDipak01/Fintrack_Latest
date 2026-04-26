"use client";

import { Moon, SunMedium } from "lucide-react";
import { useSettings } from "@/context/settings-context";

export function ThemeToggle({ compact = false }) {
  const { settings, updateSetting } = useSettings();
  
  // Logic: Consider any theme other than "Light (Pro)" as a dark variation
  const isDark = settings.theme !== "Light (Pro)";

  return (
    <div
      className={`flex rounded-md border border-white/10 bg-white/5 p-1 ${compact ? "" : "min-w-[92px]"}`}
    >
      <button
        onClick={() => updateSetting("theme", "Dark (Cyber)")}
        className={`rounded-md p-2 transition ${isDark ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
        aria-label="Dark mode"
      >
        <Moon size={15} />
      </button>
      <button
        onClick={() => updateSetting("theme", "Light (Pro)")}
        className={`rounded-md p-2 transition ${!isDark ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
        aria-label="Light mode"
      >
        <SunMedium size={15} />
      </button>
    </div>
  );
}
