// "use strict";
// window.onload = function () {
//     update()
// }
// function update() {
//     let KO;
//     let KK;
//     let GE;
//     let KL;
//     let IN;
//     let FF;
//     let CH;
//     let GESCH;
//     let Tarnung;
//     let WIL;
//     let LP;
//     let AUSD;
//     let maxASP;
//     let MB;
//     let MR;
//     let level;
//     let xp;
//     let magicModifier;
//     let aspModifier;
//     let lpModifier;
//     let fernModifier;
//     let nahModifier;
//     let schuss;
//     let wurf;
//     let Attacke;
//     let Parade;
//     let Giftresistenz;
//     let giftModifier
//     let Sin;


//     //NOTE - Modifier
//     lpModifier = parseInt(document.getElementById("modifier_lp").value);
//     aspModifier = parseInt(document.getElementById("modifier_asp").value);
//     magicModifier = parseInt(document.getElementById("modifier_magie").value);
//     fernModifier = parseInt(document.getElementById("modifier_").value)
//     nahModifier = parseInt(document.getElementById("modifier_").value)
//     giftModifier = parseInt(document.getElementById("modifier_").value)

//     //NOTE - Variabel  Charisma
//     xp = parseInt(document.getElementById("erfahrung_xp").value);
//     KO = parseInt(document.getElementById("attribute_konstitution").value);
//     KK = parseInt(document.getElementById("attribute_körperkraft").value);
//     GE = parseInt(document.getElementById("attribute_gewandheit").value);
//     KL = parseInt(document.getElementById("attribute_klugheit").value);
//     IN = parseInt(document.getElementById("attribute_intuition").value);
//     FF = parseInt(document.getElementById("attribute_fingerfertigkeit").value);
//     CH = parseInt(document.getElementById("attribute_charisma").value);
//     GESCH = parseInt(document.getElementById("attribute_geschicklichkeit").value);
//     Tarnung = parseInt(document.getElementById("attribute_tarnung").value);
//     Sin = parseInt(document.getElementById("attribute_sinnesschärfe").value);
//     WIL = parseInt(document.getElementById("attribute_willenskraft").value)

//     //NOTE - Rechenbar
//     level = parseInt(document.getElementById("erfahrung_level").value);
//     LP = parseInt(document.getElementById("sonderwerte_maximalelp").value = (KK + lpModifier + level * 6));
//     AUSD = parseInt(document.getElementById("sonderwerte_maximaleausdauer").value = (LP + KO));
//     maxASP = parseInt(document.getElementById("sonderwerte_maximaleastralenergie").value = (level * 6 + aspModifier));
//     MB = parseInt(document.getElementById("sonderwerte_magiebegabung").value = Math.round((maxASP / 8) + magicModifier));
//     MR = parseInt(document.getElementById("sonderwerte_magiebegabung").value = Math.round((MB + level + KL) / 3));
//     Giftresistenz = parseInt(document.getElementById("sonderwerte_giftresistenz").value = Math.round((AUSD) / 10 + giftModifier));

//     wurf = parseInt(document.getElementById("").value = Math.round((IN + FF + KK) / 4));
//     schuss = parseInt(document.getElementById("").value = Math.round((IN + FF + KK) / 4));
//     Attacke = parseInt(document.getElementById("").value = Math.round((KO + GE + KK) / 5));
//     Parade = parseInt(document.getElementById("").value = Math.round((IN + GE + KK) / 5));

//     if (xp <= 900) { //level 0 bis 6
//         level = parseInt(document.getElementById("erfahrung_level").value = xp / 150);
//     } else {
//         if (xp <= 4200) { //level 7 bis 14
//             level = parseInt(document.getElementById("erfahrung_level").value = xp / 600 + 7);
//         } else {
//             //level 15 bis ´´
//             level = parseInt(document.getElementById("erfahrung_level").value = xp / 1200 + 10.5);

//         }
//     }
// }
