import { cp, mkdir, readFile, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

export function localAssets(html) {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  const styles = [...html.matchAll(/<link\b[^>]*>/gi)]
    .filter((match) => /\brel=["']stylesheet["']/i.test(match[0]))
    .map((match) => /\bhref=["']([^"']+)["']/i.exec(match[0])?.[1])
    .filter(Boolean);
  const isLocal = (url) => !/^(?:https?:)?\/\//.test(url);
  if (!scripts.some(isLocal)) throw new Error("El HTML no contiene scripts locales de la aplicación.");
  if (!styles.some(isLocal)) throw new Error("El HTML no contiene estilos locales de la aplicación.");
  return [...scripts, ...styles].filter(isLocal);
}

export async function prepareCapacitor(root = process.cwd()) {
  const destination = resolve(root, ".output/public");
  // Lovable pins its client output to dist/client; ordinary CI uses Nitro's publicDir.
  const candidates = [resolve(root, "dist/client"), destination];
  let source;
  for (const candidate of candidates) {
    if (await stat(join(candidate, "index.html")).then((s) => s.isFile()).catch(() => false)) {
      source = candidate;
      break;
    }
  }
  if (!source) throw new Error("No se generó index.html: revisa el modo SPA de TanStack Start.");
  const html = await readFile(join(source, "index.html"), "utf8");
  for (const asset of localAssets(html)) {
    const path = resolve(source, asset.replace(/^\//, "").split(/[?#]/)[0]);
    if (!path.startsWith(source + "/")) throw new Error("Archivo fuera de la carpeta estática.");
    await stat(path);
  }
  if (source !== destination) {
    await mkdir(destination, { recursive: true });
    await cp(source, destination, { recursive: true });
  }
  console.log("Capacitor: HTML, scripts y estilos verificados en .output/public.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareCapacitor();
}