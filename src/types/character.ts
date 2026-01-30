export type NumericRecord = Record<string, number>;
export type StringRecord = Record<string, string>;

export interface TalentEntry {
  Name: string;
  Attribute: string;
  Wert: number;
}

export interface CharacterInfo {
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

export interface CharacterWerte {
  xp: number;
  level: number;
  Steigerungspunkte: number;
  Gesteigerte: number;
}

export interface CharacterFaehigkeiten {
  modifier?: NumericRecord;
  sonderwerte?: NumericRecord;
  attribute?: NumericRecord;
  KampfBasiswerte?: NumericRecord;
  Kampf_Talente?: Record<string, number[]>;
  Assassinen_Talente?: TalentEntry[];
  Talente_1?: TalentEntry[];
  Talente_2?: TalentEntry[];
  Handwerkstalente?: TalentEntry[];
  Gespeicherte_Kampftalente?: Record<string, number[]>;
}

export interface WalletState {
  dukaten: number;
  silber: number;
  heller: number;
  kreuzer: number;
  wInsg: number;
}

export interface InventoryItem {
  name: string;
  quantity?: number;
  count?: number;
}

export interface ShopItem {
  Item: string;
  Preis: number;
  Währung: string;
}

export type ShopData = Record<string, ShopItem[]>;

export type SectionValues = Record<string, number | string | number[]>;

export interface MagicAbility {
  element: string;
  type: string;
  level: number;
}

export interface MagicSystemSnapshot {
  advancementPoints: number;
  magicAbilities: MagicAbility[];
}

export interface CharacterData {
  charakter: {
    charakterInfo?: CharacterInfo;
    werte?: CharacterWerte;
    fähigkeiten?: CharacterFaehigkeiten;
    Magische_Elemente?: NumericRecord;
    geld?: WalletState;
  };
  inventory?: InventoryItem[];
  magieSystem?: MagicSystemSnapshot;
}

export type AdjustmentsMap = Record<string, number>;

export interface KlassenKategorien {
  [category: string]: string[];
}

export interface ExperienceOverride {
  xp?: number;
  level?: number;
  steigerungspunkte?: number;
  gesteigerte?: number;
}

export interface SaveOverrides {
  experience?: ExperienceOverride;
  magicSystem?: MagicSystemSnapshot;
  filename?: string;
  characterName?: string;
}

export interface LoadCallbacks {
  onExperienceLoaded?: (experience: Required<ExperienceOverride>) => void;
  onMagicLoaded?: (magicSystem: MagicSystemSnapshot) => void;
  onCharacterLoaded?: (data: CharacterData) => void;
  onFilenameLoaded?: (filename: string) => void;
}

export interface MagicSystemApi {
  init: () => MagicSystemApi;
  syncToGlobals: () => void;
  syncFromGlobals: () => void;
  getMagicList: () => MagicAbility[];
  addMagic: (magic: MagicAbility) => void;
  removeMagic: (index: number) => void;
  levelUpMagic: (index: number, cost?: number) => void;
  resetAll?: () => void;
  getAdvancementPoints: () => number;
  setAdvancementPoints: (points: number) => void;
  getCharacterName: () => string;
  setCharacterName: (name: string) => void;
  getCharacterLevel: () => number;
  setCharacterLevel: (level: number) => void;
  getCharacterXP: () => number;
  setCharacterXP: (xp: number) => void;
  getGesteigertePoints: () => number;
  setGesteigertePoints: (points: number) => void;
}

declare global {
  interface Window {
    characterMagic?: MagicAbility[];
    advancementPoints?: number;
    MagicSystem?: MagicSystemApi;
    renderMagicList?: () => void;
    updatePreview?: () => void;
    inventory?: InventoryItem[];
    kampfArr?: string[];
  }
}
