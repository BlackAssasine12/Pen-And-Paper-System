// calculations.js - Angepasst für das neue Magie-System
import { readNumericInput, writeDerivedValue, writeInputValue } from "./characterState";
import { applyMaxValueSettings } from "./characterAttributes";
import type { MagicAbility } from "../types/character";

const getInputElement = (id: string) => {
  const element = document.getElementById(id);
  return element instanceof HTMLInputElement ? element : null;
};

export function updateCharakterCalculation() {
  let KO, KK, GE, KL, IN, FF, CH, GESCH, Tarnung, WIL, LP, AUSD, maxASP, MB, MR, level, xp, magicModifier, aspModifier, lpModifier, fernModifier, nahModifier, schuss, wurf, Attacke, Parade, Giftresistenz, giftModifier, Sin, Steigerungspunkte, Gesteigerte, Schnelligkeit;

  // Berechne die Summe der Magischen Elemente aus dem neuen System
  let totalSum = 0;
  try {
    if (window.characterMagic && Array.isArray(window.characterMagic)) {
      window.characterMagic.forEach((magic: MagicAbility) => {
        if (magic && typeof magic.level === 'number') {
          totalSum += magic.level;
        }
      });
    }
    console.log("Magie-Summe berechnet:", totalSum);
  } catch (error) {
    console.error("Fehler bei der Berechnung der Magie-Summe:", error);
    totalSum = 0;
  }

  // Werte aus den Eingabefeldern holen mit Fehlerbehandlung
  try {
    lpModifier = readNumericInput("modifier_lp", 0);
    aspModifier = readNumericInput("modifier_asp", 0);
    magicModifier = readNumericInput("modifier_magie", 0);
    fernModifier = readNumericInput("modifier_fernkampf", 0);
    nahModifier = readNumericInput("modifier_nahkampf", 0);
    giftModifier = readNumericInput("modifier_gift", 0);

    xp = readNumericInput("erfahrung_xp", 0);
    KK = readNumericInput("attribute_Körperkraft", 9);
    GE = readNumericInput("attribute_Gewandheit", 9);
    KL = readNumericInput("attribute_Klugheit", 9);
    IN = readNumericInput("attribute_Intuition", 9);
    FF = readNumericInput("attribute_Fingerfertigkeit", 9);
    CH = readNumericInput("attribute_Charisma", 9);
    GESCH = readNumericInput("attribute_Geschicklichkeit", 9);
    Tarnung = readNumericInput("attribute_Tarnung", 9);
    Sin = readNumericInput("attribute_Sinnesschärfe", 9);
    WIL = readNumericInput("attribute_Willenskraft", 9);
    KO = readNumericInput("attribute_Konstitution", 9);
    Gesteigerte = readNumericInput("erfahrung_Gesteigerte", 0);
  } catch (error) {
    console.error("Fehler beim Auslesen der Eingabewerte:", error);
    // Setze Standardwerte
    KO = KK = GE = KL = IN = FF = CH = GESCH = Tarnung = Sin = WIL = 9;
    lpModifier = aspModifier = magicModifier = fernModifier = nahModifier = giftModifier = 0;
    xp = 0;
    Gesteigerte = 0;
  }

  try {
    // Level-Berechnung
    if (xp < 750) {
      // Erste 6 Level, jeweils 150 XP
      level = Math.floor(xp / 150) + 1;
    } else if (xp < 4950) {
      // Level 7 bis 13, jeweils 600 XP
      level = Math.floor((xp - 750) / 600) + 7;
    } else {
      // Level 14 und höher, jeweils 1200 XP
      level = Math.floor((xp - 4950) / 1200) + 14;
    }

    // Setze den Level
    writeInputValue("erfahrung_level", level);

    // Berechnungen der Werte
    LP = lpModifier * 3 + level * 6 + 20 + KO;
    AUSD = LP + WIL;
    MB = totalSum + magicModifier;  // Hier wird die Magiesumme verwendet
    maxASP = level * 6 + aspModifier * 2 + MB;
    MR = Math.round((MB + level + KL) / 3);
    Giftresistenz = Math.round((AUSD) / 10 + giftModifier);
    wurf = Math.round((IN + FF + KK) / 4);
    schuss = Math.round((IN + FF + KK) / 4);
    Attacke = Math.round((KO + GE + KK) / 5);
    Parade = Math.round((IN + GE + KK) / 5);
    Steigerungspunkte = level * 30 + 100 - Gesteigerte;
    Schnelligkeit = Math.round((KK + GE + Sin) / 4)

    // Setze die berechneten Werte
    writeDerivedValue("sonderwerte_Maximale_LP", LP);
    writeDerivedValue("sonderwerte_Maximale_Ausdauer", AUSD);
    writeDerivedValue("sonderwerte_Magiebegabung", MB);
    writeDerivedValue("sonderwerte_Maximale_Astralenergie", maxASP);
    writeDerivedValue("sonderwerte_Magieresistenz", MR);
    writeDerivedValue("sonderwerte_Giftresistenz", Giftresistenz);
    writeDerivedValue("KampfBasiswerte_Wurfwaffen_Basiswert", wurf);
    writeDerivedValue("KampfBasiswerte_Schusswaffen_Basiswert", schuss);
    writeDerivedValue("KampfBasiswerte_Attacke_Basiswert", Attacke);
    writeDerivedValue("KampfBasiswerte_Parade_Basiswert", Parade);
    writeDerivedValue("erfahrung_Steigerungspunkte", Steigerungspunkte);
    writeDerivedValue("sonderwerte_Schnelligkeit", Schnelligkeit);

    // Synchronisiere Steigerungspunkte mit dem Magie-System
    try {
      if (window.advancementPoints !== undefined) {
        // Nur aktualisieren, wenn sie sich unterscheiden
        if (window.advancementPoints !== Steigerungspunkte) {
          window.advancementPoints = Steigerungspunkte;
          const advancementPointsSpan = document.getElementById('advancement-points');
          if (advancementPointsSpan) {
            advancementPointsSpan.textContent = String(Steigerungspunkte);
          }
          console.log("Steigerungspunkte synchronisiert (von calculations):", Steigerungspunkte);
        }
      }
    } catch (error) {
      console.error("Fehler bei der Synchronisierung der Steigerungspunkte:", error);
    }

    // Aktualisiere die MaxValue-Einstellungen
    applyMaxValueSettings(level, MB);
    
    console.log("Charakterberechnung abgeschlossen");
  } catch (error) {
    console.error("Fehler bei der Charakterberechnung:", error);
  }
}
const autoSkillButton = document.getElementById('ASkillVert');
if (autoSkillButton) {
  autoSkillButton.addEventListener('click', autoSkillVerteilung);
}

