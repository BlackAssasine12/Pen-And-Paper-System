// calculations.js

function updateCharakterCalculation() {
  let KO, KK, GE, KL, IN, FF, CH, GESCH, Tarnung, WIL, LP, AUSD, maxASP, MB, MR, level, xp, magicModifier, aspModifier, lpModifier, fernModifier, nahModifier, schuss, wurf, Attacke, Parade, Giftresistenz, giftModifier, Sin, Steigerungspunkte, Gesteigerte, Schnelligkeit;

  const magischeElementeInputs = document.querySelectorAll('.Magische_Elemente');
  let totalSum = 0;
  magischeElementeInputs.forEach(input => {
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
      totalSum += value;
    }
  });

  lpModifier = parseInt(document.getElementById("modifier_lp").value);
  aspModifier = parseInt(document.getElementById("modifier_asp").value);
  magicModifier = parseInt(document.getElementById("modifier_magie").value);
  fernModifier = parseInt(document.getElementById("modifier_fernkampf").value);
  nahModifier = parseInt(document.getElementById("modifier_nahkampf").value);
  giftModifier = parseInt(document.getElementById("modifier_gift").value);

  xp = parseInt(document.getElementById("erfahrung_xp").value);
  KK = parseInt(document.getElementById("attribute_Körperkraft").value);
  GE = parseInt(document.getElementById("attribute_Gewandheit").value);
  KL = parseInt(document.getElementById("attribute_Klugheit").value);
  IN = parseInt(document.getElementById("attribute_Intuition").value);
  FF = parseInt(document.getElementById("attribute_Fingerfertigkeit").value);
  CH = parseInt(document.getElementById("attribute_Charisma").value);
  GESCH = parseInt(document.getElementById("attribute_Geschicklichkeit").value);
  Tarnung = parseInt(document.getElementById("attribute_Tarnung").value);
  Sin = parseInt(document.getElementById("attribute_Sinnesschärfe").value);
  WIL = parseInt(document.getElementById("attribute_Willenskraft").value);
  KO = parseInt(document.getElementById("attribute_Konstitution").value);
  Gesteigerte = parseInt(document.getElementById("erfahrung_Gesteigerte").value);

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

  document.getElementById("erfahrung_level").value = level;

  LP = lpModifier * 3 + level * 6 + 20 + KO;
  document.getElementById("sonderwerte_Maximale_LP").value = LP;

  AUSD = LP + WIL;
  document.getElementById("sonderwerte_Maximale_Ausdauer").value = AUSD;

  MB = totalSum + magicModifier;
  document.getElementById("sonderwerte_Magiebegabung").value = MB;

  maxASP = level * 6 + aspModifier * 2 + MB;
  document.getElementById("sonderwerte_Maximale_Astralenergie").value = maxASP;

  MR = Math.round((MB + level + KL) / 3);
  document.getElementById("sonderwerte_Magieresistenz").value = MR;

  Giftresistenz = Math.round((AUSD) / 10 + giftModifier);
  document.getElementById("sonderwerte_Giftresistenz").value = Giftresistenz;

  wurf = Math.round((IN + FF + KK) / 4);
  document.getElementById("KampfBasiswerte_Wurfwaffen_Basiswert").value = wurf;

  schuss = Math.round((IN + FF + KK) / 4);
  document.getElementById("KampfBasiswerte_Schusswaffen_Basiswert").value = schuss;

  Attacke = Math.round((KO + GE + KK) / 5);
  document.getElementById("KampfBasiswerte_Attacke_Basiswert").value = Attacke;

  Parade = Math.round((IN + GE + KK) / 5);
  document.getElementById("KampfBasiswerte_Parade_Basiswert").value = Parade;

  Steigerungspunkte = level * 30 + 100 - Gesteigerte;
  document.getElementById("erfahrung_Steigerungspunkte").value = Steigerungspunkte;

  Schnelligkeit = Math.round((KK + GE + Sin) / 4)
  document.getElementById("sonderwerte_Schnelligkeit").value = Schnelligkeit;

  MaxValue(level, MB)
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
        element1.value = aktuellerWert1 + wert3 + PABasiswert;
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