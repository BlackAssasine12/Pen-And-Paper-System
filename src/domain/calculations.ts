import { currencies } from "./types";
import type { AdvancementLimits, CharacterState, Currency, DerivedValues, Experience, Wallet } from "./types";

export function calculateLevelFromXp(xp: number): number {
  if (xp < 900) {
    return Math.floor(xp / 150) + 1;
  }
  if (xp < 4950) {
    return Math.floor((xp - 750) / 600) + 7;
  }
  return Math.floor((xp - 4950) / 1200) + 14;
}

export function minimumXpForLevel(level: number): number {
  if (level <= 6) {
    return Math.max(0, (level - 1) * 150);
  }
  if (level === 7) {
    return 900;
  }
  if (level < 14) {
    return 750 + (level - 7) * 600;
  }
  return 4950 + (level - 14) * 1200;
}

const calculatePointBalance = (level: number, spent: number, bonus: number) =>
  level * 30 + 100 + bonus - spent;

export const calculateAvailablePoints = (experience: Experience, level = calculateLevelFromXp(experience.xp)) =>
  calculatePointBalance(level, experience.spent, experience.bonus);

export const getAdvancementLimits = (level: number): AdvancementLimits => ({
  attribute: { min: 7, max: Math.min(level + 12, 21) },
  modifier: { min: 0, max: level + 2 },
  talent: { min: -3, max: Math.min(level + 10, 21) },
});

export const currencyValues: Readonly<Record<Currency, number>> = {
  dukaten: 1000,
  silber: 100,
  heller: 10,
  kreuzer: 1,
};

export const calculateWalletTotal = (wallet: Wallet) =>
  currencies.reduce((total, currency) => total + wallet[currency] * currencyValues[currency], 0);

const calculateRangedBase = (intuition: number, dexterity: number, strength: number) =>
  Math.round((intuition + dexterity + strength) / 4);

const calculateMeleeBase = (characteristic: number, agility: number, strength: number) =>
  Math.round((characteristic + agility + strength) / 5);

export function calculateCombatBases(attributes: CharacterState["attributes"]) {
  const ranged = calculateRangedBase(attributes.Intuition, attributes.Fingerfertigkeit, attributes.Körperkraft);
  return {
    attacke: calculateMeleeBase(attributes.Konstitution, attributes.Gewandheit, attributes.Körperkraft),
    parade: calculateMeleeBase(attributes.Intuition, attributes.Gewandheit, attributes.Körperkraft),
    wurf: ranged,
    schuss: ranged,
  };
}

type CalculationKey = keyof DerivedValues | "magicSum";

export function createCharacterSelectors(onCompute?: (key: CalculationKey) => void) {
  function memo<Args extends unknown[], Value>(key: CalculationKey, calculate: (...args: Args) => Value) {
    let previousArgs: Args | undefined;
    let previousValue: Value;
    return (...args: Args): Value => {
      if (!previousArgs || args.some((arg, index) => !Object.is(arg, previousArgs?.[index]))) {
        previousValue = calculate(...args);
        previousArgs = args;
        onCompute?.(key);
      }
      return previousValue;
    };
  }

  const levelAt = memo("level", calculateLevelFromXp);
  const pointsAt = memo("availablePoints", calculatePointBalance);
  const limitsAt = memo("limits", getAdvancementLimits);
  const lpAt = memo("lpMax", (modifier: number, level: number, constitution: number) =>
    modifier * 3 + level * 6 + 20 + constitution,
  );
  const enduranceAt = memo("ausdauerMax", (lp: number, willpower: number) => lp + willpower);
  const magicSumAt = memo("magicSum", (abilities: CharacterState["magic"]) =>
    abilities.reduce((sum, ability) => sum + ability.level, 0),
  );
  const magicAt = memo("magiebegabung", (sum: number, modifier: number) => sum + modifier);
  const aspAt = memo("maxAstralenergie", (level: number, modifier: number, magic: number) =>
    level * 6 + modifier * 2 + magic,
  );
  const magicResistanceAt = memo("magieresistenz", (magic: number, level: number, intelligence: number) =>
    Math.round((magic + level + intelligence) / 3),
  );
  const poisonResistanceAt = memo("giftresistenz", (endurance: number, modifier: number) =>
    Math.round(endurance / 10 + modifier),
  );
  const rangedAt = memo("wurf", calculateRangedBase);
  const attackAt = memo("attacke", calculateMeleeBase);
  const parryAt = memo("parade", calculateMeleeBase);
  const speedAt = memo("schnelligkeit", (strength: number, agility: number, perception: number) =>
    Math.round((strength + agility + perception) / 4),
  );
  const walletTotalAt = memo("walletTotal", calculateWalletTotal);
  let previousState: CharacterState | undefined;
  let previousValues: DerivedValues | undefined;

  return (state: CharacterState): DerivedValues => {
    const { attributes, modifiers, experience, magic, wallet } = state;
    if (previousValues && previousState &&
      previousState.attributes === attributes && previousState.modifiers === modifiers &&
      previousState.experience === experience && previousState.magic === magic && previousState.wallet === wallet
    ) {
      return previousValues;
    }
    previousState = state;
    const level = levelAt(experience.xp);
    const lpMax = lpAt(modifiers.lp, level, attributes.Konstitution);
    const ausdauerMax = enduranceAt(lpMax, attributes.Willenskraft);
    const magiebegabung = magicAt(magicSumAt(magic), modifiers.magie);
    const ranged = rangedAt(attributes.Intuition, attributes.Fingerfertigkeit, attributes.Körperkraft);
    const nextValues: DerivedValues = {
      level,
      availablePoints: pointsAt(level, experience.spent, experience.bonus),
      lpMax,
      ausdauerMax,
      magiebegabung,
      maxAstralenergie: aspAt(level, modifiers.asp, magiebegabung),
      magieresistenz: magicResistanceAt(magiebegabung, level, attributes.Klugheit),
      giftresistenz: poisonResistanceAt(ausdauerMax, modifiers.gift),
      wurf: ranged,
      schuss: ranged,
      attacke: attackAt(attributes.Konstitution, attributes.Gewandheit, attributes.Körperkraft),
      parade: parryAt(attributes.Intuition, attributes.Gewandheit, attributes.Körperkraft),
      schnelligkeit: speedAt(attributes.Körperkraft, attributes.Gewandheit, attributes.Sinnesschärfe),
      walletTotal: walletTotalAt(wallet),
      limits: limitsAt(level),
    };

    // Keep selector identity when input changes leave every displayed value intact.
    if (!previousValues || (Object.keys(nextValues) as Array<keyof DerivedValues>).some(
      (key) => !Object.is(nextValues[key], previousValues?.[key]),
    )) {
      previousValues = nextValues;
    }
    return previousValues;
  };
}

const magicLevelCosts = [0, 2, 4, 6, 9, 12, 15, 18, 22, 26, 30, 34, 38, 43, 48, 53, 58, 64, 70, 76, 82];

export function getMagicUpgradeCost(level: number, freeAdvancement = false): number | undefined {
  const cost = level >= 1 ? magicLevelCosts[level] : undefined;
  return cost !== undefined && freeAdvancement ? 0 : cost;
}
