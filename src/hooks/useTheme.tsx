import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { SK, readJSON, writeJSON } from "@/lib/storageKeys";

export type ThemeChoice = "day" | "night" | "system";
export type ResolvedTheme = "day" | "night";

interface ThemeCtx {
  theme: ThemeChoice;
  resolved: ResolvedTheme;
  setTheme: (t: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

function systemPrefers(): ResolvedTheme {
  if (typeof window === "undefined") return "night";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  // also keep dark class in sync for any tailwind dark: selectors
  root.classList.toggle("dark", resolved === "night");
  root.style.colorScheme = resolved === "night" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => readJSON<ThemeChoice>(SK.theme, "night"));
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    theme === "system" ? systemPrefers() : (theme as ResolvedTheme),
  );

  useEffect(() => {
    const r: ResolvedTheme = theme === "system" ? systemPrefers() : (theme as ResolvedTheme);
    setResolved(r);
    applyTheme(r);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = systemPrefers();
      setResolved(r);
      applyTheme(r);
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: ThemeChoice) => {
    writeJSON(SK.theme, t);
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}