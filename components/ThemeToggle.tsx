"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

type Theme = "light" | "dark";
const THEME_EVENT = "theme-change";

function getSnapshot(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Le serveur ne connaît ni localStorage ni les préférences système : on rend
// "light" par défaut le temps de l'hydratation, React se resynchronise juste après.
function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Changer de thème"
      className="flex h-8 w-8 items-center justify-center text-muted transition-opacity hover:opacity-70"
    >
      {theme === "dark" ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
    </button>
  );
}
