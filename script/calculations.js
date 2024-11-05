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
    document.getElementById("sonderwerte_Maximale LP").value = LP;

    AUSD = LP + WIL;
    document.getElementById("sonderwerte_Maximale Ausdauer").value = AUSD;

    MB = totalSum + magicModifier;
    document.getElementById("sonderwerte_Magiebegabung").value = MB;

    maxASP = level * 6 + aspModifier * 2 + MB;
    document.getElementById("sonderwerte_Maximale Astralenergie").value = maxASP;

    MR = Math.round((MB + level + KL) / 3);
    document.getElementById("sonderwerte_Magieresistenz").value = MR;

    Giftresistenz = Math.round((AUSD) / 10 + giftModifier);
    document.getElementById("sonderwerte_Giftresistenz").value = Giftresistenz;

    wurf = Math.round((IN + FF + KK) / 4);
    document.getElementById("KampfBasiswerte_Wurfwaffen Basiswert").value = wurf;

    schuss = Math.round((IN + FF + KK) / 4);
    document.getElementById("KampfBasiswerte_Schusswaffen Basiswert").value = schuss;

    Attacke = Math.round((KO + GE + KK) / 5);
    document.getElementById("KampfBasiswerte_Attacke Basiswert").value = Attacke;

    Parade = Math.round((IN + GE + KK) / 5);
    document.getElementById("KampfBasiswerte_Parade Basiswert").value = Parade;

    Steigerungspunkte = level * 30 + 100 - Gesteigerte;
    document.getElementById("erfahrung_Steigerungspunkte").value = Steigerungspunkte;

    Schnelligkeit = Math.round((KK + GE + Sin) / 4)
    document.getElementById("sonderwerte_Schnelligkeit").value = Schnelligkeit;

    MaxValue(level, MB)
}
