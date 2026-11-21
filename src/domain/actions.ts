import { getAdvancementCost, isSafePointAmount, planBulkAdvancement } from "./advancement";
import {
  calculateAvailablePoints, calculateCombatBases, calculateLevelFromXp, getAdvancementLimits, getMagicUpgradeCost,
} from "./calculations";
import { addInventory, buyItem, changeFunds, changeInventory, convertWallet, resetWallet } from "./commerce";
import type {
  ActionResult, AdvancementTarget, CharacterAction, CharacterState, CombatTalent, DerivedValues, MagicAbility,
} from "./types";

const pointError = "Dafür sind nicht genügend Steigerungspunkte verfügbar.";
const numberError = "Bitte eine gültige ganze Zahl eingeben.";

function withSpentPoints(state: CharacterState, cost: number): CharacterState["experience"] {
  return cost === 0 ? state.experience : { ...state.experience, spent: state.experience.spent + cost };
}

function spendPoints(state: CharacterState, cost: number, availablePoints?: number): ActionResult | undefined {
  if (!isSafePointAmount(state.experience.spent + cost)) {
    return { state, error: numberError };
  }
  if (cost > 0 && cost > (availablePoints ?? calculateAvailablePoints(state.experience))) {
    return { state, error: pointError };
  }
  return undefined;
}

function advance(
  state: CharacterState,
  target: AdvancementTarget,
  value: number,
  derived?: DerivedValues,
): ActionResult {
  const cost = getAdvancementCost(state, target, value);
  if (cost === undefined) {
    return { state, error: "Der Wert oder das Ziel der Steigerung ist ungültig." };
  }
  const level = derived?.level ?? calculateLevelFromXp(state.experience.xp);
  const limits = derived?.limits ?? getAdvancementLimits(level);
  const { min, max } = target.kind === "combatTalent" ? limits.talent : limits[target.kind];
  if (value < min || value > max) {
    return { state, error: "Erlaubter Bereich: " + min + " bis " + max + "." };
  }
  const availablePoints = derived?.availablePoints ?? calculateAvailablePoints(state.experience, level);
  const rejection = spendPoints(state, cost, availablePoints);
  if (rejection) {
    return rejection;
  }
  const experience = withSpentPoints(state, cost);
  switch (target.kind) {
    case "attribute":
      return value === state.attributes[target.id] ? { state } : {
        state: { ...state, experience, attributes: { ...state.attributes, [target.id]: value } },
      };
    case "modifier":
      return value === state.modifiers[target.id] ? { state } : {
        state: { ...state, experience, modifiers: { ...state.modifiers, [target.id]: value } },
      };
    case "talent": {
      const talents = state.talents.map((talent) =>
        talent.id === target.id && talent.value !== value ? { ...talent, value } : talent,
      );
      return talents.every((talent, index) => talent === state.talents[index])
        ? { state }
        : { state: { ...state, experience, talents } };
    }
    case "combatTalent": {
      const combatTalents = state.combatTalents.map((talent) =>
        talent.id === target.id && talent.value !== value ? { ...talent, value } : talent,
      );
      return combatTalents.every((talent, index) => talent === state.combatTalents[index])
        ? { state }
        : { state: { ...state, experience, combatTalents } };
    }
  }
}

type CombatBases = Pick<DerivedValues, "attacke" | "parade" | "wurf" | "schuss">;

export function distributeCombatTalent(talent: CombatTalent, bases: CombatBases): CombatTalent {
  const { value } = talent;
  let attack: number;
  let parry: number;
  switch (talent.kind) {
    case "shield":
      attack = 0;
      parry = bases.parade + value;
      break;
    case "throw":
      attack = bases.wurf + value;
      parry = 0;
      break;
    case "shoot":
      attack = bases.schuss + value;
      parry = 0;
      break;
    case "melee": {
      const attackShare = Math.sign(value) * Math.ceil(Math.abs(value) / 2);
      attack = bases.attacke + attackShare;
      parry = bases.parade + (value - attackShare);
      break;
    }
  }
  return attack === talent.attack && parry === talent.parry ? talent : { ...talent, attack, parry };
}

function addMagic(state: CharacterState, ability: MagicAbility): ActionResult {
  const element = ability.element.trim();
  const type = ability.type.trim();
  if (
    !ability.id || !element || !type ||
    !Number.isSafeInteger(ability.level) || ability.level < 1 || ability.level > 21 ||
    state.magic.some(({ id }) => id === ability.id)
  ) {
    return { state, error: "Magie benötigt ein Element, eine Magieart und eine Stufe von 1 bis 21." };
  }
  return { state: { ...state, magic: [...state.magic, { ...ability, element, type }] } };
}

