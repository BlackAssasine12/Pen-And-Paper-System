import defaultCatalog from "./catalog.json";
import { attributeIds, modifierIds } from "./types";
import type { CharacterState, CombatKind, Talent, TalentGroup, Wallet } from "./types";

export const classGroups: Readonly<Record<string, readonly string[]>> = defaultCatalog.classGroups;
export const raceGroups: Readonly<Record<string, readonly string[]>> = defaultCatalog.raceGroups;

export const magicElements = [
  "Feuer", "Wasser", "Erde", "Luft", "Natur", "Heilung", "Dunkle", "Helle", "Schatten", "Licht",
  "Holz", "Metall", "Eis", "Leben", "Nekromantie", "Blitz", "Blut", "Gravitation", "Erschaffung", "Raumzeit",
] as const;

export const magicTypes = [
  "Angriff", "Verteidigung", "Unterstützung", "Kontrolle", "Beschwörung", "Illusion", "Heilung",
] as const;

export const magicRequirements: Readonly<Partial<Record<(typeof magicElements)[number], string>>> = {
  Schatten: "Luft, Dunkle",
  Licht: "Helle, Feuer",
  Holz: "Erde, Wasser",
  Metall: "Erde, Feuer",
  Eis: "Luft, Wasser",
  Leben: "Heilung, Natur",
  Nekromantie: "Dunkle, Leben",
  Blitz: "Licht, Luft",
  Gravitation: "Erde, Luft",
  Erschaffung: "Feuer, Wasser, Erde, Luft, Natur, Dunkle, Helle",
  Raumzeit: "Alle Elemente",
  Blut: "Leben, Wasser",
};

export function getCombatKind(name: string): CombatKind {
  switch (name) {
    case "Schild":
      return "shield";
    case "Wurfwaffen":
      return "throw";
    case "Pfeilwaffen":
    case "Bolzenwaffen":
      return "shoot";
    default:
      return "melee";
  }
}

export const createEmptyWallet = (): Wallet => ({ dukaten: 0, silber: 0, heller: 0, kreuzer: 0 });

export function createCharacter(): CharacterState {
  const talents = Object.entries(defaultCatalog.talentGroups).flatMap(([group, entries]): Talent[] =>
    entries.map((entry, index) => ({
      ...entry,
      group: group as TalentGroup,
      id: group + ":" + index,
      value: 0,
    })),
  );

  return {
    profile: {
      name: "", alter: "", geschlecht: "", rasse: "", klasse: "", größe: "", gewicht: "",
      haarfarbe: "", augenfarbe: "", titel: "",
    },
    experience: { xp: 0, spent: 0, bonus: 0 },
    attributes: Object.fromEntries(attributeIds.map((key) => [key, 9])) as CharacterState["attributes"],
    modifiers: Object.fromEntries(modifierIds.map((key) => [key, 0])) as CharacterState["modifiers"],
    resources: { lp: 0, endurance: 0, asp: 0 },
    talents,
    combatTalents: defaultCatalog.combatNames.map((name, index) => ({
      id: "combat:" + index,
      name,
      kind: getCombatKind(name),
      attack: 0,
      parry: 0,
      value: 0,
    })),
    magic: [],
    wallet: createEmptyWallet(),
    inventory: [],
    hidden: { attributes: [], talents: [] },
    freeAdvancement: false,
  };
}
