import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // On first render, use stored preference, fallback to system
    return getStoredTheme() ?? getSystemTheme();
  });

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes (only relevant when no stored preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Only auto-switch if the user hasn't manually set a preference
      const stored = getStoredTheme();
      if (!stored) {
        const next = getSystemTheme();
        setTheme(next);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const setThemeExplicit = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  };

  return { theme, toggleTheme, setTheme: setThemeExplicit } as const;
}
