import { expect, it } from "vitest";
import { createCharacter } from "../../src/domain";
import { parseCharacterJson, serializeCharacterJson, serializeSharedCharacterJson } from "../../src/storage/characterJson";

it("überträgt Texte, Magieverknüpfung und Bild nur im vollständigen Backup", () => {
  const character = createCharacter();
  character.profile.name = "Nera";
  character.portrait = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/5l8AAAAASUVORK5CYII=";
  character.magic = [{ id: "funken", element: "Feuer", type: "Unterstützung", level: 1 }];
  character.writing = {
    notes: "Nur für mich",
    spells: [{ id: "s1", name: "Licht", text: "Beschreibung", magicId: "funken" }],
  };

  const backup = serializeCharacterJson(character, { "/notiz": "Unbekannte private Daten" });
  expect(parseCharacterJson(backup).character).toEqual(character);
  const shared = serializeSharedCharacterJson(character);
  expect(shared).not.toContain("Nur für mich");
  expect(shared).not.toContain("Beschreibung");
  expect(shared).not.toContain("base64");
  const gameSheet = parseCharacterJson(shared);
  expect(gameSheet.character).toEqual({ ...character, portrait: undefined, writing: undefined });
  expect(gameSheet.legacy).toBeUndefined();
});
