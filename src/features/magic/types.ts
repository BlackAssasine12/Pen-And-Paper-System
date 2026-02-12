export type MagicAbility = {
  element: string;
  type: string;
  level: number;
};

export type MagicSystemState = {
  advancementPoints: number;
  magicAbilities: MagicAbility[];
};
