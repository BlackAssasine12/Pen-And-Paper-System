import { classGroups } from "./catalogs";
import { calculateAvailablePoints, calculateLevelFromXp, getAdvancementLimits } from "./calculations";
import { attributeIds, modifierIds } from "./types";
import type {
  AdvancementTarget, AttributeId, BulkAdvancementPreview, BulkMode, CharacterState, ModifierId, TalentGroup,
} from "./types";

interface CostOverrides {
  attribute?: number;
  attributes?: Partial<Record<AttributeId, number>>;
  modifiers?: Partial<Record<ModifierId, number>>;
  talents?: Partial<Record<TalentGroup, number>>;
}

const overridesByCategory: Readonly<Record<string, CostOverrides>> = {
  "Magische Klassen": { modifiers: { magie: 3, asp: 5 } },
  "Nahkampf Basierte Klassen": { attributes: { Körperkraft: 3 }, modifiers: { nahkampf: 3, lp: 5 } },
  "Fernkampf Basierte Klassen": { modifiers: { fernkampf: 3, stealth: 5 } },
  "Wissenschaftliche Klassen": { attributes: { Klugheit: 3 }, talents: { Wissenschaftliche_Talente: 2 } },
  Arbeiterklassen: { attribute: 4, talents: { Handwerkstalente: 2 } },
  "Halbmagische Klassen": { modifiers: { magie: 8, asp: 8, nahkampf: 8, fernkampf: 8, lp: 8 } },
  "Stealth Klassen": { modifiers: { stealth: 3, nahkampf: 8, fernkampf: 8, gift: 8 }, talents: { Assassinen_Talente: 1 } },
  Spezialklassen: { modifiers: { magie: 8, asp: 8, nahkampf: 8, fernkampf: 8, lp: 8 } },
};

function getCostOverrides(characterClass: string): CostOverrides {
  const category = Object.entries(classGroups).find(([, members]) => members.includes(characterClass))?.[0];
  return category ? overridesByCategory[category] ?? {} : {};
}

const attributeRate = (rates: CostOverrides, id: AttributeId) => rates.attributes?.[id] ?? rates.attribute ?? 5;
const modifierRate = (rates: CostOverrides, id: ModifierId) => rates.modifiers?.[id] ?? 10;
const talentRate = (rates: CostOverrides, group: TalentGroup) => rates.talents?.[group] ?? 3;
const combatTalentRate = 5;

export const isSafePointAmount = (value: number) => Math.abs(value) <= Number.MAX_SAFE_INTEGER;

export function getAdvancementCost(
  state: CharacterState,
  target: AdvancementTarget,
  value: number,
): number | undefined {
  if (!Number.isSafeInteger(value)) {
    return undefined;
  }
  const rates = getCostOverrides(state.profile.klasse);
  const quote = (current: number, rate: number) => state.freeAdvancement ? 0 : (value - current) * rate;
  switch (target.kind) {
    case "attribute":
      return quote(state.attributes[target.id], attributeRate(rates, target.id));
    case "modifier":
      return quote(state.modifiers[target.id], modifierRate(rates, target.id));
    case "talent": {
      const talent = state.talents.find(({ id }) => id === target.id);
      return talent && quote(talent.value, talentRate(rates, talent.group));
    }
    case "combatTalent": {
      const talent = state.combatTalents.find(({ id }) => id === target.id);
      return talent && quote(talent.value, combatTalentRate);
    }
  }
}

export function planBulkAdvancement(state: CharacterState, mode: BulkMode) {
  const { experience } = state;
  const level = calculateLevelFromXp(experience.xp);
  const limits = getAdvancementLimits(level);
  const rates = getCostOverrides(state.profile.klasse);
  let cost = 0;
  let changes = 0;

  const change = (value: number, next: number, rate: number): number => {
    if (value !== next) {
      changes += 1;
      if (!state.freeAdvancement) {
        cost += (next - value) * rate;
      }
    }
    return next;
  };

  const attributes = { ...state.attributes };
  for (const id of attributeIds) {
    attributes[id] = change(attributes[id], limits.attribute[mode], attributeRate(rates, id));
  }
  const modifiers = { ...state.modifiers };
  for (const id of modifierIds) {
    modifiers[id] = change(modifiers[id], limits.modifier[mode], modifierRate(rates, id));
  }
  const setTalentValue = <T extends { value: number }>(talent: T, rate: number): T => {
    const value = change(talent.value, limits.talent[mode], rate);
    return value === talent.value ? talent : { ...talent, value };
  };
  const talents = state.talents.map((talent) => setTalentValue(talent, talentRate(rates, talent.group)));
  const combatTalents = state.combatTalents.map((talent) => setTalentValue(talent, combatTalentRate));
  const currentPoints = calculateAvailablePoints(experience, level);
  const canApply = isSafePointAmount(experience.spent + cost) && (cost <= 0 || cost <= currentPoints);
  const preview: BulkAdvancementPreview = { cost, changes, availablePoints: currentPoints - cost, canApply };

  return { attributes, modifiers, talents, combatTalents, preview };
}

export function previewBulkAdvancement(state: CharacterState, mode: BulkMode): BulkAdvancementPreview {
  return planBulkAdvancement(state, mode).preview;
}
