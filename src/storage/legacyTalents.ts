import { getCombatKind, talentGroups } from "../domain";
import type { CombatKind, CombatTalent, Talent, TalentGroup } from "../domain";
import {
  CharacterJsonError, fieldPath, isObject, nonemptyText, number, object, requiredObject, text,
} from "./jsonData";
import type { JsonObject, JsonValue, LegacyArchive } from "./jsonData";

const combatPath = "/charakter/fähigkeiten/Kampf_Talente";
const savedCombatPath = "/charakter/fähigkeiten/Gespeicherte_Kampftalente";
const groupAliases = {
  Assasssinen_Talente: "Assassinen_Talente",
  talente: "Normale_Talente",
  dsaTalente: "Normale_Talente",
} as const;
export const talentFields = [...talentGroups, ...Object.keys(groupAliases)];

const combatAliases = new Map([
  ["Messer/Doche", "Messer/Dolche"],
  ["Flexiblen Nahkampfwaffen", "Flexible Nahkampfwaffen"],
  ["Bolzwaffen", "Bolzenwaffen"],
]);
const combatKinds = new Set<CombatKind>(["melee", "shield", "throw", "shoot"]);
const normalizedName = (name: string) => name.normalize("NFC").toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]/gu, "");

function findCatalogTalent(catalog: Talent[], name: string, group: TalentGroup) {
  const matches = catalog.filter((talent) => normalizedName(talent.name) === normalizedName(name));
  return matches.find((talent) => talent.group === group) ?? matches[0];
}

type ImportedTalent = Pick<Talent, "name" | "attributes" | "value"> & { id?: string };

function readTalent(value: JsonValue, path: string, archive: LegacyArchive): ImportedTalent {
  const data = requiredObject(value, path);
  archive.preserveOtherFields(data, path, ["id", "Name", "Attribute", "Wert"]);
  return {
    id: text(data.id, fieldPath(path, "id")),
    name: nonemptyText(data.Name, fieldPath(path, "Name")),
    attributes: text(data.Attribute, fieldPath(path, "Attribute")) ?? "",
    value: number(data.Wert, fieldPath(path, "Wert")) ?? 0,
  };
}

function readTalentMap(data: JsonObject, path: string): ImportedTalent[] {
  return Object.entries(data).map(([key, value]) => {
    const description = /^(.+?)\s+\(([^()]*\/[^()]*)\)$/.exec(key);
    return {
      name: description?.[1] ?? key,
      attributes: description?.[2] ?? "",
      value: number(value, fieldPath(path, key)) ?? 0,
    };
  });
}

export function readTalents(
  data: JsonObject, catalog: Talent[], archive: LegacyArchive, legacy: boolean,
): Talent[] {
  const talents = new Map((legacy ? catalog : []).map((talent) => [talent.id, talent]));
  const imported = new Set<string>();
  for (const sourceGroup of talentFields) {
    const source = data[sourceGroup];
    if (source === undefined) continue;

    const group = Object.hasOwn(groupAliases, sourceGroup)
      ? groupAliases[sourceGroup as keyof typeof groupAliases]
      : sourceGroup as TalentGroup;
    const path = fieldPath("/charakter/fähigkeiten", sourceGroup);
    const entries = Array.isArray(source) && !(legacy && source.length === 1 && isObject(source[0])
      && !Object.hasOwn(source[0], "Name"))
      ? source.map((entry, index) => readTalent(entry, fieldPath(path, index), archive))
      : readTalentMap(object(source, path, legacy), path);

    entries.forEach((entry, index) => {
      const match = legacy ? findCatalogTalent(catalog, entry.name, group) : undefined;
      const useMatch = match && !imported.has(match.id);
      const id = entry.id || (useMatch ? match.id : `import:${sourceGroup}:${index}`);
      if (imported.has(id)) throw new CharacterJsonError(`Doppelte Talent-ID (${path}).`);
      imported.add(id);
      talents.set(id, {
        id,
        name: useMatch ? match.name : entry.name,
        attributes: entry.attributes || (useMatch ? match.attributes : ""),
        group: useMatch ? match.group : group,
        value: entry.value,
      });
    });
  }
  return Array.from(talents.values());
}

function readCombatValue(
  value: JsonValue, path: string, archive: LegacyArchive,
): Pick<CombatTalent, "attack" | "parry" | "value"> {
  if (!Array.isArray(value)) return { attack: 0, parry: 0, value: number(value, path) ?? 0 };
  if (value.length > 3) archive.preserve(path, value);
  return {
    attack: number(value[0], fieldPath(path, 0)) ?? 0,
    parry: number(value[1], fieldPath(path, 1)) ?? 0,
    value: number(value[2], fieldPath(path, 2)) ?? 0,
  };
}

export function readCombatTalents(
  data: JsonObject,
  info: JsonObject,
  catalog: CombatTalent[],
  archive: LegacyArchive,
  legacy: boolean,
): CombatTalent[] {
  const current = object(data.Kampf_Talente, combatPath, legacy);
  const saved = object(data.Gespeicherte_Kampftalente, savedCombatPath, legacy);
  if (data.Gespeicherte_Kampftalente !== undefined) archive.preserve(savedCombatPath, data.Gespeicherte_Kampftalente);
  const savedByName = new Map(Object.entries(saved).map(([name, value]) => {
    const path = fieldPath(savedCombatPath, name);
    return [combatAliases.get(name) ?? name, readCombatValue(value, path, archive)];
  }));

  const talents = new Map((legacy ? catalog : []).map((talent) => [talent.id, talent]));
  const imported = new Set<string>();
  for (const [index, [sourceName, value]] of Object.entries(current).entries()) {
    const path = fieldPath(combatPath, sourceName);
    const alias = legacy ? combatAliases.get(sourceName) : undefined;
    const name = alias && !Object.hasOwn(current, alias) ? alias : sourceName;
    const metadataPath = fieldPath("/metadata/combat", sourceName);
    const metadata = object(Object.hasOwn(info, sourceName) ? info[sourceName] : undefined, metadataPath);
    archive.preserveOtherFields(metadata, metadataPath, ["id", "kind"]);
    const kind = text(metadata.kind, fieldPath(metadataPath, "kind")) ?? getCombatKind(alias ?? name);
    if (!combatKinds.has(kind as CombatKind)) throw new CharacterJsonError(`Unbekannte Kampfart (${metadataPath}).`);
    const match = legacy ? catalog.find((talent) => talent.name === name && !imported.has(talent.id)) : undefined;
    const id = text(metadata.id, fieldPath(metadataPath, "id")) || match?.id || `import:combat:${index}`;
    if (imported.has(id)) throw new CharacterJsonError(`Doppelte Kampftalent-ID (${path}).`);
    imported.add(id);
    const values = readCombatValue(value, path, archive);
    const savedValues = savedByName.get(name);
    if (!Array.isArray(value) && savedValues) {
      values.attack = savedValues.attack;
      values.parry = savedValues.parry;
    }
    talents.set(id, { id, name: match?.name ?? sourceName, kind: kind as CombatKind, ...values });
    savedByName.delete(name);
  }

  for (const [name, value] of savedByName) {
    const target = catalog.find((talent) => talent.name === name);
    const id = target?.id ?? `import:combat:saved:${name}`;
    talents.set(id, { id, name, kind: getCombatKind(name), ...value });
  }

  archive.preserveOtherFields(info, "/metadata/combat", Object.keys(current));
  return Array.from(talents.values());
}