function autoSkillVerteilung() {
  const KampfArr = [...(window.kampfArr ?? [])];
  const attackInput = getInputElement("KampfBasiswerte_Attacke_Basiswert");
  const paradeInput = getInputElement("KampfBasiswerte_Parade_Basiswert");
  const wurfInput = getInputElement("KampfBasiswerte_Wurfwaffen_Basiswert");
  const schussInput = getInputElement("KampfBasiswerte_Schusswaffen_Basiswert");

  const ATBasiswert = parseInt(attackInput?.value ?? "0", 10);
  const PABasiswert = parseInt(paradeInput?.value ?? "0", 10);
  const WurfBasiswert = parseInt(wurfInput?.value ?? "0", 10);
  const SchussBasiswert = parseInt(schussInput?.value ?? "0", 10);

  const Schild = ["Kampf_Talente_Schild_0", "Kampf_Talente_Schild_1", "Kampf_Talente_Schild_2"];
  const Wurfwaffen = ["Kampf_Talente_Wurfwaffen_0", "Kampf_Talente_Wurfwaffen_1", "Kampf_Talente_Wurfwaffen_2"];
  const Schusswaffen = ["Kampf_Talente_Bolzenwaffen_0", "Kampf_Talente_Bolzenwaffen_1", "Kampf_Talente_Bolzenwaffen_2", "Kampf_Talente_Pfeilwaffen_0", , "Kampf_Talente_Pfeilwaffen_1", "Kampf_Talente_Pfeilwaffen_2"];

  while (KampfArr.length >= 3) {
    const aktuelleIds = KampfArr.slice(0, 3);

    const element1 = getInputElement(aktuelleIds[0]);
    const element2 = getInputElement(aktuelleIds[1]);
    const element3 = getInputElement(aktuelleIds[2]);

    if (!element1 || !element2 || !element3) {
      console.error("Eines der Elemente wurde im DOM nicht gefunden:", aktuelleIds);
      KampfArr.splice(0, 3);
      continue; // Fahre mit der nächsten Gruppe fort
    }

    element1.value = "0";
    element2.value = "0";

    const wert3 = parseInt(element3.value, 10) || 0;

    const hälfte = Math.floor(wert3 / 2);
    const rest = wert3 % 2;

    const neuerWert1 = hälfte + rest; // Falls ungerade, bekommt das erste Element eins mehr
    const neuerWert2 = hälfte;

    const aktuellerWert1 = parseInt(element1.value, 10) || 0;
    const aktuellerWert2 = parseInt(element2.value, 10) || 0;
    switch (true) {
      case Schild.includes(element1.id):
        element2.value = String(aktuellerWert1 + wert3 + PABasiswert);
        break;
      case Wurfwaffen.includes(element1.id):
        element1.value = String(aktuellerWert1 + wert3 + WurfBasiswert);
        break;
      case Schusswaffen.includes(element1.id):
        element1.value = String(aktuellerWert1 + wert3 + SchussBasiswert);

        break;
      default: //Nahkampfwaffen
        element1.value = String(aktuellerWert1 + neuerWert1 + ATBasiswert);
        element2.value = String(aktuellerWert2 + neuerWert2 + PABasiswert);
        break;
    }
    KampfArr.splice(0, 3);
  }

  // Optional: Verarbeiten der verbleibenden Elemente, falls weniger als 3
  if (KampfArr.length > 0) {
    console.warn("Nicht genügend Elemente, um einen weiteren Satz von drei zu verarbeiten:", KampfArr);
  }
}
