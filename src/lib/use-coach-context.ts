import { useEffect, useState } from "react";
import {
  DEFAULT_GOALS,
  DEFAULT_HABITS,
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  streakOf,
  todayKey,
  useLocalState,
  type Goal,
  type Habit,
  type Profile,
} from "@/lib/store";
import { bookDigest, listBooks, type Book } from "@/lib/library";
import type { CoachContext } from "@/lib/coach";

/** Reúne metas, hábitos, perfil y libros para enviárselos al coach. */
export function useCoachContext() {
  const [goals] = useLocalState<Goal[]>(STORAGE_KEYS.goals, DEFAULT_GOALS);
  const [habits] = useLocalState<Habit[]>(STORAGE_KEYS.habits, DEFAULT_HABITS);
  const [profile] = useLocalState<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch(() => setBooks([]));
  }, []);

  const today = todayKey();
  const context: CoachContext = {
    profile,
    goals: goals.map((g) => ({ title: g.title, area: g.area, progress: g.progress })),
    habits: habits.map((h) => ({
      name: h.name,
      streak: streakOf(h),
      doneToday: h.done.includes(today),
    })),
    books: books.map((b) => b.title),
    excerpts: bookDigest(books),
  };

  return context;
}
