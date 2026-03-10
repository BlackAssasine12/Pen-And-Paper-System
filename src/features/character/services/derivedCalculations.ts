// DerivedCalculations.ts

// Basis-Attribute eines Charakters.
// Diese Werte werden direkt vom Spieler gesteigert oder bei der Charaktererstellung gewürfelt/gekauft.
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

// Zusätzliche Modifikatoren.
// Das sind Boni oder Mali, die z.B. durch Ausrüstung, Rassen-Boni, temporäre Buffs oder Klassen-Fähigkeiten kommen.

export type CoreModifiers = {
  lp: number;         // Bonus auf Lebenspunkte
  asp: number;        // Bonus auf Astralpunkte (Mana)
  magie: number;      // Bonus auf die allgemeine Magiebegabung
  fernkampf: number;  // Bonus auf Fernkampf
  nahkampf: number;   // Bonus auf Nahkampf
  gift: number;       // Bonus auf die Giftresistenz
  stealth: number;    // WIP
};


// Zustand der Erfahrung des Charakters.

export type ExperienceSnapshot = {
  xp: number;                // Die total gesammelten Erfahrungspunkte
  level: number;             // Das aktuelle Charakterlevel
  steigerungspunkte: number; // Die Währung, mit der Talente und Attribute gekauft werden
  gesteigerte: number;       // Bereits ausgegebene Punkte
};


//Abgeleitete Werte (Secondary Stats).
//Diese Werte werden NICHT direkt gesteigert, sondern immer automatisch aus den Attributen, 
//dem Level und den Modifikatoren berechnet.

export type DerivedValues = {
  level: number;             // dein Level
  lpMax: number;             // Maximale Lebenspunkte
  ausdauerMax: number;       // Maximale Ausdauer
  magiebegabung: number;     // Man braucht eine höhere Magiebegabung um stärkere zauber zu wirken
  maxAstralenergie: number;  // Maximales Mana (ASP)
  magieresistenz: number;    // Je höher desto unwirksamer sind Zauber gegen dich
  giftresistenz: number;     // Je höher desto unwirksamer ist gift gegen dich 
  wurf: number;              // Basiswert für Wurfwaffen
  schuss: number;            // Basiswert für Schusswaffen
  attacke: number;           // Basiswert für Nahkampfangriffe
  parade: number;            // Basiswert für das Blocken/Parieren
  schnelligkeit: number;     // Bestimmt die Initiative
};


//Berechnet das Charakterlevel basierend auf den totalen XP.
//Das System nutzt eine dynamische Skalierung (Progressionskurve), 
//bei der Level-Ups auf höheren Stufen mehr XP kosten.

export const calculateLevelFromXp = (xp: number) => {
  // Early Game: Kostet 150 XP pro Level
  if (xp < 750) {
    return Math.floor(xp / 150) + 1;
  }
  // Mid Game: Kostet 600 XP pro Level
  if (xp < 4950) {
    return Math.floor((xp - 750) / 600) + 7;
  }
  // Late-Game: Kostet 1200 XP pro Level
  return Math.floor((xp - 4950) / 1200) + 14;
};

type DerivedInputs = {
  attributes: CoreAttributes;
  modifiers: CoreModifiers;
  experience: ExperienceSnapshot;
  magicSum: number; // Die Summe aller gelernten Magiefähigkeiten
};


//Die Kern-Mathematik des Pen & Paper Systems.
//Hier werden alle Formeln angewendet, um aus den Basiswerten die Kampf- und Überlebenswerte zu berechnen.
//ACHTUNG beim Balancing: Änderungen der Teiler (z.B. / 4 oder / 5) haben große Auswirkungen auf das Spiel!

export const calculateDerivedValues = ({ attributes, modifiers, experience, magicSum }: DerivedInputs): DerivedValues => {
  // 1. Level ermitteln (entweder fix aus dem State oder frisch aus den XP berechnet)
  const level = experience.level || calculateLevelFromXp(experience.xp);

  // 2. Lebenspunkte (LP):
  // Basiswert 20 + Konstitution + 6 LP pro Level. Der Modifikator ist extra stark (x3).
  const lpMax = modifiers.lp * 3 + level * 6 + 20 + attributes.konstitution;

  // 3. Ausdauer:
  // Baut direkt auf den Lebenspunkten auf + Willenskraft als Bonus.
  const ausdauerMax = lpMax + attributes.willenskraft;

  // 4. Magiebegabung:
  // Setzt sich zusammen aus den gelernten Zaubern und Magie Modifikatoren.
  const magiebegabung = magicSum + modifiers.magie;

  // 5. Astralenergie (Mana):
  // 6 ASP pro Level + die Magiebegabung. Der Modifikator gibt hier +2 pro Punkt.
  const maxAstralenergie = level * 6 + modifiers.asp * 2 + magiebegabung;

  // 6. Resistenzen:
  // Magieresistenz: Ein Drittel der Summe aus Begabung, Level und Klugheit (gerundet).
  const magieresistenz = Math.round((magiebegabung + level + attributes.klugheit) / 3);
  // Giftresistenz: 10% der maximalen Ausdauer + spezielle Gift-Modifikatoren.
  const giftresistenz = Math.round(ausdauerMax / 10 + modifiers.gift);

  // 7. Kampf-Basiswerte (Fernkampf):
  // Wurf und Schuss nutzen die gleiche Formel: Durchschnitt aus Intuition, Fingerfertigkeit und Körperkraft, geteilt durch 4.
  const wurf = Math.round((attributes.intuition + attributes.fingerfertigkeit + attributes.körperkraft) / 4);
  const schuss = Math.round((attributes.intuition + attributes.fingerfertigkeit + attributes.körperkraft) / 4);

  // 8. Kampf-Basiswerte (Nahkampf):
  // Attacke: Fokus liegt auf Konstitution, Gewandheit und Körperkraft.
  // Parade: Fokus liegt auf Intuition statt Konstitution (Gefahren vorausahnen).
  // Beide werden durch 5 geteilt, steigen also langsamer als die Fernkampfwerte.
  const attacke = Math.round((attributes.konstitution + attributes.gewandheit + attributes.körperkraft) / 5);
  const parade = Math.round((attributes.intuition + attributes.gewandheit + attributes.körperkraft) / 5);

  // 9. Schnelligkeit:
  // Durchschnitt aus Kraft, Gewandheit und Wahrnehmung (Sinnesschärfe).
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