import assert from "node:assert/strict";
import test from "node:test";

const setupDom = () => {
  (globalThis as { document?: unknown }).document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  (globalThis as { HTMLInputElement?: unknown }).HTMLInputElement = class {};
  (globalThis as { HTMLSelectElement?: unknown }).HTMLSelectElement = class {};
};

test("generateStandardFilename sanitizes the character name", async () => {
  setupDom();
  const { generateStandardFilename } = await import("../src/features/character/services/saveLoader.js");

  const filename = generateStandardFilename("Mein Name@ 2024!");

  assert.ok(filename.startsWith("Mein_Name_2024_"));
  assert.ok(filename.endsWith(".json"));
  assert.ok(!filename.includes("@"));
  assert.ok(!filename.includes("!"));
});

test("generateStandardFilename falls back to default name", async () => {
  setupDom();
  const { generateStandardFilename } = await import("../src/features/character/services/saveLoader.js");

  const filename = generateStandardFilename("   ");

  assert.ok(filename.startsWith("Charakter_"));
  assert.ok(filename.endsWith(".json"));
});
