import { cp, mkdir, rm } from "node:fs/promises";

const outputDirectory = new URL("../public/", import.meta.url);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await mkdir(new URL("src/", outputDirectory), { recursive: true });
await Promise.all([
  cp(new URL("../index.html", import.meta.url), new URL("index.html", outputDirectory)),
  cp(new URL("../src/styles.css", import.meta.url), new URL("src/styles.css", outputDirectory)),
  cp(new URL("../dist/", import.meta.url), new URL("dist/", outputDirectory), { recursive: true }),
  cp(new URL("../assets/", import.meta.url), new URL("assets/", outputDirectory), { recursive: true }),
]);
