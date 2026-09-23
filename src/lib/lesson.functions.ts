import { createServerFn } from "@tanstack/react-start";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { buildContextBlock, COACH_PERSONA, type CoachContext } from "@/lib/coach";

const LessonSchema = z.object({
  titulo: z.string(),
  ensenanza: z.string(),
  reto: z.string(),
  fuente: z.string(),
  minutos: z.number(),
});

export type Lesson = z.infer<typeof LessonSchema>;

const InputSchema = z.object({
  context: z.unknown().nullable(),
  fecha: z.string(),
});

export const generarLeccion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<Lesson> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Falta LOVABLE_API_KEY");

    const { createLovableAiGatewayRunIdFetch } = await import("@/lib/ai-gateway.server");
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system: COACH_PERSONA + buildContextBlock((data.context ?? undefined) as CoachContext),
      prompt: `Crea la lección del día ${data.fecha}.
- "titulo": una frase corta y contundente, máximo 8 palabras.
- "ensenanza": 3 o 4 frases que expliquen la idea y por qué importa hoy, en español.
- "reto": una acción concreta y medible para hoy, máximo 15 palabras.
- "fuente": el libro, autor o corriente en que se apoya (estoicismo, PNL, finanzas, etc.).
- "minutos": minutos estimados para completar el reto, entre 5 y 30.
Escoge un tema distinto a lo obvio y conéctalo con sus metas y libros si los tiene.`,
      output: Output.object({ schema: LessonSchema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          store: false,
        },
      },
    });

    try {
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          titulo: "El agua no negocia",
          ensenanza:
            "Hoy el coach no pudo escribir la lección. No es excusa: la disciplina no depende de una pantalla. Ejecuta lo mínimo no negociable y vuelve a intentarlo en un rato.",
          reto: "Haz la tarea que llevas evitando, ahora.",
          fuente: "Estoicismo",
          minutos: 15,
        };
      }
      throw error;
    }
  });