function upgradeMagic(state: CharacterState, id: string, availablePoints?: number): ActionResult {
  const ability = state.magic.find((entry) => entry.id === id);
  const cost = ability ? getMagicUpgradeCost(ability.level, state.freeAdvancement) : undefined;
  if (cost === undefined) {
    return { state, error: "Diese Magie kann nicht weiter gesteigert werden." };
  }
  const rejection = spendPoints(state, cost, availablePoints);
  if (rejection) {
    return rejection;
  }
  const magic = state.magic.map((entry) => entry.id === id ? { ...entry, level: entry.level + 1 } : entry);
  return { state: { ...state, magic, experience: withSpentPoints(state, cost) } };
}

function toggleHidden<T>(list: T[], id: T, hide: boolean): T[] {
  const included = list.includes(id);
  if (hide === included) {
    return list;
  }
  return hide ? [...list, id] : list.filter((entry) => entry !== id);
}

export function applyCharacterAction(
  state: CharacterState,
  action: CharacterAction,
  selectDerived?: (state: CharacterState) => DerivedValues,
): ActionResult {
  switch (action.type) {
    case "set-profile":
      return action.value === state.profile[action.key] ? { state } : {
        state: { ...state, profile: { ...state.profile, [action.key]: action.value } },
      };
    case "set-xp":
      if (!Number.isSafeInteger(action.value) || action.value < 0) {
        return { state, error: "XP müssen eine nichtnegative ganze Zahl sein." };
      }
      return action.value === state.experience.xp ? { state } : {
        state: { ...state, experience: { ...state.experience, xp: action.value } },
      };
    case "grant-points": {
      const bonus = state.experience.bonus + action.amount;
      if (!isSafePointAmount(bonus) || !Number.isSafeInteger(action.amount) || action.amount <= 0) {
        return { state, error: "Bitte eine positive Anzahl an Bonuspunkten eingeben." };
      }
      return { state: { ...state, experience: { ...state.experience, bonus } } };
    }
    case "set-free-advancement":
      return action.value === state.freeAdvancement ? { state } : {
        state: { ...state, freeAdvancement: action.value },
      };
    case "set-resource":
      if (!Number.isSafeInteger(action.value)) {
        return { state, error: numberError };
      }
      return action.value === state.resources[action.key] ? { state } : {
        state: { ...state, resources: { ...state.resources, [action.key]: action.value } },
      };
    case "advance":
      return advance(state, action.target, action.value, selectDerived?.(state));
    case "bulk-advance": {
      const { preview, ...changes } = planBulkAdvancement(state, action.mode);
      if (!preview.canApply) {
        return { state, error: pointError };
      }
      return preview.changes === 0 ? { state } : {
        state: { ...state, ...changes, experience: withSpentPoints(state, preview.cost) },
      };
    }
    case "set-combat": {
      if (!Number.isSafeInteger(action.value)) {
        return { state, error: numberError };
      }
      const combatTalents = state.combatTalents.map((talent) =>
        talent.id === action.id && talent[action.field] !== action.value
          ? { ...talent, [action.field]: action.value }
          : talent,
      );
      return combatTalents.every((talent, index) => talent === state.combatTalents[index])
        ? { state }
        : { state: { ...state, combatTalents } };
    }
    case "auto-distribute": {
      const bases = selectDerived ? selectDerived(state) : calculateCombatBases(state.attributes);
      const combatTalents = state.combatTalents.map((talent) => distributeCombatTalent(talent, bases));
      return combatTalents.every((talent, index) => talent === state.combatTalents[index])
        ? { state }
        : { state: { ...state, combatTalents } };
    }
    case "add-magic":
      return addMagic(state, action.ability);
    case "upgrade-magic":
      return upgradeMagic(state, action.id, selectDerived?.(state).availablePoints);
    case "remove-magic": {
      const magic = state.magic.filter(({ id }) => id !== action.id);
      return magic.length === state.magic.length ? { state } : { state: { ...state, magic } };
    }
    case "hide-attribute":
    case "restore-attribute": {
      const attributes = toggleHidden(state.hidden.attributes, action.id, action.type === "hide-attribute");
      return attributes === state.hidden.attributes ? { state } : {
        state: { ...state, hidden: { ...state.hidden, attributes } },
      };
    }
    case "hide-talent":
    case "restore-talent": {
      const talents = toggleHidden(state.hidden.talents, action.id, action.type === "hide-talent");
      return talents === state.hidden.talents ? { state } : { state: { ...state, hidden: { ...state.hidden, talents } } };
    }
    case "change-funds":
      return changeFunds(state, action.currency, action.amount);
    case "convert-wallet":
      return convertWallet(state);
    case "reset-wallet":
      return resetWallet(state);
    case "buy-item":
      return buyItem(state, action.id, action.name, action.price, action.currency);
    case "add-inventory":
      return addInventory(state, action.item);
    case "change-inventory":
      return changeInventory(state, action.id, action.delta);
  }
}
