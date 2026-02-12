import assert from "node:assert/strict";
import test from "node:test";

test("resetAdjustmentsToDefault restores defaults", async () => {
  (globalThis as { document?: unknown; HTMLInputElement?: unknown }).document = {
    querySelectorAll: () => [],
    getElementById: () => null,
  };
  (globalThis as { HTMLInputElement?: unknown }).HTMLInputElement = class {};

  const adjustmentsModule = await import("../src/features/character/services/adjustments.js");
  const { adjustments, resetAdjustmentsToDefault } = adjustmentsModule;

  adjustments.modifier_magie = 1;
  adjustments.Handwerkstalente = 1;
  resetAdjustmentsToDefault();

  assert.equal(adjustments.modifier_magie, 10);
  assert.equal(adjustments.Handwerkstalente, 3);
});

test("setKlassenVariable applies class adjustments", async () => {
  (globalThis as { document?: unknown; HTMLInputElement?: unknown }).document = {
    querySelectorAll: () => [],
    getElementById: () => null,
  };
  (globalThis as { HTMLInputElement?: unknown }).HTMLInputElement = class {};

  const adjustmentsModule = await import("../src/features/character/services/adjustments.js");
  const { adjustments, setKlassenVariable, resetAdjustmentsToDefault } = adjustmentsModule;

  resetAdjustmentsToDefault();
  setKlassenVariable("Mage", {
    "Magische Klassen": ["Mage"],
  });

  assert.equal(adjustments.modifier_magie, 3);
  assert.equal(adjustments.modifier_asp, 5);
  assert.equal(adjustments.Magische_Elemente, 20);
});
