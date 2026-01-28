// characterInfo.js
import { writeInputValue } from "./characterState";
import { setKlassenVariable } from "./adjustments";
import type { CharacterData, CharacterInfo } from "../types/character";

const getInputElement = (id: string) => {
    const element = document.getElementById(id);
    return element instanceof HTMLInputElement ? element : null;
};

export function genCharInfo(data: CharacterData) {
    const charakter = data.charakter.charakterInfo;
    if (!charakter) {
        return;
    }
    writeInputValue('name', charakter.name);
    writeInputValue('alter', charakter.alter);
    writeInputValue('geschlecht', charakter.geschlecht);
    writeInputValue('rassen-select', charakter.rasse);
    writeInputValue('klassen-select', charakter.klasse);
    writeInputValue('größe', charakter.größe);
    writeInputValue('gewicht', charakter.gewicht);
    writeInputValue('haarfarbe', charakter.haarfarbe);
    writeInputValue('augenfarbe', charakter.augenfarbe);
    writeInputValue('titel', charakter.titel);

    // Setze die adjustments basierend auf der geladenen Klasse
    setKlassenVariable(charakter.klasse);
}

export function updateCharakterInfo(charakterInfo: CharacterInfo) {
    const getIdValue = (id: string) => {
        const element = getInputElement(id);
        if (element) {
            return element.value;
        }
        console.error(`Element mit ID ${id} nicht gefunden.`);
        return '';
    };

    charakterInfo.name = getIdValue('name');
    charakterInfo.alter = getIdValue('alter');
    charakterInfo.geschlecht = getIdValue('geschlecht');
    charakterInfo.rasse = getIdValue('rassen-select'); // Sicherstellen, dass dieser Wert übernommen wird
    charakterInfo.klasse = getIdValue('klassen-select'); // Sicherstellen, dass dieser Wert übernommen wird
    console.log(charakterInfo.rasse)
    console.log(charakterInfo.klasse)
    charakterInfo.größe = getIdValue('größe');
    charakterInfo.gewicht = getIdValue('gewicht');
    charakterInfo.haarfarbe = getIdValue('haarfarbe');
    charakterInfo.augenfarbe = getIdValue('augenfarbe');
    charakterInfo.titel = getIdValue('titel');
}
