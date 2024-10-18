// characterInfo.js

function genCharInfo(data) {
    const charakter = data.charakter.charakterInfo;
    document.getElementById('name').value = charakter.name;
    document.getElementById('alter').value = charakter.alter;
    document.getElementById('geschlecht').value = charakter.geschlecht;
    document.getElementById('rassen-select').value = charakter.rasse;
    document.getElementById('klassen-select').value = charakter.klasse;
    document.getElementById('größe').value = charakter.größe;
    document.getElementById('gewicht').value = charakter.gewicht;
    document.getElementById('haarfarbe').value = charakter.haarfarbe;
    document.getElementById('augenfarbe').value = charakter.augenfarbe;
    document.getElementById('titel').value = charakter.titel;
}

function updateCharakterInfo(charakterInfo) {
    const getIdValue = (id) => {
        const element = document.getElementById(id);
        if (element) {
            return element.value;
        } else {
            console.error(`Element mit ID ${id} nicht gefunden.`);
            return '';
        }
    };

    charakterInfo.name = getIdValue('name');
    charakterInfo.alter = getIdValue('alter');
    charakterInfo.geschlecht = getIdValue('geschlecht');
    charakterInfo.rasse = getIdValue('rassen-select');
    charakterInfo.klasse = getIdValue('klassen-select');
    charakterInfo.größe = getIdValue('größe');
    charakterInfo.gewicht = getIdValue('gewicht');
    charakterInfo.haarfarbe = getIdValue('haarfarbe');
    charakterInfo.augenfarbe = getIdValue('augenfarbe');
    charakterInfo.titel = getIdValue('titel');
}
