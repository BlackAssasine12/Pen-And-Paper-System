import { describe, expect, it } from "vitest";
import { applyCharacterAction, createCharacter, createCharacterSelectors } from "./index";
import { isCharacterPortrait, portraitMaxBytes } from "./portrait";
import { suggestStarter } from "./starter";
import { rollTalentProbe } from "./talentProbe";

const pixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/5l8AAAAASUVORK5CYII=";

describe("Spielvorbereitung", () => {
  it("ordnet 3W20 den Probenattributen in Reihenfolge zu und behält den Talentwert", () => {
    const character = createCharacter();
    const talent = character.talents.find(({ name }) => name === "Klettern")!;
    const values = [0, 0.5, 0.999];
    const outcome = rollTalentProbe({ ...talent, value: -2 }, character.attributes, () => values.shift()!);
    expect(outcome).toEqual({
      name: "Klettern", talentValue: -2, rolls: [
        { code: "KO", label: "Konstitution", threshold: 9, roll: 1 },
        { code: "GEW", label: "Gewandheit", threshold: 9, roll: 11 },
        { code: "KK", label: "Körperkraft", threshold: 9, roll: 20 },
      ],
    });
  });

  it("zeigt beim Startervorschlag die Kosten für den gewählten Klassentarif", () => {
    const suggestion = suggestStarter("Ritter", "kampf");
    expect(suggestion).toMatchObject({
      pointsSpent: 14, pointsLeft: 116, character: {
        attributes: { Konstitution: 10, Körperkraft: 10 },
        profile: { klasse: "Ritter" },
      },
    });
  });

  it("ändert Notizen, Zaubertexte und Bild ohne neue Spielberechnung", () => {
    const original = createCharacter();
    const selector = createCharacterSelectors();
    const baseline = selector(original);
    const withPicture = applyCharacterAction(original, { type: "set-portrait", value: pixel }).state;
    const withNotes = applyCharacterAction(withPicture, { type: "set-notes", value: "Am Wegesrand warten." }).state;
    const withSpell = applyCharacterAction(withNotes, {
      type: "save-spell-note", spell: { id: "spell", name: "Funken", text: "Kleiner Funken." },
    }).state;
    expect(selector(withSpell)).toBe(baseline);
    expect(withSpell.writing?.spells).toHaveLength(1);

    const withoutSpell = applyCharacterAction(withSpell, { type: "remove-spell-note", id: "spell" }).state;
    const withoutPortrait = applyCharacterAction(withoutSpell, { type: "set-portrait", value: undefined }).state;
    expect(withoutPortrait.writing).toEqual({ notes: "Am Wegesrand warten.", spells: [] });
    expect(withoutPortrait.portrait).toBeUndefined();
  });

  it("akzeptiert nur begrenzte Rasterbilddaten mit passender Signatur", () => {
    expect(isCharacterPortrait(pixel)).toBe(true);
    expect(isCharacterPortrait(pixel.replace("image/png", "image/jpeg"))).toBe(false);
    expect(isCharacterPortrait("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    expect(isCharacterPortrait("data:image/png;base64," + Buffer.alloc(portraitMaxBytes + 1).toString("base64"))).toBe(false);
  });
});
