import { describe, expect, it } from "vitest";
import { createCharacter, createCharacterSelectors } from "../../src/domain";
import { CharacterJsonError, parseCharacterJson, serializeCharacterJson, serializeMagicJson } from "../../src/storage/characterJson";
import liveMain from "./live-main.json";
import historicalMagic from "./historisch-elemente.json";
import historicalTalentMaps from "./historisch-talentlisten.json";
import historicalCombat from "./historisch-kampfwerte.json";
import historicalArrays from "./historisch-array.json";

function imported(value: unknown) {
  return parseCharacterJson(JSON.stringify(value));
}

describe("DSA3-JSON", () => {
  it("übernimmt spielrelevante Werte aus dem produktiven Format gemeinsam", () => {
    const file = structuredClone(liveMain);
    file.charakter.charakterInfo = { ...file.charakter.charakterInfo, name: "Jallia", klasse: "Waldelf", rasse: "Elfe" };
    file.charakter.werte = { xp: 850, level: 7, Gesteigerte: 10, Steigerungspunkte: 88 };
    file.charakter.fähigkeiten.sonderwerte["Aktuelle LP"] = 24;
    file.charakter.fähigkeiten.sonderwerte.Ausdauer = 17;
    file.charakter.fähigkeiten.sonderwerte.Astralenergie = 6;
    file.charakter.geld = { dukaten: 2, silber: 2, heller: 0, kreuzer: 1, wInsg: 0 };
    const result = imported({
      ...file,
      inventory: [{ name: "Kräuter", count: 4 }],
      magieSystem: { advancementPoints: 900, magicAbilities: [{ element: "Licht", type: "Illusion", level: 4 }] },
    });
    expect(result.kind).toBe("character");
    expect(result.character.profile).toMatchObject({ name: "Jallia", klasse: "Waldelf", rasse: "Elfe" });
    expect(result.character.resources).toEqual({ lp: 24, endurance: 17, asp: 6 });
    expect(result.character.inventory[0]).toMatchObject({ name: "Kräuter", quantity: 4 });
    expect(result.character.magic[0]).toMatchObject({ element: "Licht", type: "Illusion", level: 4 });
    expect(result.character.experience).toEqual({ xp: 850, spent: 10, bonus: 0 });
    expect(createCharacterSelectors()(result.character)).toMatchObject({ level: 6, availablePoints: 270, walletTotal: 2201 });
    expect(result.warnings.join(" ")).toMatch(/Stufe 6.*270 Punkte.*Münzbestände/);
  });

  it("migriert alte Elementstufen ohne eine vorhandene Magieliste doppelt einzurechnen", () => {
    const file = structuredClone(historicalMagic);
    file.charakter.Magische_Elemente.Feuer = 3;
    file.charakter.Magische_Elemente.Wasser = 0;
    const result = imported(file);
    expect(result.character.magic).toEqual([
      { id: expect.any(String), element: "Feuer", type: "Angriff", level: 3 },
    ]);
    expect(result.legacy?.["/charakter/Magische_Elemente"]).toMatchObject({ Feuer: 3, Wasser: 0 });
    const current = imported({
      ...file,
      magieSystem: { magicAbilities: [{ element: "Eis", type: "Schutz", level: 6 }] },
    });
    expect(current.character.magic.map((ability) => ability.element)).toEqual(["Eis"]);
  });

  it("liest Talentverteilungen mit Probenattributen im Schlüssel", () => {
    const file = structuredClone(historicalTalentMaps);
    file.charakter.fähigkeiten.Assassinen_Talente["Verkleiden (CH/IN/GES)"] = 8;
    const result = imported(file);
    expect(result.character.talents.find(({ name }) => name === "Verkleiden")).toMatchObject({
      group: "Assassinen_Talente", attributes: "CH/IN/GES", value: 8,
    });
  });

  it("liest skalare Kampftalente, frühere Schreibweisen und separate Kampfverteilungen", () => {
    const file = structuredClone(historicalCombat);
    file.charakter.fähigkeiten.Kampf_Talente["Einhand Schwerter"] = 5;
    file.charakter.fähigkeiten.Gespeicherte_Kampftalente["Einhand Schwerter"] = [3, 2, 5];
    file.charakter.fähigkeiten.Kampf_Talente.Bolzwaffen = 7;
    const result = imported(file);
    expect(result.character.combatTalents.find(({ name }) => name === "Einhand Schwerter")).toMatchObject({
      attack: 3, parry: 2, value: 5,
    });
    expect(result.character.combatTalents.find(({ name }) => name === "Bolzenwaffen")).toMatchObject({ kind: "shoot", value: 7 });
    expect(result.legacy?.["/charakter/fähigkeiten/Gespeicherte_Kampftalente"]).toMatchObject({
      "Einhand Schwerter": [3, 2, 5],
    });
  });

  it("liest die alten Array-Abschnitte und behält übrig gebliebene Talente", () => {
    const file = structuredClone(historicalArrays);
    file.charakter.fähigkeiten[0].attribute[0].konstitution = 14;
    file.charakter.fähigkeiten[0].sonderwerte[0].AktuelleLP = 18;
    file.charakter.fähigkeiten[0].talente[0].Schattenbeherrschung = 8;
    const result = imported(file);
    expect(result.character.attributes.Konstitution).toBe(14);
    expect(result.character.resources.lp).toBe(18);
    expect(result.character.wallet.dukaten).toBe(10);
    expect(result.character.talents.find(({ name }) => name === "Schattenbeherrschung")).toMatchObject({ value: 8 });
  });

  it("behält bei konkurrierenden alten und neuen Kampftalentnamen beide Einträge", () => {
    const result = imported({
      charakter: { fähigkeiten: { Kampf_Talente: { "Messer/Doche": [1, 2, 3], "Messer/Dolche": [3, 2, 5] } } },
    });
    const restored = parseCharacterJson(serializeCharacterJson(result.character));
    expect(restored.character.combatTalents.find(({ name }) => name === "Messer/Doche")).toMatchObject({ value: 3 });
    expect(restored.character.combatTalents.find(({ name }) => name === "Messer/Dolche")).toMatchObject({ value: 5 });
  });

  it("speichert aktuelle Spielwerte und erhaltene Zusatzfelder verlustfrei", () => {
    const character = createCharacter();
    character.profile.name = "Ana";
    character.experience = { xp: 900, spent: 34, bonus: 18 };
    character.freeAdvancement = true;
    character.hidden = { attributes: ["Konstitution"], talents: [character.talents[0].id] };
    character.magic = [{ id: "ability-1", element: "Kristall", type: "Kontrolle", level: 3 }];
    character.inventory = [{ id: "item-1", name: "Schriftrolle", quantity: 2 }];
    character.wallet = { dukaten: 1, silber: 0, heller: 2, kreuzer: 0 };
    character.resources = { lp: 3, endurance: 4, asp: 5 };
    const archive = { "/charakter/notes": "Alte Notiz", "/inventory/0/field": { content: [true] } };
    const encoded = serializeCharacterJson(character, archive);
    const data = JSON.parse(encoded);
    expect(data).toMatchObject({
      schemaVersion: 1, ruleset: "dsa3-homebrew",
      charakter: {
        geld: { wInsg: 1020 },
        werte: { level: 7, Gesteigerte: 16, Steigerungspunkte: 294 },
      },
      magieSystem: { advancementPoints: 294 },
    });
    const result = parseCharacterJson(encoded);
    expect(result.character).toEqual(character);
    expect(result.legacy).toEqual(archive);
    expect(result.warnings).toHaveLength(1);
  });

  it("erfasst unbekannte Felder mit ihrem Ursprung und isoliert sie von Spielwerten", () => {
    const result = imported({
      charakter: {
        charakterInfo: { name: "Svala", notiz: "Karte" },
        fähigkeiten: {
          attribute: { Konstitution: 13, unbekannt: [4, 8] },
          Kampf_Talente: { "Einhand Schwerter": [1, 1, 2, "Zusatz"] },
        },
      },
      inventory: [{ name: "Buch", count: 3, material: "Leder" }],
      "weitere/Notizen": "Altes Feld",
    });
    expect(result.character.attributes.Konstitution).toBe(13);
    expect(result.legacy).toMatchObject({
      "/charakter/charakterInfo/notiz": "Karte",
      "/charakter/fähigkeiten/attribute/unbekannt": [4, 8],
      "/charakter/fähigkeiten/Kampf_Talente/Einhand Schwerter": [1, 1, 2, "Zusatz"],
      "/inventory/0/material": "Leder",
      "/weitere~1Notizen": "Altes Feld",
    });
    const restored = parseCharacterJson(serializeCharacterJson(result.character, result.legacy));
    expect(restored.legacy).toEqual(result.legacy);
  });

  it("importiert vollständige und leere separate Magiedateien", () => {
    const magic = imported({
      name: "Fen",
      level: 7,
      advancementPoints: 12,
      magic: [{ element: "Raumzeit", type: "Angriff", level: 4 }],
    });
    expect(magic.kind).toBe("magic");
    expect(magic.character.profile.name).toBe("Fen");
    expect(magic.character.experience).toEqual({ xp: 900, spent: 298, bonus: 0 });
    const encoded = serializeMagicJson(magic.character);
    expect(parseCharacterJson(encoded).character).toEqual(magic.character);
    expect(imported({ magic: [] }).character.magic).toEqual([]);
  });

  it("meldet ungültige Inhalte und unbekannte Versionen", () => {
    expect(() => parseCharacterJson("{")).toThrow(CharacterJsonError);
    expect(() => imported({ charakter: { fähigkeiten: { modifier: { asp: "NaN" } } } })).toThrow("/modifier/asp");
    expect(() => imported({ charakter: {}, schemaVersion: 99 })).toThrow(/Version/);
    expect(() => imported({ charakter: {}, schemaVersion: 1, ruleset: "foreign" })).toThrow(/Regelwerk/);
    expect(() => imported({ charakter: {}, inventory: [null] })).toThrow("/inventory/0");
    expect(() => imported({ magic: {} })).toThrow("/magic");
  });
});
