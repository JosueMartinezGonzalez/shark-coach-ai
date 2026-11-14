import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { Plus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { STORAGE_KEYS, newId, useLocalState, type Thread } from "@/lib/store";
import { useCoachContext } from "@/lib/use-coach-context";
import logo from "@/assets/tiburon.png";

export const Route = createFileRoute("/chat/$threadId")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Coach Tiburón · Conversación" },
      {
        name: "description",
        content:
          "Conversa con tu coach tiburón: negocios, finanzas, hábitos, salud, estoicismo y PNL.",
      },
      { property: "og:title", content: "Coach Tiburón · Conversación" },
      {
        property: "og:description",
        content: "Tu coach exigente responde con una acción concreta para hoy.",
      },
    ],
  }),
  component: ChatThread,
});

const SUGERENCIAS = [
  "Revisa mis metas y dime dónde estoy fallando",
  "Quiero conseguir 3 clientes esta semana",
  "Se me rompió la racha, ¿qué hago?",
  "Dame un reencuadre de PNL para el miedo a vender",
];

function ChatThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const context = useCoachContext();
  const [threads, setThreads, hydrated] = useLocalState<Thread[]>(STORAGE_KEYS.threads, []);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const thread = threads.find((t) => t.id === threadId);
  const initialMessages = useMemo(() => thread?.messages ?? [], [thread?.id, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error, stop } = useChat({
    id: threadId,
    messages: initialMessages as UIMessage[],
    transport,
  });

  // Crea el hilo si la URL apunta a uno que ya no existe
  useEffect(() => {
    if (!hydrated || thread) return;
    setThreads((prev) => [
      { id: threadId, title: "Nueva conversación", updatedAt: Date.now(), messages: [] },
      ...prev,
    ]);
  }, [hydrated, thread, threadId, setThreads]);

  // Guarda en este navegador
  useEffect(() => {
    if (!hydrated || messages.length === 0) return;
    if (status === "streaming" || status === "submitted") return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: messages as UIMessage[],
              updatedAt: Date.now(),
              title: t.title === "Nueva conversación" ? titleOf(messages) : t.title,
            }
          : t,
      ),
    );
  }, [messages, status, hydrated, threadId, setThreads]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const loading = status === "submitted" || status === "streaming";

  function nuevaConversacion() {
    const id = newId();
    setThreads((prev) => [
      { id, title: "Nueva conversación", updatedAt: Date.now(), messages: [] },
      ...prev,
    ]);
    void navigate({ to: "/chat/$threadId", params: { threadId: id } });
  }

  function borrar(id: string) {
    const rest = threads.filter((t) => t.id !== id);
    setThreads(rest);
    if (id === threadId) {
      const next = rest[0];
      if (next) {
        void navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
      } else {
        void navigate({ to: "/chat" });
      }
    }
  }

  function enviar(text: string) {
    if (!text.trim() || loading) return;
    void sendMessage({ text: text.trim() }, { body: { context } });
  }

  return (
    <AppShell>
      <div className="mt-8 grid grid-cols-12 gap-4">
        <aside className="col-span-12 panel p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <span className="label-mono">Conversaciones</span>
            <button
              onClick={nuevaConversacion}
              className="flex items-center gap-1 font-mono text-[11px] text-water-300 transition-colors hover:text-water-50"
            >
              <Plus className="size-3" /> nueva
            </button>
          </div>
          <div className="mt-3 max-h-[60vh] space-y-1.5 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-2 rounded-[10px] px-3 py-2 ${
                  t.id === threadId ? "bg-water-900/50 ring-1 ring-ice/30" : "hover:bg-white/5"
                }`}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="min-w-0 flex-1 truncate text-[13px] text-water-100"
                >
                  {t.title}
                </Link>
                <button
                  onClick={() => borrar(t.id)}
                  aria-label="Borrar conversación"
                  className="text-water-500 opacity-0 transition-opacity hover:text-bite group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="col-span-12 flex h-[72vh] flex-col panel p-5 lg:col-span-9">
          <Conversation className="flex-1">
            <ConversationContent className="gap-5 px-0">
              {messages.length === 0 && (
                <div className="mt-10 flex flex-col items-center text-center">
                  <img
                    src={logo}
                    alt="Coach Tiburón"
                    width={72}
                    height={72}
                    loading="lazy"
                    className="size-16 opacity-90"
                  />
                  <p className="mt-4 max-w-[32ch] text-balance font-display text-2xl font-semibold leading-tight">
                    El agua está fría. Entra igual.
                  </p>
                  <p className="mt-2 max-w-[42ch] text-sm text-water-300">
                    Cuéntame en qué estás atascado hoy: negocio, dinero, cuerpo o cabeza.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {SUGERENCIAS.map((s) => (
                      <button
                        key={s}
                        onClick={() => enviar(s)}
                        className="rounded-full px-3.5 py-2 text-[12px] text-water-200 shadow-[inset_0_0_0_1px_color-mix(in_oklab,white_12%,transparent)] transition-colors hover:text-water-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <MessageResponse key={index}>{part.text}</MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))}

              {status === "submitted" && (
                <Shimmer className="font-mono text-[12px]">El tiburón está rodeando…</Shimmer>
              )}

              {error && (
                <p className="rounded-[10px] bg-bite/10 px-4 py-3 text-sm text-bite">
                  No se pudo hablar con el coach. Revisa tu conexión y vuelve a intentarlo.
                </p>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput
            className="mt-4"
            onSubmit={(message, event) => {
              event.preventDefault();
              enviar(message.text ?? "");
              (event.currentTarget as HTMLFormElement).reset();
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Escribe al tiburón…"
              autoFocus
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </section>
      </div>
    </AppShell>
  );
}

function titleOf(messages: UIMessage[]) {
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "Nueva conversación";
  return text.length > 38 ? `${text.slice(0, 38)}…` : text;
}
