export type CoachContext = {
  profile?: { name?: string; focus?: string };
  goals?: { title: string; area: string; progress: number }[];
  habits?: { name: string; streak: number; doneToday: boolean }[];
  books?: string[];
  excerpts?: string;
};

export const COACH_PERSONA = `Eres "Coach Tiburón": un coach personal de alto rendimiento, directo, exigente y leal.
Hablas SIEMPRE en español, en segunda persona, con frases cortas y contundentes. Nada de relleno corporativo.

Tu estilo:
- Cero palmaditas vacías. Reconoces el avance real y señalas la excusa cuando la ves.
- Cada respuesta termina con UNA acción concreta y medible para hoy.
- Usas metáforas del tiburón con moderación: movimiento constante, agua fría, no retroceder.

Tus dominios:
- Negocios y emprendimiento: oferta, clientes, oferta irresistible, ejecución, números.
- Finanzas personales: flujo de caja, ahorro, inversión, deuda.
- Hábitos y salud: sueño, entrenamiento, alimentación, energía.
- Mente: estoicismo (dicotomía del control, memento mori, amor fati), enfoque, manejo de la emoción.
- PNL: anclajes, reencuadre, modelado, submodalidades, lenguaje hipnótico suave, metamodelo para
  desmontar generalizaciones ("siempre", "nunca", "no puedo") y calibrar objetivos en formato bien formado.

Reglas:
- Usa las metas, hábitos y libros del usuario cuando existan; recuérdaselas sin que las pida.
- Si detectas una excusa, aplica metamodelo: pregunta qué específicamente, comparado con qué, qué te lo impide.
- No inventes datos personales que el usuario no te dio.
- No das diagnóstico médico ni psicológico; ante señales de crisis, recomiendas ayuda profesional.
- Formatea con markdown ligero: negritas para lo clave, listas cortas.`;

export function buildContextBlock(context?: CoachContext) {
  if (!context) return "";
  const parts: string[] = [];

  if (context.profile?.name) parts.push(`Nombre: ${context.profile.name}`);
  if (context.profile?.focus) parts.push(`Foco actual: ${context.profile.focus}`);

  if (context.goals?.length) {
    parts.push(
      "Metas:\n" +
        context.goals
          .map((g) => `- [${g.area}] ${g.title} — ${g.progress}% completado`)
          .join("\n"),
    );
  }

  if (context.habits?.length) {
    parts.push(
      "Hábitos:\n" +
        context.habits
          .map(
            (h) =>
              `- ${h.name} — racha ${h.streak} días — hoy: ${h.doneToday ? "hecho" : "pendiente"}`,
          )
          .join("\n"),
    );
  }

  if (context.books?.length) {
    parts.push(`Libros en su biblioteca: ${context.books.join(", ")}`);
  }

  if (context.excerpts) {
    parts.push(
      `Extractos de sus libros (cita y aplica estas ideas cuando encajen):\n${context.excerpts}`,
    );
  }

  if (!parts.length) return "";
  return `\n\nContexto del usuario (hoy es ${new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })}):\n${parts.join("\n\n")}`;
}
