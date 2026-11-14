import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { deleteBook, extractPdf, listBooks, saveBook, type Book } from "@/lib/library";
import { newId } from "@/lib/store";

export const Route = createFileRoute("/biblioteca")({
  ssr: false,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Biblioteca · Coach Tiburón" },
      {
        name: "description",
        content:
          "Sube tus libros de crecimiento personal, finanzas y estoicismo para que el coach se apoye en ellos.",
      },
      { property: "og:title", content: "Biblioteca · Coach Tiburón" },
      {
        property: "og:description",
        content: "Tus libros alimentan las lecciones y las respuestas del coach.",
      },
    ],
  }),
  component: Biblioteca,
});

function Biblioteca() {
  const [books, setBooks] = useState<Book[]>([]);
  const [estado, setEstado] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    listBooks()
      .then(setBooks)
      .catch(() => setBooks([]));
  }, []);

  async function subir(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        setEstado(`${file.name}: solo se aceptan PDF por ahora.`);
        continue;
      }
      try {
        setEstado(`Leyendo ${file.name}…`);
        const { text, pages } = await extractPdf(file, (page, total) =>
          setEstado(`Leyendo ${file.name} — página ${page} de ${total}`),
        );
        const book: Book = {
          id: newId(),
          title: file.name.replace(/\.pdf$/i, ""),
          pages,
          size: file.size,
          addedAt: Date.now(),
          text,
        };
        await saveBook(book);
        setBooks((prev) => [book, ...prev]);
        setEstado(`${book.title} está en el agua.`);
      } catch {
        setEstado(`No se pudo leer ${file.name}.`);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function quitar(id: string) {
    await deleteBook(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <AppShell>
      <div className="mt-8 grid grid-cols-12 gap-4">
        <section className="col-span-12 panel p-6 lg:col-span-5">
          <span className="label-mono">Tu biblioteca</span>
          <h1 className="mt-4 max-w-[20ch] text-balance font-display text-3xl font-semibold leading-[1.05] tracking-tight">
            Lo que lees es munición.
          </h1>
          <p className="mt-3 max-w-[40ch] text-pretty text-sm text-water-200">
            Sube tus PDFs de emprendimiento, finanzas, estoicismo o PNL. El coach lee sus
            extractos y los usa en tus lecciones y respuestas. Todo se queda en este navegador.
          </p>

          <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-ice/10 px-4 py-6 font-mono text-[12px] text-ice-2 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--ice)_30%,transparent)] transition-transform hover:-translate-y-px">
            <Upload className="size-4" />
            arrastra o elige tus PDF
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => void subir(e.target.files)}
            />
          </label>

          {estado && (
            <p className="mt-3 font-mono text-[11px] text-water-300">{estado}</p>
          )}
        </section>

        <section className="col-span-12 panel p-6 lg:col-span-7">
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Libros</span>
            <span className="font-mono text-[11px] text-water-300">{books.length}</span>
          </div>

          {books.length === 0 ? (
            <p className="mt-6 text-sm text-water-300">
              Aún no hay nada aquí. El primer libro cambia todas las lecciones.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="group flex items-center gap-3 panel-inset px-4 py-3"
                >
                  <BookOpen className="size-4 shrink-0 text-ice" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{book.title}</div>
                    <div className="font-mono text-[11px] text-water-300">
                      {book.pages} páginas · {(book.size / 1_048_576).toFixed(1)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => void quitar(book.id)}
                    aria-label="Quitar libro"
                    className="text-water-500 opacity-0 transition-opacity hover:text-bite group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
