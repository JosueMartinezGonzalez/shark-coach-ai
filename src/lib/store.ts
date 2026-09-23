import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";

export type Goal = {
  id: string;
  title: string;
  area: "negocios" | "habitos" | "salud" | "mente";
  progress: number;
};

export type Habit = {
  id: string;
  name: string;
  /** Fechas YYYY-MM-DD marcadas como hechas */
  done: string[];
};

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

export type Profile = {
  name: string;
  focus: string;
};

export const STORAGE_KEYS = {
  goals: "tiburon.goals",
  habits: "tiburon.habits",
  threads: "tiburon.threads",
  profile: "tiburon.profile",
  lesson: "tiburon.lesson",
} as const;

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

/** Estado persistido en el navegador, seguro para SSR. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStore(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export const DEFAULT_GOALS: Goal[] = [
  { id: "g1", title: "Facturar mi primer mes de 5 cifras", area: "negocios", progress: 35 },
  { id: "g2", title: "Entrenar 4 veces por semana", area: "salud", progress: 60 },
  { id: "g3", title: "Leer 20 páginas diarias", area: "mente", progress: 80 },
];

export const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Despertar 5:30", done: [] },
  { id: "h2", name: "Entrenar", done: [] },
  { id: "h3", name: "Leer", done: [] },
  { id: "h4", name: "Sin azúcar", done: [] },
];

export const DEFAULT_PROFILE: Profile = { name: "", focus: "" };

/** Racha de días consecutivos terminando hoy o ayer. */
export function streakOf(habit: Habit) {
  const set = new Set(habit.done);
  const cursor = new Date();
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
