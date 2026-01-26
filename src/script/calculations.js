// calculations.js - Angepasst für das neue Magie-System

function updateCharakterCalculation() {
  let KO, KK, GE, KL, IN, FF, CH, GESCH, Tarnung, WIL, LP, AUSD, maxASP, MB, MR, level, xp, magicModifier, aspModifier, lpModifier, fernModifier, nahModifier, schuss, wurf, Attacke, Parade, Giftresistenz, giftModifier, Sin, Steigerungspunkte, Gesteigerte, Schnelligkeit;

  // Berechne die Summe der Magischen Elemente aus dem neuen System
  let totalSum = 0;
  try {
    if (window.characterMagic && Array.isArray(window.characterMagic)) {
      window.characterMagic.forEach(magic => {
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
    lpModifier = parseInt(document.getElementById("modifier_lp").value) || 0;
    aspModifier = parseInt(document.getElementById("modifier_asp").value) || 0;
    magicModifier = parseInt(document.getElementById("modifier_magie").value) || 0;
    fernModifier = parseInt(document.getElementById("modifier_fernkampf").value) || 0;
    nahModifier = parseInt(document.getElementById("modifier_nahkampf").value) || 0;
    giftModifier = parseInt(document.getElementById("modifier_gift").value) || 0;

    xp = parseInt(document.getElementById("erfahrung_xp").value) || 0;
    KK = parseInt(document.getElementById("attribute_Körperkraft").value) || 9;
    GE = parseInt(document.getElementById("attribute_Gewandheit").value) || 9;
    KL = parseInt(document.getElementById("attribute_Klugheit").value) || 9;
    IN = parseInt(document.getElementById("attribute_Intuition").value) || 9;
    FF = parseInt(document.getElementById("attribute_Fingerfertigkeit").value) || 9;
    CH = parseInt(document.getElementById("attribute_Charisma").value) || 9;
    GESCH = parseInt(document.getElementById("attribute_Geschicklichkeit").value) || 9;
    Tarnung = parseInt(document.getElementById("attribute_Tarnung").value) || 9;
    Sin = parseInt(document.getElementById("attribute_Sinnesschärfe").value) || 9;
    WIL = parseInt(document.getElementById("attribute_Willenskraft").value) || 9;
    KO = parseInt(document.getElementById("attribute_Konstitution").value) || 9;
    Gesteigerte = parseInt(document.getElementById("erfahrung_Gesteigerte").value) || 0;
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
    const levelInput = document.getElementById("erfahrung_level");
    if (levelInput) {
      levelInput.value = level;
    }

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
    document.getElementById("sonderwerte_Maximale_LP").value = LP;
    document.getElementById("sonderwerte_Maximale_Ausdauer").value = AUSD;
    document.getElementById("sonderwerte_Magiebegabung").value = MB;
    document.getElementById("sonderwerte_Maximale_Astralenergie").value = maxASP;
    document.getElementById("sonderwerte_Magieresistenz").value = MR;
    document.getElementById("sonderwerte_Giftresistenz").value = Giftresistenz;
    document.getElementById("KampfBasiswerte_Wurfwaffen_Basiswert").value = wurf;
    document.getElementById("KampfBasiswerte_Schusswaffen_Basiswert").value = schuss;
    document.getElementById("KampfBasiswerte_Attacke_Basiswert").value = Attacke;
    document.getElementById("KampfBasiswerte_Parade_Basiswert").value = Parade;
    document.getElementById("erfahrung_Steigerungspunkte").value = Steigerungspunkte;
    document.getElementById("sonderwerte_Schnelligkeit").value = Schnelligkeit;

    // Synchronisiere Steigerungspunkte mit dem Magie-System
    try {
      if (window.advancementPoints !== undefined) {
        // Nur aktualisieren, wenn sie sich unterscheiden
        if (window.advancementPoints !== Steigerungspunkte) {
          window.advancementPoints = Steigerungspunkte;
          const advancementPointsSpan = document.getElementById('advancement-points');
          if (advancementPointsSpan) {
            advancementPointsSpan.textContent = Steigerungspunkte;
          }
          console.log("Steigerungspunkte synchronisiert (von calculations):", Steigerungspunkte);
        }
      }
    } catch (error) {
      console.error("Fehler bei der Synchronisierung der Steigerungspunkte:", error);
    }

    // Aktualisiere die MaxValue-Einstellungen
    MaxValue(level, MB);
    
    console.log("Charakterberechnung abgeschlossen");
  } catch (error) {
    console.error("Fehler bei der Charakterberechnung:", error);
  }
}
document.getElementById('ASkillVert').onclick = autoSkillVerteilung;

function autoSkillVerteilung() {
  let KampfArr = [...kampfArr]
  let ATBasiswert = parseInt(document.getElementById("KampfBasiswerte_Attacke_Basiswert").value, 10)
  let PABasiswert = parseInt(document.getElementById("KampfBasiswerte_Parade_Basiswert").value, 10)
  let WurfBasiswert = parseInt(document.getElementById("KampfBasiswerte_Wurfwaffen_Basiswert").value, 10)
  let SchussBasiswert = parseInt(document.getElementById("KampfBasiswerte_Schusswaffen_Basiswert").value, 10)

  const Schild = ["Kampf_Talente_Schild_0", "Kampf_Talente_Schild_1", "Kampf_Talente_Schild_2"];
  const Wurfwaffen = ["Kampf_Talente_Wurfwaffen_0", "Kampf_Talente_Wurfwaffen_1", "Kampf_Talente_Wurfwaffen_2"];
  const Schusswaffen = ["Kampf_Talente_Bolzenwaffen_0", "Kampf_Talente_Bolzenwaffen_1", "Kampf_Talente_Bolzenwaffen_2", "Kampf_Talente_Pfeilwaffen_0", , "Kampf_Talente_Pfeilwaffen_1", "Kampf_Talente_Pfeilwaffen_2"];

  while (KampfArr.length >= 3) {
    const aktuelleIds = KampfArr.slice(0, 3);

    const element1 = document.getElementById(aktuelleIds[0]);
    const element2 = document.getElementById(aktuelleIds[1]);
    const element3 = document.getElementById(aktuelleIds[2]);

    element1.value = 0;
    element2.value = 0;

    if (!element1 || !element2 || !element3) {
      console.error("Eines der Elemente wurde im DOM nicht gefunden:", aktuelleIds);
      KampfArr.splice(0, 3);
      continue; // Fahre mit der nächsten Gruppe fort
    }

    const wert3 = parseInt(element3.value, 10) || 0;

    const hälfte = Math.floor(wert3 / 2);
    const rest = wert3 % 2;

    const neuerWert1 = hälfte + rest; // Falls ungerade, bekommt das erste Element eins mehr
    const neuerWert2 = hälfte;

    const aktuellerWert1 = parseInt(element1.value, 10) || 0;
    const aktuellerWert2 = parseInt(element2.value, 10) || 0;
    switch (true) {
      case Schild.includes(element1.id):
        element2.value = aktuellerWert1 + wert3 + PABasiswert;
        break;
      case Wurfwaffen.includes(element1.id):
        element1.value = aktuellerWert1 + wert3 + WurfBasiswert;
        break;
      case Schusswaffen.includes(element1.id):
        element1.value = aktuellerWert1 + wert3 + SchussBasiswert;

        break;
      default: //Nahkampfwaffen
        element1.value = aktuellerWert1 + neuerWert1 + ATBasiswert;
        element2.value = aktuellerWert2 + neuerWert2 + PABasiswert;
        break;
    }
    KampfArr.splice(0, 3);
  }

  // Optional: Verarbeiten der verbleibenden Elemente, falls weniger als 3
  if (KampfArr.length > 0) {
    console.warn("Nicht genügend Elemente, um einen weiteren Satz von drei zu verarbeiten:", KampfArr);
  }
}