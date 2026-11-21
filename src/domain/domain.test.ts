import { describe, expect, it } from "vitest";
import {
  applyCharacterAction, calculateLevelFromXp, createCharacter, createCharacterSelectors, getAdvancementCost,
  getMagicUpgradeCost, minimumXpForLevel, previewBulkAdvancement,
} from "./index";
import type { CharacterAction, CharacterState } from "./types";

const apply = (state: CharacterState, action: CharacterAction): CharacterState => {
  const result = applyCharacterAction(state, action);
  expect(result.error).toBeUndefined();
  return result.state;
};

const select = createCharacterSelectors();

describe("DSA-3-Hausregeln", () => {
  it.each([
    [0, 1], [149, 1], [150, 2], [749, 5], [750, 6], [899, 6], [900, 7], [1349, 7],
    [1350, 8], [4949, 13], [4950, 14], [6149, 14], [6150, 15],
  ])("berechnet %i XP als Stufe %i", (xp, level) => {
    expect(calculateLevelFromXp(xp)).toBe(level);
  });

  it("liefert die kleinste XP-Zahl für eine gespeicherte Stufe", () => {
    for (let level = 1; level <= 20; level += 1) {
      const xp = minimumXpForLevel(level);
      expect(calculateLevelFromXp(xp)).toBe(level);
      if (xp > 0) {
        expect(calculateLevelFromXp(xp - 1)).toBe(level - 1);
      }
    }
  });

  it("berechnet einen frischen Bogen und einen Referenzcharakter inklusive Rundung", () => {
    const state = createCharacter();
    expect(select(state)).toMatchObject({
      level: 1, availablePoints: 130, lpMax: 35, ausdauerMax: 44, magiebegabung: 0,
      maxAstralenergie: 6, magieresistenz: 3, giftresistenz: 4, wurf: 7, schuss: 7,
      attacke: 5, parade: 5, schnelligkeit: 7,
    });
    expect(select({
      ...state,
      experience: { xp: 900, spent: 46, bonus: 0 },
      attributes: {
        ...state.attributes,
        Konstitution: 13, Körperkraft: 14, Gewandheit: 11, Klugheit: 12, Intuition: 10,
        Fingerfertigkeit: 8, Willenskraft: 15, Sinnesschärfe: 7,
      },
      modifiers: { ...state.modifiers, lp: 2, asp: 3, magie: 4, gift: -1 },
      magic: [{ id: "magic-1", element: "Feuer", type: "Angriff", level: 5 }],
    })).toMatchObject({
      level: 7, availablePoints: 264, lpMax: 81, ausdauerMax: 96, magiebegabung: 9,
      maxAstralenergie: 57, magieresistenz: 9, giftresistenz: 9, wurf: 8, schuss: 8,
      attacke: 8, parade: 7, schnelligkeit: 8,
    });
  });

  it("berechnet nur die von einer Änderung betroffenen Ausgaben", () => {
    const keyCalls: string[] = [];
    const read = createCharacterSelectors((key) => keyCalls.push(key));
    const initial = createCharacter();
    const first = read(initial);
    keyCalls.length = 0;
    const renamed = apply(initial, { type: "set-profile", key: "name", value: "Unser Held" });
    expect(read(renamed)).toBe(first);
    expect(read(apply(renamed, { type: "set-resource", key: "lp", value: 12 }))).toBe(first);
    expect(read(apply(renamed, { type: "add-inventory", item: { id: "rope", name: "Seil", quantity: 1 } }))).toBe(first);
    expect(keyCalls).toEqual([]);

    const lpChanged = apply(renamed, { type: "advance", target: { kind: "modifier", id: "lp" }, value: 1 });
    expect(read(lpChanged).lpMax).toBe(first.lpMax + 3);
    expect(keyCalls).toEqual(["lpMax", "ausdauerMax", "availablePoints", "giftresistenz"]);

    keyCalls.length = 0;
    const addedMagic = apply(lpChanged, {
      type: "add-magic", ability: { id: "fire", element: "Feuer", type: "Angriff", level: 2 },
    });
    expect(read(addedMagic).magiebegabung).toBe(2);
    expect(keyCalls).toEqual(["magicSum", "magiebegabung", "maxAstralenergie", "magieresistenz"]);

    keyCalls.length = 0;
    const funded = apply(addedMagic, { type: "change-funds", currency: "heller", amount: 5 });
    expect(read(funded).walletTotal).toBe(50);
    expect(keyCalls).toEqual(["walletTotal"]);
  });
});

