import type { DerivedValues } from "./derivedCalculations";

export type CombatTalents = Record<string, number[]>;

type BaseValues = Pick<DerivedValues, "attacke" | "parade" | "wurf" | "schuss">;

const toNumber = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0);

export const applyAutoSkillDistribution = (
  talents: CombatTalents,
  baseValues: BaseValues
): CombatTalents => {
  const next: CombatTalents = { ...talents };

  Object.entries(next).forEach(([name, values]) => {
    if (!Array.isArray(values) || values.length < 3) {
      return;
    }

    const skillValue = toNumber(values[2]);
    const half = Math.floor(skillValue / 2);
    const rest = skillValue % 2;

    const updated = [...values];

    if (name === "Schild") {
      updated[0] = 0;
      updated[1] = skillValue + baseValues.parade;
    } else if (name === "Wurfwaffen") {
      updated[0] = skillValue + baseValues.wurf;
      updated[1] = 0;
    } else if (name === "Bolzenwaffen" || name === "Pfeilwaffen") {
      updated[0] = skillValue + baseValues.schuss;
      updated[1] = 0;
    } else {
      updated[0] = half + rest + baseValues.attacke;
      updated[1] = half + baseValues.parade;
    }

    next[name] = updated;
  });

  return next;
};
