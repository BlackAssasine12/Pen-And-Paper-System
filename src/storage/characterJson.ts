import {
  attributeIds, calculateAvailablePoints, calculateLevelFromXp, calculateWalletTotal, createCharacter,
  createCharacterSelectors, currencies, currencyValues, minimumXpForLevel, modifierIds, talentGroups,
} from "../domain";
import type { AttributeId, CharacterState, DerivedValues, InventoryItem, MagicAbility, Wallet } from "../domain";
import {
  CharacterJsonError, fieldPath, LegacyArchive, list, nonemptyText, number, object, requiredObject, text,
} from "./jsonData";
import type { JsonObject, JsonValue } from "./jsonData";
import { readCombatTalents, readTalents, talentFields } from "./legacyTalents";

export { CharacterJsonError } from "./jsonData";
export type LegacyData = JsonObject;
export type CharacterJsonImport = {
  kind: "character" | "magic";
  character: CharacterState;
  legacy?: LegacyData;
  warnings: string[];
};

const schemaVersion = 1;
const ruleset = "dsa3-homebrew";
const infoPath = "/charakter/charakterInfo";
const skillsPath = "/charakter/fähigkeiten";
const specialPath = skillsPath + "/sonderwerte";
const walletPath = "/charakter/geld";
const magicPath = "/magieSystem";
const deriveForExport = createCharacterSelectors();

const specialKeys = [
  "Aktuelle LP", "AktuelleLP", "Maximale LP", "MaximaleLP", "Ausdauer", "Maximale Ausdauer",
  "MaximaleAusdauer", "Astralenergie", "Maximale Astralenergie", "MaximaleAstralenergie", "Magiebegabung",
  "Magieresistenz", "Giftresistenz", "Schnelligkeit",
];
const combatBases = ["Wurfwaffen Basiswert", "Schusswaffen Basiswert", "Attacke Basiswert", "Parade Basiswert"];
const keysFor = <T extends object>(value: T) => Object.keys(value) as Array<keyof T & string>;

function parseJson(source: string): JsonObject {
  let data: JsonValue;
  try {
    data = JSON.parse(source.replace(/^\uFEFF/, ""), (_key, value: unknown) => {
      if (typeof value === "number" && !Number.isFinite(value)) {
        throw new CharacterJsonError("Die JSON-Datei enthält eine Zahl außerhalb des darstellbaren Bereichs.");
      }
      return value;
    }) as JsonValue;
  } catch (error) {
    if (error instanceof CharacterJsonError) throw error;
    throw new CharacterJsonError("Die Datei enthält kein gültiges JSON.");
  }
  return requiredObject(data, "/");
}

function readProfile(
  data: JsonObject, profile: CharacterState["profile"], archive: LegacyArchive,
) {
  for (const key of keysFor(profile)) {
    const value = data[key];
    const path = fieldPath(infoPath, key);
    profile[key] = typeof value === "number" ? String(value) : text(value, path) ?? profile[key];
  }
  archive.preserveOtherFields(data, infoPath, Object.keys(profile));
}

function readNumbers<Key extends string>(
  data: JsonObject, target: Record<Key, number>, keys: readonly Key[], path: string, archive: LegacyArchive, lowercase = false,
) {
  const visited = new Set<Key>();
  for (const [key, value] of Object.entries(data)) {
    const known = keys.find((identifier) => identifier === key
      || (lowercase && key === identifier.toLocaleLowerCase("de") && !Object.hasOwn(data, identifier)));
    if (!known || visited.has(known)) {
      archive.preserve(fieldPath(path, key), value);
      continue;
    }
    visited.add(known);
    target[known] = number(value, fieldPath(path, key)) ?? target[known];
  }
}

function readWallet(data: JsonObject, wallet: Wallet, archive: LegacyArchive, warnings: string[]) {
  const total = number(data.wInsg, fieldPath(walletPath, "wInsg"));
  const knownDenominations = currencies.some((key) => Object.hasOwn(data, key));
  if (!knownDenominations && total !== undefined) {
    let remainder = total;
    for (const currency of currencies) {
      wallet[currency] = currency === "kreuzer" ? remainder : Math.trunc(remainder / currencyValues[currency]);
      remainder -= wallet[currency] * currencyValues[currency];
    }
  } else {
    for (const currency of currencies) wallet[currency] = number(data[currency], fieldPath(walletPath, currency)) ?? 0;
    if (total !== undefined && total !== calculateWalletTotal(wallet)) {
      warnings.push("Die Münzbestände wurden übernommen und die Geldsumme wurde daraus neu berechnet.");
    }
  }
  archive.preserveOtherFields(data, walletPath, [...currencies, "wInsg"]);
}

