import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("publishes a standalone install manifest with app icons", async () => {
  const manifest = JSON.parse(await read("manifest.webmanifest"));

  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.src === "./assets/pwa/icon-192.png" && icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.src === "./assets/pwa/icon-512.png" && icon.sizes === "512x512"));
});

test("registers an offline service worker from the game document", async () => {
  const html = await read("index.html");
  const worker = await read("service-worker.js");

  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /navigator\.serviceWorker\.register\("\.\/service-worker\.js"\)/);
  assert.match(worker, /cache\.addAll/);
  assert.match(worker, /fetch/);
});

test("packages PWA files in the Vercel output", async () => {
  const buildScript = await read("scripts/build-vercel.mjs");

  assert.match(buildScript, /manifest\.webmanifest/);
  assert.match(buildScript, /service-worker\.js/);
  assert.match(buildScript, /assets\//);
});
