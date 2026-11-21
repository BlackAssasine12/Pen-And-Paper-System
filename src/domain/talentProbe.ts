import type { AttributeId, CharacterState, Talent } from "./types";

const probeAttributes: Readonly<Record<string, AttributeId>> = {
  CH: "Charisma",
  IN: "Intuition",
  GES: "Geschicklichkeit",
  TAR: "Tarnung",
  SIN: "Sinnesschärfe",
  KL: "Klugheit",
  KO: "Konstitution",
  GEW: "Gewandheit",
  GESCH: "Geschicklichkeit",
  GE: "Gewandheit",
  FF: "Fingerfertigkeit",
  KK: "Körperkraft",
  WK: "Willenskraft",
  WIL: "Willenskraft",
};

export function rollDie(sides: number, random = Math.random): number {
  return 1 + Math.floor(random() * sides);
}

export function rollTalentProbe(talent: Talent, attributes: CharacterState["attributes"], random = Math.random) {
  const codes = talent.attributes.split("/").map((code) => code.trim().toLocaleUpperCase("de-DE"));
  return {
    name: talent.name,
    talentValue: talent.value,
    rolls: Array.from({ length: 3 }, (_, index) => {
      const code = codes[index] || "–";
      const label = probeAttributes[code];
      return { code, label, threshold: label ? attributes[label] : undefined, roll: rollDie(20, random) };
    }),
  };
}