function readExperience(data: {
  xp?: number;
  storedLevel?: number;
  spent?: number;
  available?: number;
  magicAvailable?: number;
  bonus: number;
}, warnings: string[]): CharacterState["experience"] {
  let xp = data.xp ?? 0;
  if (data.xp === undefined && data.storedLevel !== undefined
      && Number.isSafeInteger(data.storedLevel) && data.storedLevel > 0) {
    xp = minimumXpForLevel(data.storedLevel);
    warnings.push("In der Datei stand nur die Stufe. Die Erfahrungspunkte wurden aus der Stufe hergeleitet.");
  }
  const level = calculateLevelFromXp(xp);
  if (data.storedLevel !== undefined && data.storedLevel !== level) {
    warnings.push(`Die Datei nennt Stufe ${data.storedLevel}. Aus ${xp} Erfahrungspunkten ergibt sich Stufe ${level}.`);
  }
  const pool = calculateAvailablePoints({ xp, spent: 0, bonus: 0 }, level);
  const available = data.available ?? data.magicAvailable ?? pool;
  const spent = data.spent === undefined ? pool - available + data.bonus : data.spent + data.bonus;
  const actualAvailable = pool + data.bonus - spent;
  if ((data.available !== undefined && data.available !== actualAvailable)
      || (data.magicAvailable !== undefined && data.magicAvailable !== actualAvailable)) {
    warnings.push(`Die Datei enthält widersprüchliche Steigerungspunkte. Es wurden ${actualAvailable} Punkte übernommen.`);
  }
  if (!Number.isFinite(xp) || !Number.isFinite(spent) || !Number.isFinite(actualAvailable)) {
    throw new CharacterJsonError("Die Erfahrung in der Datei liegt außerhalb des darstellbaren Bereichs.");
  }
  return { xp, spent, bonus: data.bonus };
}

function readEntries<T extends { id: string }>(
  value: JsonValue | undefined,
  path: string,
  prefix: string,
  read: (data: JsonObject, path: string, id: string) => T,
): T[] {
  const ids = new Set<string>();
  return (list(value, path) ?? []).map((entry, index) => {
    const itemPath = fieldPath(path, index);
    const data = requiredObject(entry, itemPath);
    const id = text(data.id, fieldPath(itemPath, "id")) || `import:${prefix}:${index}`;
    if (ids.has(id)) throw new CharacterJsonError(`Doppelte ID (${itemPath}).`);
    ids.add(id);
    return read(data, itemPath, id);
  });
}

function readInventory(value: JsonValue | undefined, archive: LegacyArchive): InventoryItem[] {
  return readEntries(value, "/inventory", "item", (data, path, id) => {
    const quantity = number(data.quantity, fieldPath(path, "quantity"));
    const count = number(data.count, fieldPath(path, "count"));
    if (quantity !== undefined && count !== undefined && quantity !== count) archive.preserve(fieldPath(path, "count"), count);
    archive.preserveOtherFields(data, path, ["id", "name", "quantity", "count"]);
    return { id, name: nonemptyText(data.name, fieldPath(path, "name")), quantity: quantity ?? count ?? 0 };
  });
}

function readMagic(value: JsonValue | undefined, path: string, archive: LegacyArchive): MagicAbility[] {
  return readEntries(value, path, "magic", (data, itemPath, id) => {
    archive.preserveOtherFields(data, itemPath, ["id", "element", "type", "level"]);
    return {
      id,
      element: nonemptyText(data.element, fieldPath(itemPath, "element")),
      type: nonemptyText(data.type, fieldPath(itemPath, "type")),
      level: number(data.level, fieldPath(itemPath, "level")) ?? 1,
    };
  });
}

function readHidden(data: JsonObject, archive: LegacyArchive): CharacterState["hidden"] {
  const path = "/metadata/hidden";
  const knownAttributes = new Set<string>(attributeIds);
  const attributes = (list(data.attributes, fieldPath(path, "attributes")) ?? [])
    .flatMap((value, index) => {
      if (typeof value === "string" && knownAttributes.has(value)) return [value as AttributeId];
      archive.preserve(fieldPath(fieldPath(path, "attributes"), index), value);
      return [];
    });
  const talents = (list(data.talents, fieldPath(path, "talents")) ?? [])
    .map((value, index) => nonemptyText(value, fieldPath(fieldPath(path, "talents"), index)));
  archive.preserveOtherFields(data, path, ["attributes", "talents"]);
  return { attributes, talents };
}

