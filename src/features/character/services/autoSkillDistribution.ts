// 'import type' importiert nur die Typdefinitionen, keinen ausführbaren Code.
// Das hilft dem Compiler, den finalen Code schlank zu halten.
import type { DerivedValues } from "./derivedCalculations";

// 'Record' ist ein TypeScript-Werkzeug für ein Dictionary/Hashmap.
// Es definiert ein Objekt mit dynamischen Schlüsseln (z.B. "Schwerter") und Arrays aus Zahlen als Werte.
export type CombatTalents = Record<string, number[]>;

// 'Pick' extrahiert gezielt nur die benötigten Basiswerte aus dem vermutlich viel größeren 'DerivedValues'-Interface.
// Das reduziert Abhängigkeiten im Code (Loose Coupling) und macht die Funktion leichter isolierbar.
type BaseValues = Pick<DerivedValues, "attacke" | "parade" | "wurf" | "schuss">;

// Ein Type-Guard/Sanitizer. In Web-Anwendungen kommen Daten oft unsauber rein (aus JSONs oder User-Inputs).
// Diese Funktion stellt sicher, dass wir beim Rechnen nicht über NaN (Not a Number) oder undefined stolpern.
const toNumber = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0);

/**
 * Diese Funktion ist eine "Pure Function" (Reine Funktion).
 * Sie verändert keine äußeren Zustände und gibt für exakt denselben Input immer exakt denselben Output.
 * Das ist in React wichtig, um Zustandsänderungen (State Updates) berechenbar zu machen.
 */
export const applyAutoSkillDistribution = (
  talents: CombatTalents,
  baseValues: BaseValues
): CombatTalents => {
  // WICHTIG FÜR REACT: Immutability (Unveränderlichkeit).
  // React aktualisiert die Benutzeroberfläche nur, wenn sich die Speicherreferenz eines Objekts ändert.
  // Würden wir 'talents' direkt verändern (mutieren), würde die Ansicht nicht neu laden.
  // Daher erstellen wir mit dem Spread-Operator (...) eine flache Kopie (Shallow Copy).
  const next: CombatTalents = { ...talents };

  Object.entries(next).forEach(([name, values]) => {
    // Strukturprüfung: Wir erwarten ein Array im Format [Attacke, Parade, Talentwert, ...]
    if (!Array.isArray(values) || values.length < 3) {
      return;
    }

    const skillValue = toNumber(values[2]);
    const half = Math.floor(skillValue / 2);
    const rest = skillValue % 2;

    // Da 'next' nur eine Shallow Copy ist, verweisen die Arrays im Objekt noch auf die Originale in 'talents'.
    // Um das Originalobjekt nicht aus Versehen zu mutieren, müssen wir auch das innere Array kopieren.
    const updated = [...values];

    // --- Start der Regellogik ---
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
    // --- Ende der Regellogik ---

    // Wir hängen das neu berechnete Array wieder in unser kopiertes 'next'-Objekt ein.
    next[name] = updated;
  });

  // Wir geben ein völlig neues Objekt zurück. 
  // Das signalisiert dem React-State: "Es gibt neue Daten, bitte zeichne die Tabelle neu!"
  return next;
};