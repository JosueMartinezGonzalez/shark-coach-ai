import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { STORAGE_KEYS, newId, useLocalState, type Thread } from "@/lib/store";

export const Route = createFileRoute("/chat/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Coach Tiburón · Conversaciones" },
      {
        name: "description",
        content: "Abre una conversación con tu coach tiburón sobre negocios, hábitos, salud o mente.",
      },
      { property: "og:title", content: "Coach Tiburón · Conversaciones" },
      {
        property: "og:description",
        content: "Habla con tu coach exigente sobre negocios, hábitos, salud y mente.",
      },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const [threads, setThreads, hydrated] = useLocalState<Thread[]>(STORAGE_KEYS.threads, []);

  useEffect(() => {
    if (!hydrated) return;
    const first = threads[0];
    if (first) {
      void navigate({ to: "/chat/$threadId", params: { threadId: first.id } });
      return;
    }
    const thread: Thread = {
      id: newId(),
      title: "Nueva conversación",
      updatedAt: Date.now(),
      messages: [],
    };
    setThreads([thread]);
    void navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
  }, [hydrated, threads, setThreads, navigate]);

  return (
    <div className="grid min-h-screen place-items-center font-mono text-[12px] text-water-300">
      Entrando al agua…
    </div>
  );
}