export function parseCharacterJson(source: string): CharacterJsonImport {
  const input = parseJson(source);
  const kind = Object.hasOwn(input, "charakter") ? "character"
    : Object.hasOwn(input, "magic") ? "magic" : undefined;
  if (!kind) throw new CharacterJsonError("Die Datei enthält weder einen Charakterbogen noch eine Magieliste.");
  if (input.schemaVersion !== undefined && input.schemaVersion !== schemaVersion) {
    throw new CharacterJsonError("Diese Version der JSON-Datei wird noch nicht unterstützt.");
  }
  if (input.ruleset !== undefined && input.ruleset !== ruleset) {
    throw new CharacterJsonError("Das Regelwerk dieser Datei wird noch nicht unterstützt.");
  }
  const legacy = input.schemaVersion === undefined;
  const path = "/metadata";
  const metadata = legacy ? {} : object(input.metadata, path);
  const archive = new LegacyArchive(object(metadata.legacy, fieldPath(path, "legacy")));
  const warnings: string[] = [];
  const character = createCharacter();
  const bonus = number(metadata.experienceBonus, fieldPath(path, "experienceBonus")) ?? 0;

  if (kind === "magic") {
    character.profile.name = text(input.name, "/name") ?? "";
    character.experience = readExperience({
      xp: number(input.xp, "/xp"), storedLevel: number(input.level, "/level"),
      spent: number(input.gesteigerte, "/gesteigerte"), magicAvailable: number(input.advancementPoints, "/advancementPoints"),
      bonus,
    }, warnings);
    character.magic = readMagic(input.magic, "/magic", archive);
    archive.preserveOtherFields(input, "", [
      "schemaVersion", "ruleset", ...(legacy ? [] : ["metadata"]), "name", "xp", "level", "gesteigerte", "advancementPoints", "magic",
    ]);
    archive.preserveOtherFields(metadata, path, ["legacy", "experienceBonus"]);
  } else {
    const saved = requiredObject(input.charakter, "/charakter");
    const skills = object(saved.fähigkeiten, skillsPath, legacy);
    const profile = object(saved.charakterInfo, infoPath, legacy);
    const valuesPath = "/charakter/werte";
    const experience = object(saved.werte, valuesPath, legacy);
    const magic = object(input.magieSystem, magicPath, legacy);
    const special = object(skills.sonderwerte, specialPath, legacy);
    readProfile(profile, character.profile, archive);
    character.experience = readExperience({
      xp: number(experience.xp, valuesPath + "/xp"),
      storedLevel: number(experience.level, valuesPath + "/level"),
      spent: number(experience.Gesteigerte, valuesPath + "/Gesteigerte"),
      available: number(experience.Steigerungspunkte, valuesPath + "/Steigerungspunkte"),
      magicAvailable: number(magic.advancementPoints, magicPath + "/advancementPoints"),
      bonus,
    }, warnings);
    const attributesPath = skillsPath + "/attribute";
    const modifiersPath = skillsPath + "/modifier";
    readNumbers(object(skills.attribute, attributesPath, legacy), character.attributes, attributeIds, attributesPath, archive, legacy);
    readNumbers(object(skills.modifier, modifiersPath, legacy), character.modifiers, modifierIds, modifiersPath, archive);
    character.resources = {
      lp: number(special["Aktuelle LP"] ?? special.AktuelleLP, specialPath + "/Aktuelle LP") ?? 0,
      endurance: number(special.Ausdauer, specialPath + "/Ausdauer") ?? 0,
      asp: number(special.Astralenergie, specialPath + "/Astralenergie") ?? 0,
    };
    if (Object.hasOwn(special, "Aktuelle LP") && Object.hasOwn(special, "AktuelleLP")) {
      archive.preserve(specialPath + "/AktuelleLP", special.AktuelleLP);
    }
    character.talents = readTalents(skills, character.talents, archive, legacy);
    character.combatTalents = readCombatTalents(skills, object(metadata.combat, path + "/combat"), character.combatTalents, archive, legacy);
    readWallet(object(saved.geld, walletPath, legacy), character.wallet, archive, warnings);
    character.inventory = readInventory(input.inventory, archive);
    character.magic = readMagic(magic.magicAbilities, magicPath + "/magicAbilities", archive);
    const oldMagicPath = "/charakter/Magische_Elemente";
    if (saved.Magische_Elemente !== undefined) {
      const oldMagic = object(saved.Magische_Elemente, oldMagicPath, legacy);
      archive.preserve(oldMagicPath, saved.Magische_Elemente);
      if (!character.magic.length) {
        character.magic = Object.entries(oldMagic).flatMap(([element, rawLevel], index) => {
          const level = number(rawLevel, fieldPath(oldMagicPath, element)) ?? 0;
          return level > 0 ? [{ id: `import:legacy-magic:${index}`, element, type: "Angriff", level }] : [];
        });
      }
    }
    character.hidden = readHidden(object(metadata.hidden, path + "/hidden"), archive);
    if (metadata.freeAdvancement !== undefined && typeof metadata.freeAdvancement !== "boolean") {
      throw new CharacterJsonError("Der Wert für kostenloses Steigern in der Datei ist ungültig.");
    }
    character.freeAdvancement = metadata.freeAdvancement ?? false;

    const basesPath = skillsPath + "/KampfBasiswerte";
    archive.preserveOtherFields(object(skills.KampfBasiswerte, basesPath, legacy), basesPath, combatBases);
    archive.preserveOtherFields(special, specialPath, specialKeys);
    archive.preserveOtherFields(skills, skillsPath, [
      "attribute", "modifier", "sonderwerte", "KampfBasiswerte", "Kampf_Talente", "Gespeicherte_Kampftalente", ...talentFields,
    ]);
    archive.preserveOtherFields(saved, "/charakter", ["charakterInfo", "werte", "fähigkeiten", "geld", "Magische_Elemente"]);
    archive.preserveOtherFields(experience, valuesPath, ["xp", "level", "Gesteigerte", "Steigerungspunkte"]);
    archive.preserveOtherFields(magic, magicPath, ["advancementPoints", "magicAbilities"]);
    archive.preserveOtherFields(metadata, path, ["legacy", "experienceBonus", "combat", "hidden", "freeAdvancement"]);
    archive.preserveOtherFields(input, "", [
      "schemaVersion", "ruleset", ...(legacy ? [] : ["metadata"]), "charakter", "inventory", "magieSystem",
    ]);
  }

  const extras = archive.snapshot();
  if (extras) warnings.push("Zusatzfelder aus der Datei bleiben beim vollständigen JSON-Export erhalten.");
  return { kind, character, legacy: extras, warnings };
}

