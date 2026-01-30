export type CoreAttributes = {
  konstitution: number;
  körperkraft: number;
  gewandheit: number;
  klugheit: number;
  intuition: number;
  fingerfertigkeit: number;
  charisma: number;
  geschicklichkeit: number;
  tarnung: number;
  sinnesschärfe: number;
  willenskraft: number;
};

export type CoreModifiers = {
  lp: number;
  asp: number;
  magie: number;
  fernkampf: number;
  nahkampf: number;
  gift: number;
  stealth: number;
};

export type ExperienceSnapshot = {
  xp: number;
  level: number;
  steigerungspunkte: number;
  gesteigerte: number;
};

export type DerivedValues = {
  level: number;
  lpMax: number;
  ausdauerMax: number;
  magiebegabung: number;
  maxAstralenergie: number;
  magieresistenz: number;
  giftresistenz: number;
  wurf: number;
  schuss: number;
  attacke: number;
  parade: number;
  schnelligkeit: number;
};

export const calculateLevelFromXp = (xp: number) => {
  if (xp < 750) {
    return Math.floor(xp / 150) + 1;
  }
  if (xp < 4950) {
    return Math.floor((xp - 750) / 600) + 7;
  }
  return Math.floor((xp - 4950) / 1200) + 14;
};

type DerivedInputs = {
  attributes: CoreAttributes;
  modifiers: CoreModifiers;
  experience: ExperienceSnapshot;
  magicSum: number;
};

export const calculateDerivedValues = ({ attributes, modifiers, experience, magicSum }: DerivedInputs): DerivedValues => {
  const level = experience.level || calculateLevelFromXp(experience.xp);
  const lpMax = modifiers.lp * 3 + level * 6 + 20 + attributes.konstitution;
  const ausdauerMax = lpMax + attributes.willenskraft;
  const magiebegabung = magicSum + modifiers.magie;
  const maxAstralenergie = level * 6 + modifiers.asp * 2 + magiebegabung;
  const magieresistenz = Math.round((magiebegabung + level + attributes.klugheit) / 3);
  const giftresistenz = Math.round(ausdauerMax / 10 + modifiers.gift);
  const wurf = Math.round((attributes.intuition + attributes.fingerfertigkeit + attributes.körperkraft) / 4);
  const schuss = Math.round((attributes.intuition + attributes.fingerfertigkeit + attributes.körperkraft) / 4);
  const attacke = Math.round((attributes.konstitution + attributes.gewandheit + attributes.körperkraft) / 5);
  const parade = Math.round((attributes.intuition + attributes.gewandheit + attributes.körperkraft) / 5);
  const schnelligkeit = Math.round((attributes.körperkraft + attributes.gewandheit + attributes.sinnesschärfe) / 4);

  return {
    level,
    lpMax,
    ausdauerMax,
    magiebegabung,
    maxAstralenergie,
    magieresistenz,
    giftresistenz,
    wurf,
    schuss,
    attacke,
    parade,
    schnelligkeit,
  };
};