describe("Änderungen am Charakter", () => {
  it("bucht genau einmal, erstattet Reduzierungen und belastet keine alten Werte beim Klassenwechsel", () => {
    const target = { kind: "attribute", id: "Körperkraft" } as const;
    const melee = apply(createCharacter(), { type: "set-profile", key: "klasse", value: "Ritter" });
    const raised = apply(melee, { type: "advance", target, value: 10 });
    expect(raised.experience.spent).toBe(3);
    expect(raised.attributes.Körperkraft).toBe(10);
    expect(raised.resources).toBe(melee.resources);
    expect(apply(raised, { type: "advance", target, value: 10 })).toBe(raised);
    const refunded = apply(raised, { type: "advance", target, value: 9 });
    expect(refunded.experience.spent).toBe(0);
    const newClass = apply(raised, { type: "set-profile", key: "klasse", value: "Handwerker" });
    expect(newClass.experience).toBe(raised.experience);
    expect(getAdvancementCost(newClass, target, 11)).toBe(4);
    expect(select(apply(raised, { type: "set-xp", value: 150 })).availablePoints).toBe(157);
  });

  it("verwendet Klassentarife separat für Modifikatoren, Handwerk und andere Talente", () => {
    const initial = createCharacter();
    const mage = apply(initial, { type: "set-profile", key: "klasse", value: "Elementarmagier" });
    expect(getAdvancementCost(mage, { kind: "modifier", id: "magie" }, 2)).toBe(6);
    expect(getAdvancementCost(mage, { kind: "modifier", id: "asp" }, 2)).toBe(10);
    const worker = apply(initial, { type: "set-profile", key: "klasse", value: "Handwerker" });
    const toolSkill = worker.talents.find(({ group }) => group === "Handwerkstalente")!;
    expect(getAdvancementCost(worker, { kind: "talent", id: toolSkill.id }, 3)).toBe(6);
    const combatSkill = worker.combatTalents[0];
    expect(getAdvancementCost(worker, { kind: "combatTalent", id: combatSkill.id }, 3)).toBe(15);
  });

  it("prüft Grenzen und Guthaben atomar und bietet kostenloses Steigern bewusst an", () => {
    const initial = createCharacter();
    const poor = { ...initial, experience: { ...initial.experience, spent: 129 } };
    const advance = { type: "advance", target: { kind: "attribute", id: "Körperkraft" }, value: 10 } as const;
    expect(applyCharacterAction(poor, advance)).toMatchObject({ state: poor, error: expect.any(String) });
    const free = apply(poor, { type: "set-free-advancement", value: true });
    const raised = apply(free, advance);
    expect(raised.attributes.Körperkraft).toBe(10);
    expect(raised.experience.spent).toBe(129);
    expect(applyCharacterAction(free, { ...advance, value: 14 })).toMatchObject({
      state: free, error: expect.any(String),
    });
    expect(select(apply(raised, { type: "grant-points", amount: 4 })).availablePoints).toBe(5);
  });

  it("zeigt die Kosten von Min/Max und wendet nur die bestätigte gesamte Änderung an", () => {
    const initial = createCharacter();
    expect(previewBulkAdvancement(initial, "max")).toMatchObject({ canApply: false, changes: expect.any(Number) });
    expect(applyCharacterAction(initial, { type: "bulk-advance", mode: "max" }).state).toBe(initial);
    const preview = previewBulkAdvancement(initial, "min");
    const setToMinimum = apply(initial, { type: "bulk-advance", mode: "min" });
    expect(preview.canApply).toBe(true);
    expect(setToMinimum.experience.spent).toBe(preview.cost);
    expect(select(setToMinimum).availablePoints).toBe(preview.availablePoints);
    expect(setToMinimum.attributes.Konstitution).toBe(7);
    expect(setToMinimum.combatTalents[0]).toMatchObject({ attack: 0, parry: 0, value: -3 });
    expect(setToMinimum.magic).toBe(initial.magic);
  });

  it("behält manuelle Kampfwerte bis zum Verteilen und teilt ungerade positive und negative Werte auf", () => {
    const initial = createCharacter();
    const [sword, secondSword, shield] = initial.combatTalents;
    let state = apply(initial, { type: "set-combat", id: sword.id, field: "attack", value: 44 });
    state = apply(state, { type: "advance", target: { kind: "combatTalent", id: sword.id }, value: -3 });
    state = apply(state, { type: "advance", target: { kind: "combatTalent", id: secondSword.id }, value: 3 });
    state = apply(state, { type: "advance", target: { kind: "combatTalent", id: shield.id }, value: 2 });
    expect(state.combatTalents[0].attack).toBe(44);
    const distributed = apply(state, { type: "auto-distribute" });
    expect(distributed.combatTalents[0]).toMatchObject({ attack: 3, parry: 4, value: -3 });
    expect(distributed.combatTalents[1]).toMatchObject({ attack: 7, parry: 6, value: 3 });
    expect(distributed.combatTalents[2]).toMatchObject({ attack: 0, parry: 7 });
    expect(distributed.combatTalents.find(({ kind }) => kind === "throw")).toMatchObject({ attack: 7, parry: 0 });
    expect(distributed.combatTalents.find(({ kind }) => kind === "shoot")).toMatchObject({ attack: 7, parry: 0 });
    expect(distributed.experience).toBe(state.experience);
    expect(apply(distributed, { type: "auto-distribute" })).toBe(distributed);
  });

  it("verwendet das gleiche Guthaben und die eigene Tabelle für Magie", () => {
    const initial = createCharacter();
    const state = apply(initial, {
      type: "add-magic", ability: { id: "custom", element: "Nebelsang", type: "Unterstützung", level: 20 },
    });
    expect(state.experience).toBe(initial.experience);
    expect(getMagicUpgradeCost(1)).toBe(2);
    expect(getMagicUpgradeCost(20)).toBe(82);
    expect(getMagicUpgradeCost(21)).toBeUndefined();
    expect(getMagicUpgradeCost(20, true)).toBe(0);
    expect(getMagicUpgradeCost(21, true)).toBeUndefined();
    const upgraded = apply(state, { type: "upgrade-magic", id: "custom" });
    expect(upgraded.magic[0].level).toBe(21);
    expect(select(upgraded).availablePoints).toBe(48);
    expect(applyCharacterAction(upgraded, { type: "upgrade-magic", id: "custom" }).state).toBe(upgraded);
    const removed = apply(upgraded, { type: "remove-magic", id: "custom" });
    expect(removed.experience).toBe(upgraded.experience);
    expect(select(removed).magiebegabung).toBe(0);

    const poor = { ...state, experience: { ...state.experience, spent: 130 } };
    expect(applyCharacterAction(poor, { type: "upgrade-magic", id: "custom" }).state).toBe(poor);
    const free = apply(poor, { type: "set-free-advancement", value: true });
    const upgradeWithoutCharge = apply(free, { type: "upgrade-magic", id: "custom" });
    expect(upgradeWithoutCharge.magic[0].level).toBe(21);
    expect(upgradeWithoutCharge.experience).toBe(free.experience);
  });

  it("zieht Käufe in Kreuzern umgerechnet ab und ändert gleichzeitig das Inventar", () => {
    const initial = apply(createCharacter(), { type: "change-funds", currency: "dukaten", amount: 1 });
    const buy = { type: "buy-item", id: "rope", name: "Seil", price: 2.54, currency: "silber" } as const;
    const purchased = apply(initial, buy);
    expect(purchased.wallet).toEqual({ dukaten: 0, silber: 7, heller: 4, kreuzer: 6 });
    expect(purchased.inventory).toEqual([{ id: "rope", name: "Seil", quantity: 1 }]);
    const twice = apply(purchased, buy);
    expect(twice.inventory[0].quantity).toBe(2);
    expect(select(twice).walletTotal).toBe(492);
    const rejected = applyCharacterAction(twice, { ...buy, price: 10 });
    expect(rejected.state).toBe(twice);
    expect(rejected.error).toBeTruthy();
    expect(apply(twice, { type: "change-inventory", id: "rope", delta: -2 }).inventory).toEqual([]);
  });
});