export function serializeCharacterJson(
  character: CharacterState, legacy?: LegacyData, derived = deriveForExport(character),
): string {
  const { experience, attributes, modifiers, resources } = character;
  const grouped = Object.fromEntries(talentGroups.flatMap((group) => {
    const entries = character.talents.filter((talent) => talent.group === group);
    return entries.length ? [[group, entries.map((talent) => ({
      id: talent.id, Name: talent.name, Attribute: talent.attributes, Wert: talent.value,
    }))]] : [];
  }));
  return JSON.stringify({
    schemaVersion,
    ruleset,
    charakter: {
      charakterInfo: character.profile,
      werte: {
        level: derived.level, xp: experience.xp,
        Steigerungspunkte: derived.availablePoints, Gesteigerte: experience.spent - experience.bonus,
      },
      geld: { ...character.wallet, wInsg: derived.walletTotal },
      fähigkeiten: {
        modifier: modifiers,
        attribute: attributes,
        sonderwerte: {
          "Aktuelle LP": resources.lp, "Maximale LP": derived.lpMax,
          Ausdauer: resources.endurance, "Maximale Ausdauer": derived.ausdauerMax,
          Astralenergie: resources.asp, "Maximale Astralenergie": derived.maxAstralenergie,
          Magiebegabung: derived.magiebegabung, Magieresistenz: derived.magieresistenz,
          Giftresistenz: derived.giftresistenz, Schnelligkeit: derived.schnelligkeit,
        },
        KampfBasiswerte: {
          "Wurfwaffen Basiswert": derived.wurf, "Schusswaffen Basiswert": derived.schuss,
          "Attacke Basiswert": derived.attacke, "Parade Basiswert": derived.parade,
        },
        Kampf_Talente: Object.fromEntries(character.combatTalents.map(({ name, attack, parry, value }) => [name, [attack, parry, value]])),
        ...grouped,
      },
    },
    inventory: character.inventory,
    magieSystem: { advancementPoints: derived.availablePoints, magicAbilities: character.magic },
    metadata: {
      experienceBonus: experience.bonus,
      freeAdvancement: character.freeAdvancement,
      hidden: character.hidden,
      combat: Object.fromEntries(character.combatTalents.map(({ name, id, kind }) => [name, { id, kind }])),
      legacy,
    },
  }, null, 2);
}

export function serializeMagicJson(
  character: CharacterState, derived: Pick<DerivedValues, "level" | "availablePoints"> = deriveForExport(character),
): string {
  return JSON.stringify({
    schemaVersion, ruleset, name: character.profile.name, xp: character.experience.xp, level: derived.level,
    advancementPoints: derived.availablePoints, gesteigerte: character.experience.spent - character.experience.bonus,
    magic: character.magic,
    metadata: { experienceBonus: character.experience.bonus },
  }, null, 2);
}
