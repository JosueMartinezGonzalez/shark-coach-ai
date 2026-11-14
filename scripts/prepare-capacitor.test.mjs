import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { localAssets, prepareCapacitor } from "./prepare-capacitor.mjs";

const html = '<!doctype html><html><head><link rel="stylesheet" href="/assets/app.css"></head><body><script type="module" src="/assets/app.js"></script></body></html>';

test("rejects a placeholder HTML without application scripts", () => {
  assert.throws(() => localAssets('<html><body><div id="root"></div></body></html>'), /scripts/);
});

test("requires bundled styles, not only external fonts", () => {
  assert.throws(() => localAssets('<script src="/app.js"></script><link rel="stylesheet" href="https://fonts.example/style.css">'), /estilos/);
});

test("copies the real SPA shell and its assets to Capacitor webDir", async () => {
  const root = await mkdtemp(join(tmpdir(), "capacitor-static-"));
  try {
    await mkdir(join(root, "dist/client/assets"), { recursive: true });
    await writeFile(join(root, "dist/client/index.html"), html);
    await writeFile(join(root, "dist/client/assets/app.js"), "console.log('app')");
    await writeFile(join(root, "dist/client/assets/app.css"), "body{}");
    await prepareCapacitor(root);
    assert.equal(await readFile(join(root, ".output/public/index.html"), "utf8"), html);
    assert.equal(await readFile(join(root, ".output/public/assets/app.js"), "utf8"), "console.log('app')");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("fails instead of generating an empty index.html", async () => {
  const root = await mkdtemp(join(tmpdir(), "capacitor-missing-"));
  try {
    await assert.rejects(prepareCapacitor(root), /No se generó index.html/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});