export const attributeIds = [
  "Konstitution", "Körperkraft", "Gewandheit", "Klugheit", "Intuition",
  "Geschicklichkeit", "Tarnung", "Fingerfertigkeit", "Sinnesschärfe", "Charisma", "Willenskraft",
] as const;

export const modifierIds = ["magie", "asp", "lp", "fernkampf", "nahkampf", "gift", "stealth"] as const;
export const talentGroups = [
  "Assassinen_Talente", "Talente_1", "Talente_2", "Handwerkstalente",
  "Wissenschaftliche_Talente", "Normale_Talente",
] as const;

export type AttributeId = (typeof attributeIds)[number];
export type ModifierId = (typeof modifierIds)[number];
export type TalentGroup = (typeof talentGroups)[number];

export interface CharacterProfile {
  name: string;
  alter: string;
  geschlecht: string;
  rasse: string;
  klasse: string;
  größe: string;
  gewicht: string;
  haarfarbe: string;
  augenfarbe: string;
  titel: string;
}

export interface Talent {
  id: string;
  name: string;
  group: TalentGroup;
  attributes: string;
  value: number;
}

export type CombatKind = "melee" | "shield" | "throw" | "shoot";

export interface CombatTalent {
  id: string;
  name: string;
  kind: CombatKind;
  attack: number;
  parry: number;
  value: number;
}

export interface MagicAbility {
  id: string;
  element: string;
  type: string;
  level: number;
}

export const currencies = ["dukaten", "silber", "heller", "kreuzer"] as const;
export type Currency = (typeof currencies)[number];
export type Wallet = Record<Currency, number>;

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Experience {
  xp: number;
  spent: number;
  bonus: number;
}

export interface Resources {
  lp: number;
  endurance: number;
  asp: number;
}

export interface SpellNote {
  id: string;
  name: string;
  text: string;
  magicId?: string;
}

export interface CharacterWriting {
  notes: string;
  spells: SpellNote[];
}

export interface CharacterState {
  portrait?: string;
  writing?: CharacterWriting;
  profile: CharacterProfile;
  experience: Experience;
  attributes: Record<AttributeId, number>;
  modifiers: Record<ModifierId, number>;
  resources: Resources;
  talents: Talent[];
  combatTalents: CombatTalent[];
  magic: MagicAbility[];
  wallet: Wallet;
  inventory: InventoryItem[];
  hidden: { attributes: AttributeId[]; talents: string[] };
  freeAdvancement: boolean;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface AdvancementLimits {
  attribute: NumericRange;
  modifier: NumericRange;
  talent: NumericRange;
}

export interface DerivedValues {
  level: number;
  availablePoints: number;
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
  walletTotal: number;
  limits: AdvancementLimits;
}

export type AdvancementTarget =
  | { kind: "attribute"; id: AttributeId }
  | { kind: "modifier"; id: ModifierId }
  | { kind: "talent" | "combatTalent"; id: string };

export type BulkMode = "min" | "max";

export interface BulkAdvancementPreview {
  cost: number;
  changes: number;
  availablePoints: number;
  canApply: boolean;
}

export type CharacterAction =
  | { type: "set-profile"; key: keyof CharacterProfile; value: string }
  | { type: "set-portrait"; value: string | undefined }
  | { type: "set-notes"; value: string }
  | { type: "save-spell-note"; spell: SpellNote }
  | { type: "remove-spell-note"; id: string }
  | { type: "set-xp"; value: number }
  | { type: "grant-points"; amount: number }
  | { type: "set-free-advancement"; value: boolean }
  | { type: "set-resource"; key: keyof Resources; value: number }
  | { type: "advance"; target: AdvancementTarget; value: number }
  | { type: "bulk-advance"; mode: BulkMode }
  | { type: "set-combat"; id: string; field: "attack" | "parry"; value: number }
  | { type: "auto-distribute" }
  | { type: "add-magic"; ability: MagicAbility }
  | { type: "upgrade-magic" | "remove-magic"; id: string }
  | { type: "hide-attribute" | "restore-attribute"; id: AttributeId }
  | { type: "hide-talent" | "restore-talent"; id: string }
  | { type: "change-funds"; currency: Currency; amount: number }
  | { type: "convert-wallet" | "reset-wallet" }
  | { type: "buy-item"; id: string; name: string; price: number; currency: Currency }
  | { type: "add-inventory"; item: InventoryItem }
  | { type: "change-inventory"; id: string; delta: number };

export interface ActionResult {
  state: CharacterState;
  error?: string;
}
