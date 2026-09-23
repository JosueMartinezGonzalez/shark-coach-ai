/** Biblioteca personal: PDFs guardados en IndexedDB, solo en este navegador. */

export type Book = {
  id: string;
  title: string;
  pages: number;
  size: number;
  addedAt: number;
  /** Texto extraído (recortado) que usa el coach como referencia */
  text: string;
};

const DB_NAME = "tiburon-biblioteca";
const STORE = "libros";
export const MAX_TEXT = 60_000;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listBooks(): Promise<Book[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () =>
      resolve(
        (request.result as Book[]).sort((a, b) => b.addedAt - a.addedAt),
      );
    request.onerror = () => reject(request.error);
  });
}

export async function saveBook(book: Book): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(book);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteBook(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Extrae el texto de un PDF en el navegador. */
export async function extractPdf(
  file: File,
  onProgress?: (page: number, total: number) => void,
): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url"))
    .default as string;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const chunks: string[] = [];
  let length = 0;

  for (let i = 1; i <= doc.numPages; i += 1) {
    onProgress?.(i, doc.numPages);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    chunks.push(pageText);
    length += pageText.length;
    if (length > MAX_TEXT) break;
  }

  return { text: chunks.join("\n").slice(0, MAX_TEXT), pages: doc.numPages };
}

/** Extractos cortos que viajan al coach como contexto. */
export function bookDigest(books: Book[], perBook = 2500) {
  return books
    .slice(0, 6)
    .map((b) => `### ${b.title}\n${b.text.slice(0, perBook)}`)
    .join("\n\n");
}
