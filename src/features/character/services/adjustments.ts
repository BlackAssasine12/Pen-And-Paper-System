// adjustments.js
import type { AdjustmentsMap, KlassenKategorien } from "../../../types/character";
import { addInputChangeListeners } from "./inputListeners";

// Objekt für Steigerungswerte
export const adjustments: AdjustmentsMap = {
    'modifier_stealth': 10,
    'modifier_magie': 10,
    'modifier_asp': 10,
    'modifier_lp': 10,
    'modifier_fernkampf': 10,
    'modifier_nahkampf': 10,
    'modifier_gift': 10,
    'attribute': 5,
    'Kampf_Talente_2': 5,
    'Assassinen_Talente': 3,
    'Normale_Talente': 3,
    'Handwerkstalente': 3,
    'attribute_Klugheit': 5,
    'Tarnung': 5,
    'Fingerfertigkeit': 5,
    'Magische_Elemente': 25,
    'Magische_Elemente_Raumzeit': 80,
    'Talente_1': 3,
    'Talente_2': 3,
    'attribute_Körperkraft': 5,
    'Wissenschaftliche_Talente': 3,
};


// Anpassung der Steigerungswerte nach Klassen
let cachedKlassenKategorien: KlassenKategorien | undefined;

export function setKlassenVariable(selectedClass: string, klassenKategorien?: KlassenKategorien) {
    if (klassenKategorien) {
        cachedKlassenKategorien = klassenKategorien;
    }
    const activeKategorien = klassenKategorien ?? cachedKlassenKategorien;

    // Zurücksetzen der adjustments auf Standardwerte
    resetAdjustmentsToDefault();

    if (selectedClass && activeKategorien?.["Magische Klassen"]?.includes(selectedClass)) {
        adjustments.modifier_magie = 3;
        adjustments.modifier_asp = 5;
        adjustments.Magische_Elemente = 20;
    } else if (selectedClass && activeKategorien?.["Nahkampf Basierte Klassen"]?.includes(selectedClass)) {
        adjustments.modifier_nahkampf = 3;
        adjustments.modifier_lp = 5;
        adjustments.attribute_Körperkraft = 3;
    } else if (selectedClass && activeKategorien?.["Fernkampf Basierte Klassen"]?.includes(selectedClass)) {
        adjustments.modifier_fernkampf = 3;
        adjustments.modifier_stealth = 5;
    } else if (selectedClass && activeKategorien?.["Wissenschaftliche Klassen"]?.includes(selectedClass)) {
        adjustments.attribute_Klugheit = 3
        adjustments.Wissenschaftliche_Talente = 2;
    } else if (selectedClass && activeKategorien?.["Arbeiterklassen"]?.includes(selectedClass)) {
        adjustments.Handwerkstalente = 2;
        adjustments.attribute = 4;
    } else if (selectedClass && activeKategorien?.["Halbmagische Klassen"]?.includes(selectedClass)) {
        adjustments.modifier_magie = 8;
        adjustments.modifier_asp = 8;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_lp = 8;
        adjustments.Magische_Elemente = 23;
    } else if (selectedClass && activeKategorien?.["Stealth Klassen"]?.includes(selectedClass)) {
        adjustments.modifier_stealth = 3;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_gift = 8;
        adjustments.Assassinen_Talente = 1;
    } else if (selectedClass && activeKategorien?.["Spezialklassen"]?.includes(selectedClass)) {
        adjustments.modifier_magie = 8;
        adjustments.modifier_asp = 8;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_lp = 8;
        adjustments.Magische_Elemente = 23;
    } else {
        // console.log("Klasse nicht gefunden")
    }

    // Aktualisiere die Event Listener mit den neuen adjustments
    addInputChangeListeners();
}

// Funktion, um adjustments auf Standardwerte zurückzusetzen
export function resetAdjustmentsToDefault() {
    adjustments.modifier_stealth = 10;
    adjustments.modifier_magie = 10;
    adjustments.modifier_asp = 10;
    adjustments.modifier_lp = 10;
    adjustments.modifier_fernkampf = 10;
    adjustments.modifier_nahkampf = 10;
    adjustments.modifier_gift = 10;
    adjustments.attribute = 5;
    adjustments.Kampf_Talente_2 = 5;
    adjustments.Assassinen_Talente = 3;
    adjustments.Normale_Talente = 3;
    adjustments.Handwerkstalente = 3;
    adjustments.attribute_Klugheit = 5;
    adjustments.Tarnung = 5;
    adjustments.Fingerfertigkeit = 5;
    adjustments.Magische_Elemente = 25;
    adjustments.Magische_Elemente_Raumzeit = 80;
    adjustments.Talente_1 = 3;
    adjustments.Talente_2 = 3;
    adjustments.attribute_Körperkraft = 5;
    adjustments.Wissenschaftliche_Talente = 3;
}
