// let talentString = `
// Alchemie (KL/GES/SIN): "0"
// Geographie (KL/IN/SIN): "0"
// Götter und Kulte (KL/IN/CH): "0"
// Kriegskunst (KL/IN/KK): "0"
// Magiekunde (KL/IN/WK): "0"
// Mechanik (GES/KL/FF): "0"
// Orientierung (KL/IN/SIN): "0"
// Pflanzenkunde (KL/IN/FF): "5"
// Rechtskunde (KL/IN/CH): "13"
// Schätzen (KL/IN/SIN): "0"
// Sternkunde (KL/IN/SIN): "0"
// Tanzen (CH/GEW/GES): "22"
// Tierkunde (KL/IN/SIN): "0"
// Wettervorhersage (KL/IN/SIN): "0"
// Zechen (KO/WK/KK): "0"
// `;
// let talents = talentString.trim().split('\n').map(line => {
//     let [name, valuePart] = line.split(': ');
//     console.log([name, valuePart])
//     let value = parseInt(valuePart.replace(/"/g, '').trim(), 10);
//     console.log(value)
//     return { name: name.trim(), value };
// });

// // Sortierung nach dem `value`-Wert
// talents.sort((a, b) => b.value - a.value);

// console.log(talents);


// let fähigkeit = ["modifier", "attribute", "KampfBasiswerte", "Assassinen_Talente", "Talente_1", "Talente_2", "Handwerkstalente",]

// for (let i = 0; i < fähigkeit.length; i++) {
//     let FähigkeitenTalente = charakter.fähigkeiten[fähigkeit[i]]

//     // FähigkeitenTalente.sort((a, b) => b.value - a.value);
//     // console.log(FähigkeitenTalente);
// }
