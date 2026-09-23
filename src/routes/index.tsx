import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { generarLeccion, type Lesson } from "@/lib/lesson.functions";
import { useCoachContext } from "@/lib/use-coach-context";
import {
  DEFAULT_GOALS,
  DEFAULT_HABITS,
  STORAGE_KEYS,
  newId,
  streakOf,
  todayKey,
  useLocalState,
  type Goal,
  type Habit,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mordida · Tu coach tiburón para negocios, hábitos y mente" },
      {
        name: "description",
        content:
          "Centro de comando con tu coach tiburón: lección diaria, metas, rachas de hábitos y una biblioteca de tus libros.",
      },
      { property: "og:title", content: "Mordida · Tu coach tiburón" },
      {
        property: "og:description",
        content:
          "Lección diaria, metas, hábitos y conversación con un coach exigente de negocios, salud y mente.",
      },
    ],
  }),
  component: Panel,
});

const AREAS: Goal["area"][] = ["negocios", "habitos", "salud", "mente"];

function Panel() {
  const context = useCoachContext();
  const [goals, setGoals] = useLocalState<Goal[]>(STORAGE_KEYS.goals, DEFAULT_GOALS);
  const [habits, setHabits] = useLocalState<Habit[]>(STORAGE_KEYS.habits, DEFAULT_HABITS);
  const [lesson, setLesson] = useLocalState<{ fecha: string; data: Lesson } | null>(
    STORAGE_KEYS.lesson,
    null,
  );
  const [loading, setLoading] = useState(false);
  const today = todayKey();

  const fresh = lesson?.fecha === today;

  async function pedirLeccion() {
    setLoading(true);
    try {
      const data = await generarLeccion({
        data: { context, fecha: new Date().toLocaleDateString("es-ES") },
      });
      setLesson({ fecha: today, data });
    } catch {
      /* el error se refleja en el estado vacío */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!fresh && !loading) void pedirLeccion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh]);

  const doneCount = useMemo(
    () => goals.filter((g) => g.progress >= 100).length,
    [goals],
  );

  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              done: h.done.includes(today)
                ? h.done.filter((d) => d !== today)
                : [...h.done, today],
            }
          : h,
      ),
    );
  }

  function addHabit() {
    const name = window.prompt("¿Qué hábito quieres sostener?");
    if (!name?.trim()) return;
    setHabits((prev) => [...prev, { id: newId(), name: name.trim(), done: [] }]);
  }

  function addGoal() {
    const title = window.prompt("¿Cuál es la meta?");
    if (!title?.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: newId(), title: title.trim(), area: "negocios", progress: 0 },
    ]);
  }

  return (
    <AppShell>
      <div className="mt-8 grid grid-cols-12 gap-4">
        <section className="col-span-12 flex flex-col panel p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="label-mono">Lección de hoy</span>
            <button
              onClick={() => void pedirLeccion()}
              disabled={loading}
              className="flex items-center gap-1.5 font-mono text-[11px] text-water-300 transition-colors hover:text-water-50 disabled:opacity-50"
            >
              <RotateCw className={loading ? "size-3 animate-spin" : "size-3"} />
              otra
            </button>
          </div>

          {loading && !lesson ? (
            <div className="mt-6 space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
            </div>
          ) : lesson ? (
            <>
              <h1 className="snap-in mt-4 max-w-[24ch] text-balance font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
                {lesson.data.titulo}
              </h1>
              <p className="mt-3 max-w-[42ch] text-pretty text-sm text-water-200">
                {lesson.data.ensenanza}
              </p>
              <div className="mt-4 panel-inset p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-bite">
                  Reto de hoy
                </div>
                <div className="mt-1 font-display text-[15px] font-medium">
                  {lesson.data.reto}
                </div>
              </div>
              <div className="mt-auto flex items-center gap-3 pt-5">
                <Link
                  to="/chat"
                  className="rounded-full bg-ice px-4 py-2.5 font-mono text-[13px] text-water-900 ring-1 ring-ice/50 transition-transform hover:-translate-y-px"
                >
                  Iniciar {lesson.data.minutos} min
                </Link>
                <span className="font-mono text-[11px] text-water-300">
                  {lesson.data.fuente}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-water-300">
              No se pudo traer la lección. Pulsa «otra» para reintentar.
            </p>
          )}
        </section>

        <section className="col-span-12 panel p-6 lg:col-span-7">
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Rachas activas</span>
            <button
              onClick={addHabit}
              className="flex items-center gap-1 font-mono text-[11px] text-water-300 transition-colors hover:text-water-50"
            >
              <Plus className="size-3" /> hábito
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {habits.map((habit) => {
              const streak = streakOf(habit);
              const hoy = habit.done.includes(today);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`snap-in p-4 text-left transition-transform hover:-translate-y-px ${
                    hoy
                      ? "rounded-[12px] bg-ice/10 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--ice)_35%,transparent)]"
                      : "panel-inset"
                  }`}
                >
                  <div className="truncate font-mono text-[11px] text-water-300">
                    {habit.name}
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold leading-none">
                    {streak}
                  </div>
                  <div className={`mt-1 text-[11px] ${hoy ? "text-ice" : "text-bite/80"}`}>
                    {hoy ? "hecho hoy" : "pendiente"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-baseline justify-between">
            <span className="label-mono">Metas</span>
            <span className="font-mono text-[11px] text-water-300">
              {doneCount} de {goals.length}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="group flex items-center gap-3 rounded-[12px] bg-water-900/30 px-4 py-3 shadow-[inset_0_0_0_1px_color-mix(in_oklab,white_10%,transparent)]"
              >
                <button
                  onClick={() =>
                    setGoals((prev) =>
                      prev.map((g) =>
                        g.id === goal.id
                          ? {
                              ...g,
                              area:
                                AREAS[(AREAS.indexOf(g.area) + 1) % AREAS.length] ??
                                "negocios",
                            }
                          : g,
                      ),
                    )
                  }
                  title={goal.area}
                  className={`size-2 shrink-0 rounded-full ${
                    goal.area === "negocios"
                      ? "bg-ice"
                      : goal.area === "salud"
                        ? "bg-bite"
                        : goal.area === "mente"
                          ? "bg-water-300"
                          : "bg-ice-2"
                  }`}
                />
                <span className="flex-1 truncate text-sm">{goal.title}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={goal.progress}
                  onChange={(e) =>
                    setGoals((prev) =>
                      prev.map((g) =>
                        g.id === goal.id ? { ...g, progress: Number(e.target.value) } : g,
                      ),
                    )
                  }
                  className="h-1.5 w-24 cursor-pointer accent-ice"
                  aria-label={`Progreso de ${goal.title}`}
                />
                <span className="w-9 text-right font-mono text-[12px] text-water-300">
                  {goal.progress}%
                </span>
                <button
                  onClick={() => setGoals((prev) => prev.filter((g) => g.id !== goal.id))}
                  className="text-water-500 opacity-0 transition-opacity hover:text-bite group-hover:opacity-100"
                  aria-label="Borrar meta"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addGoal}
              className="flex w-full items-center justify-center gap-1.5 rounded-[12px] px-4 py-3 font-mono text-[12px] text-water-300 shadow-[inset_0_0_0_1px_color-mix(in_oklab,white_10%,transparent)] transition-colors hover:text-water-50"
            >
              <Plus className="size-3.5" /> añadir meta
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
