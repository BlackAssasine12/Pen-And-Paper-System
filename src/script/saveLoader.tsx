// saveLoader.tsx - Einheitliches Speicher- und Ladesystem
import { readNumericInput, readTextInput } from "./characterState";
import { genCharInfo } from "./characterInfo";
import { bindHideButtons } from "./hideButtons";
import { updateCharakterCalculation } from "./calculations";
import { initializeWallet, wallet } from "./wallet";
import { renderInventory } from "./shop";
import type {
    CharacterData,
    CharacterInfo,
    ExperienceOverride,
    InventoryItem,
    LoadCallbacks,
    MagicSystemSnapshot,
    SectionValues,
    SaveOverrides,
    TalentEntry,
} from "../types/character";

declare const generateCharakterAttributes: ((data: CharacterData) => void) | undefined;

// Globale Variablen
let myData: CharacterData | null = null;
let fileName: string | null = null;

// Kleine Debug-Helper
const SL_DEBUG = true; // bei Bedarf auf false
const slLog = (...args: unknown[]) => SL_DEBUG && console.log("[SaveLoader]", ...args);
const slWarn = (...args: unknown[]) => SL_DEBUG && console.warn("[SaveLoader]", ...args);
const slErr = (...args: unknown[]) => SL_DEBUG && console.error("[SaveLoader]", ...args);
const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

export const setSaveData = (data: CharacterData) => {
    myData = data;
};

export const getSaveData = () => myData;

// Hauptfunktion zum Speichern der Charakterdaten
export function saveCharacterData(data: CharacterData, overrides: SaveOverrides = {}) {
    try {
        slLog("saveCharacterData: start");
        const charakter = data.charakter;

        // 1. Charakterinfo aktualisieren
        if (charakter.charakterInfo) {
            slLog("saveCharacterData: updateCharakterInfo");
            updateCharakterInfo(charakter.charakterInfo, overrides);
        } else {
            slWarn("saveCharacterData: charakter.charakterInfo fehlt");
        }

        // 2. XP und Level separat aktualisieren, damit sie nicht verloren gehen
        if (charakter.werte) {
            slLog("saveCharacterData: werte vorhanden, lese XP/Level Inputs");
            const experience = overrides?.experience;
            if (experience) {
                charakter.werte.xp = experience.xp ?? charakter.werte.xp;
                charakter.werte.level = experience.level ?? charakter.werte.level;
                charakter.werte.Steigerungspunkte = experience.steigerungspunkte ?? charakter.werte.Steigerungspunkte;
                charakter.werte.Gesteigerte = experience.gesteigerte ?? charakter.werte.Gesteigerte;
            } else {
                charakter.werte.xp = readNumericInput('erfahrung_xp', 0);
                charakter.werte.level = readNumericInput('erfahrung_level', 0);
                charakter.werte.Steigerungspunkte = readNumericInput('erfahrung_Steigerungspunkte', 0);
                charakter.werte.Gesteigerte = readNumericInput('erfahrung_Gesteigerte', 0);
            }

            slLog("saveCharacterData: XP/Level gespeichert", {
                xp: charakter.werte.xp,
                level: charakter.werte.level,
                steigerungspunkte: charakter.werte.Steigerungspunkte,
                gesteigerte: charakter.werte.Gesteigerte
            });
        } else {
            slWarn("saveCharacterData: charakter.werte fehlt");
        }

        // 3. Fähigkeiten aktualisieren
        if (charakter.fähigkeiten) {
            slLog("saveCharacterData: update fähigkeiten");
            const fähigkeiten = charakter.fähigkeiten;

            if (fähigkeiten.modifier) updateSectionValues(fähigkeiten.modifier, 'modifier');
            if (fähigkeiten.sonderwerte) updateSectionValues(fähigkeiten.sonderwerte, 'sonderwerte');
            if (fähigkeiten.attribute) updateSectionValues(fähigkeiten.attribute, 'attribute');
            if (fähigkeiten.Assassinen_Talente) updateSectionValues(fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
            if (fähigkeiten.Talente_1) updateSectionValues(fähigkeiten.Talente_1, 'Talente_1');
            if (fähigkeiten.Talente_2) updateSectionValues(fähigkeiten.Talente_2, 'Talente_2');
            if (fähigkeiten.KampfBasiswerte) updateSectionValues(fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
            if (fähigkeiten.Kampf_Talente) updateSectionValues(fähigkeiten.Kampf_Talente, 'Kampf_Talente');
            if (fähigkeiten.Handwerkstalente) updateSectionValues(fähigkeiten.Handwerkstalente, 'Handwerkstalente');
            if (fähigkeiten.Gespeicherte_Kampftalente) updateSectionValues(fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        } else {
            slWarn("saveCharacterData: charakter.fähigkeiten fehlt");
        }

        // 4. Geldbeutel aktualisieren
        if (charakter.geld) {
            slLog("saveCharacterData: wallet -> charakter.geld");
            charakter.geld = JSON.parse(JSON.stringify(wallet));
        } else {
            slLog("saveCharacterData: wallet sync übersprungen (charakter.geld oder wallet fehlt)");
        }

        // 5. Inventar speichern
        slLog("saveCharacterData: saveInventory");
        data.inventory = saveInventory();
        slLog("saveCharacterData: inventory items =", data.inventory?.length ?? 0);

        // 6. Magiesystem speichern
        slLog("saveCharacterData: saveMagieSystem");
        saveMagieSystem(data, overrides?.magicSystem);

        // 7. JSON erstellen und herunterladen
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Dateinamen bestimmen
        let filename = overrides?.filename ? overrides.filename.trim() : '';

        if (!filename) {
            const fallbackName = overrides?.characterName ?? charakter.charakterInfo?.name ?? '';
            filename = generateStandardFilename(fallbackName);
            slLog("saveCharacterData: filename auto =", filename);
        }

        // .json-Endung hinzufügen, falls nicht vorhanden
        if (!filename.toLowerCase().endsWith('.json')) {
            filename += '.json';
        }

        // Download initiieren
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        slLog("saveCharacterData: done ->", filename);
    } catch (error) {
        slErr("saveCharacterData: error", error);
        alert("Fehler beim Speichern: " + getErrorMessage(error));
    }
}

// Hilfsfunktion: Sanitize Key (Ersetzt Leerzeichen durch Unterstriche)
function sanitizeKey(key: string) {
    return key.replace(/\s+/g, '_');
}

// Hilfsfunktion: Aktualisiert Charakterinfo
function updateCharakterInfo(charakterInfo: CharacterInfo, overrides?: SaveOverrides) {
    if (overrides?.characterName) {
        charakterInfo.name = overrides.characterName;
    } else {
        charakterInfo.name = readTextInput('name');
    }
    charakterInfo.alter = readTextInput('alter');
    charakterInfo.geschlecht = readTextInput('geschlecht');
    charakterInfo.rasse = readTextInput('rassen-select');
    charakterInfo.klasse = readTextInput('klassen-select');
    charakterInfo.größe = readTextInput('größe');
    charakterInfo.gewicht = readTextInput('gewicht');
    charakterInfo.haarfarbe = readTextInput('haarfarbe');
    charakterInfo.augenfarbe = readTextInput('augenfarbe');
    charakterInfo.titel = readTextInput('titel');
}

// Hilfsfunktion: Aktualisiert Sektionswerte
const isRecordSection = (
    value: SectionValues | TalentEntry[] | Record<string, number[]>
): value is SectionValues | Record<string, number[]> => !Array.isArray(value);

function updateSectionValues(section: SectionValues | TalentEntry[] | Record<string, number[]>, sectionId: string) {
    slLog("updateSectionValues:", sectionId);
    const specialSections = ['Assassinen_Talente', 'Talente_1', 'Talente_2', 'Handwerkstalente'];

    if (specialSections.includes(sectionId) && Array.isArray(section)) {
        updateSpecialSection(section, sectionId);
        return;
    }

    if (isRecordSection(section)) {
        for (const key in section) {
            if (Array.isArray(section[key])) {
                section[key] = [];
                let index = 0;
                let input: HTMLElement | null;
                const sanitizedKey = sanitizeKey(key);

                while ((input = document.getElementById(`${sectionId}_${sanitizedKey}_${index}`)) !== null) {
                    if (input instanceof HTMLInputElement) {
                        (section[key] as number[]).push(parseFloat(input.value) || 0);
                    }
                    index++;
                }
            } else {
                const sanitizedKey = sanitizeKey(key);
                const input = document.getElementById(`${sectionId}_${sanitizedKey}`);

                if (input instanceof HTMLInputElement) {
                    const parsedValue = parseFloat(input.value);
                    section[key] = Number.isNaN(parsedValue) ? input.value : parsedValue;
                }
            }
        }
    }
}

// Hilfsfunktion: Aktualisiert spezielle Sektionen (Talente)
function updateSpecialSection(section: TalentEntry[], sectionId: string) {
    slLog("updateSpecialSection:", sectionId, "items =", Array.isArray(section) ? section.length : "n/a");
    section.forEach((item) => {
        const key = sanitizeKey(item.Name);
        const input = document.getElementById(`${sectionId}_${key}`);

        if (input instanceof HTMLInputElement) {
            const parsedValue = parseFloat(input.value);
            item.Wert = Number.isNaN(parsedValue) ? Number(input.value) || 0 : parsedValue;
        }
    });
}

// Hilfsfunktion: Speichert das Inventar
function saveInventory(): InventoryItem[] {
    try {
        const inventory: InventoryItem[] = [];
        const items = document.querySelectorAll<HTMLLIElement>('#inventory li');
        slLog("saveInventory: DOM items =", items.length);

        items.forEach(item => {
            const text = item.textContent;
            if (!text) {
                return;
            }
            const parts = text.split(' - ');

            if (parts.length >= 2) {
                const name = parts[0];
                const quantityText = parts[1];
                const quantity = parseInt(quantityText.replace('x', '')) || 1;

                inventory.push({ name, quantity });
            }
        });

        return inventory;
    } catch (error) {
        slErr("saveInventory: error", error);
        return [];
    }
}

// Hilfsfunktion: Speichert das Magiesystem
function saveMagieSystem(data: CharacterData, overrideMagieSystem?: MagicSystemSnapshot) {
    try {
        slLog("saveMagieSystem: start");

        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
            slLog("saveMagieSystem: magieSystem init");
        }

        if (overrideMagieSystem) {
            data.magieSystem.advancementPoints = overrideMagieSystem.advancementPoints ?? 0;
            data.magieSystem.magicAbilities = Array.isArray(overrideMagieSystem.magicAbilities)
                ? JSON.parse(JSON.stringify(overrideMagieSystem.magicAbilities))
                : [];
        } else if (typeof window.advancementPoints === 'number') {
            data.magieSystem.advancementPoints = window.advancementPoints;
            slLog("saveMagieSystem: AP aus global =", window.advancementPoints);
        } else {
            const steigerungspunkteInput = document.getElementById("erfahrung_Steigerungspunkte");
            if (steigerungspunkteInput instanceof HTMLInputElement) {
                data.magieSystem.advancementPoints = parseInt(steigerungspunkteInput.value) || 0;
                slLog("saveMagieSystem: AP aus DOM =", data.magieSystem.advancementPoints);
            } else {
                slWarn("saveMagieSystem: keine AP Quelle gefunden");
            }
        }

        if (!overrideMagieSystem) {
            if (typeof window.MagicSystem !== 'undefined') {
                slLog("saveMagieSystem: MagicSystem vorhanden");
                window.MagicSystem.init();
                window.MagicSystem.syncToGlobals();
                data.magieSystem.magicAbilities = window.MagicSystem.getMagicList();
                slLog("saveMagieSystem: magicAbilities =", data.magieSystem.magicAbilities.length);
            } else if (typeof window.characterMagic !== 'undefined' && Array.isArray(window.characterMagic)) {
                slLog("saveMagieSystem: fallback -> characterMagic vorhanden");
                data.magieSystem.magicAbilities = JSON.parse(JSON.stringify(window.characterMagic));
                slLog("saveMagieSystem: magicAbilities =", data.magieSystem.magicAbilities.length);
            } else {
                slWarn("saveMagieSystem: keine Magie-Quelle gefunden");
                if (!Array.isArray(data.magieSystem.magicAbilities)) data.magieSystem.magicAbilities = [];
            }
        }

        slLog("saveMagieSystem: done");
    } catch (error) {
        slErr("saveMagieSystem: error", error);
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
        }
    }
}

// Hilfsfunktion: Generiert einen Standard-Dateinamen
export function generateStandardFilename(characterName = "") {
    const now = new Date();
    const datePart = now.toLocaleDateString().replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');

    let name = characterName.trim() || "Charakter";
    name = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    return `${name}_${datePart}_${timePart}.json`;
}

// Hauptfunktion: Verarbeitet den Upload einer Datei
export function loadCharacterFile(file: File | null, callbacks: LoadCallbacks = {}) {
    slLog("handleFileUpload: start, file =", file ? `${file.name} (${file.size} bytes)` : null);

    if (!file) {
        slWarn("handleFileUpload: keine Datei ausgewählt");
        return;
    }

    // Schnelle Checks fürs Debugging
    slLog("handleFileUpload: type =", file.type || "(leer)");
    slLog("handleFileUpload: lastModified =", file.lastModified ? new Date(file.lastModified).toISOString() : "(unbekannt)");

    const reader = new FileReader();

    reader.onloadstart = () => slLog("FileReader: loadstart");
    reader.onprogress = (e) => {
        if (e.lengthComputable) slLog("FileReader: progress", `${e.loaded}/${e.total}`);
        else slLog("FileReader: progress", e.loaded);
    };
    reader.onloadend = () => slLog("FileReader: loadend");
    reader.onerror = () => slErr("FileReader: error", reader.error);
    reader.onabort = () => slWarn("FileReader: abort");

    reader.onload = function (e) {
        try {
            const raw = e?.target?.result;
            slLog("FileReader: onload, result type =", typeof raw, "len =", typeof raw === "string" ? raw.length : "n/a");

            // JSON-Daten parsen
            if (typeof raw !== "string") {
                throw new Error("Unerwartetes Dateiformat");
            }
            const data = JSON.parse(raw) as CharacterData;

            // Globale Variablen setzen
            myData = data;
            fileName = file.name;

            // Basis-Validierung + Debug
            slLog("handleFileUpload: JSON keys =", data ? Object.keys(data) : null);
            slLog("handleFileUpload: data.charakter vorhanden =", !!data?.charakter);

            if (!data.charakter) {
                throw new Error("Die Datei enthält keine gültige Charakterstruktur");
            }

            slLog("handleFileUpload: Datei erfolgreich geparst ->", file.name);

            // 1. Magiesystem-Migration (falls nötig)
            migrateToNewMagieSystem(data);

            // 2. Standard-Komponenten laden
            if (typeof initializeWallet === 'function') {
                slLog("handleFileUpload: initializeWallet()");
                initializeWallet(data);
            } else slWarn("handleFileUpload: initializeWallet fehlt");

            if (typeof generateCharakterAttributes === 'function') {
                slLog("handleFileUpload: generateCharakterAttributes()");
                generateCharakterAttributes(data);
            } else slWarn("handleFileUpload: generateCharakterAttributes fehlt");

            if (typeof genCharInfo === 'function') {
                slLog("handleFileUpload: genCharInfo()");
                genCharInfo(data);
            } else slWarn("handleFileUpload: genCharInfo fehlt");

            if (typeof bindHideButtons === 'function') {
                slLog("handleFileUpload: bindHideButtons()");
                bindHideButtons();
            } else slWarn("handleFileUpload: bindHideButtons fehlt");

            // 3. Inventar laden
            if (data.inventory) {
                slLog("handleFileUpload: loadInventory(), items =", data.inventory.length);
                loadInventory(data.inventory);
            } else {
                slLog("handleFileUpload: kein inventory im JSON");
            }

            // 4. Fülle XP, Level, Steigerungspunkte und Gesteigerte explizit
            slLog("handleFileUpload: loadXPAndLevel()");
            loadXPAndLevel(data, callbacks?.onExperienceLoaded);

            if (callbacks?.onMagicLoaded && data.magieSystem) {
                callbacks.onMagicLoaded({
                    advancementPoints: data.magieSystem.advancementPoints ?? 0,
                    magicAbilities: Array.isArray(data.magieSystem.magicAbilities)
                        ? JSON.parse(JSON.stringify(data.magieSystem.magicAbilities))
                        : [],
                });
            }

            // 6. Berechnung aktualisieren
            if (typeof updateCharakterCalculation === 'function') {
                slLog("handleFileUpload: updateCharakterCalculation()");
                updateCharakterCalculation();
            } else slWarn("handleFileUpload: updateCharakterCalculation fehlt");

            if (callbacks?.onFilenameLoaded) {
                callbacks.onFilenameLoaded(file.name);
            }

            slLog("handleFileUpload: done");
        } catch (error) {
            slErr("handleFileUpload: error", error);
            alert("Fehler beim Laden der Datei: " + getErrorMessage(error));
        }
    };

    slLog("handleFileUpload: reader.readAsText()");
    reader.readAsText(file);
}

// Hilfsfunktion: Lädt und befüllt explizit XP, Level, usw.
function loadXPAndLevel(
    data: CharacterData,
    onExperienceLoaded?: (experience: Required<ExperienceOverride>) => void
) {
    try {
        slLog("loadXPAndLevel: start");
        if (data.charakter && data.charakter.werte) {
            const werte = data.charakter.werte;
            slLog("loadXPAndLevel: werte =", {
                xp: werte.xp,
                level: werte.level,
                Steigerungspunkte: werte.Steigerungspunkte,
                Gesteigerte: werte.Gesteigerte
            });

            if (onExperienceLoaded) {
                onExperienceLoaded({
                    xp: werte.xp ?? 0,
                    level: werte.level ?? 0,
                    steigerungspunkte: werte.Steigerungspunkte ?? 0,
                    gesteigerte: werte.Gesteigerte ?? 0,
                });
            }

            slLog("loadXPAndLevel: done");
        } else {
            slWarn("loadXPAndLevel: data.charakter.werte fehlt");
        }
    } catch (error) {
        slErr("loadXPAndLevel: error", error);
    }
}

// Hilfsfunktion: Lädt das Inventar
function loadInventory(inventory: InventoryItem[]) {
    try {
        slLog("loadInventory: start, items =", Array.isArray(inventory) ? inventory.length : "n/a");
        window.inventory = inventory.map(item => {
            return {
                name: item.name,
                quantity: item.quantity || item.count || 0
            };
        });

        slLog("loadInventory: renderInventory()");
        renderInventory();
    } catch (error) {
        slErr("loadInventory: error", error);
    }
}

// Hilfsfunktion: Lädt das Magiesystem
function loadMagieSystem(data: CharacterData) {
    try {
        slLog("loadMagieSystem: start, data.magieSystem =", !!data.magieSystem);

        if (data.magieSystem) {
            slLog("loadMagieSystem: MagicSystem vorhanden =", typeof window.MagicSystem !== 'undefined');
            slLog("loadMagieSystem: magicAbilities in file =", Array.isArray(data.magieSystem.magicAbilities) ? data.magieSystem.magicAbilities.length : "invalid");
            slLog("loadMagieSystem: advancementPoints in file =", data.magieSystem.advancementPoints);

            // ... (restlicher Code unverändert)
            // (deinen vorhandenen Inhalt hier unverändert lassen)
        } else {
            slWarn("loadMagieSystem: keine Magiesystem-Daten in Datei");
            window.characterMagic = [];
            window.advancementPoints = 0;

            if (typeof window.MagicSystem !== 'undefined') {
                window.MagicSystem.syncFromGlobals();
            }
        }
    } catch (error) {
        slErr("loadMagieSystem: error", error);
        window.characterMagic = [];
        window.advancementPoints = 0;

        if (typeof window.MagicSystem !== 'undefined') {
            window.MagicSystem.syncFromGlobals();
        }
    }

    synchronizeToCharacterSheet();
}

// Hilfsfunktion: Aktualisiert die Steigerungspunkte-Anzeige
function updateAdvancementPointsDisplay() {
    try {
        const advancementPointsSpan = document.getElementById('advancement-points');
        slLog("updateAdvancementPointsDisplay: span gefunden =", !!advancementPointsSpan);
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = String(window.advancementPoints ?? "");
        }
    } catch (error) {
        slErr("updateAdvancementPointsDisplay: error", error);
    }
}

// Hilfsfunktion: Synchronisiert Magiedaten zum Charakterbogen
function synchronizeToCharacterSheet() {
    try {
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        slLog("synchronizeToCharacterSheet: input gefunden =", !!steigerungspunkteInput, "AP =", window.advancementPoints);

        if (steigerungspunkteInput instanceof HTMLInputElement && window.advancementPoints !== undefined) {
            steigerungspunkteInput.value = String(window.advancementPoints);

            if (typeof updateCharakterCalculation === 'function') {
                updateCharakterCalculation();
            }
        }
    } catch (error) {
        slErr("synchronizeToCharacterSheet: error", error);
    }
}

// Hilfsfunktion: Migriert alte Daten auf das neue Magiesystem
function migrateToNewMagieSystem(data: CharacterData) {
    try {
        slLog("migrateToNewMagieSystem: start");

        if (!data.magieSystem) {
            data.magieSystem = { advancementPoints: 0, magicAbilities: [] };
            slLog("migrateToNewMagieSystem: magieSystem erstellt");
        }

        if (!Array.isArray(data.magieSystem.magicAbilities)) {
            data.magieSystem.magicAbilities = [];
            slLog("migrateToNewMagieSystem: magicAbilities array erstellt");
        }

        const hasOld = !!(data.charakter && data.charakter.Magische_Elemente);
        slLog("migrateToNewMagieSystem: alte Struktur vorhanden =", hasOld);

        if (hasOld) {
            if (data.magieSystem.advancementPoints === 0 && data.charakter.werte &&
                data.charakter.werte.Steigerungspunkte !== undefined) {
                data.magieSystem.advancementPoints = data.charakter.werte.Steigerungspunkte;
                slLog("migrateToNewMagieSystem: AP migriert =", data.magieSystem.advancementPoints);
            }

            if (data.magieSystem.magicAbilities.length === 0 && data.charakter.Magische_Elemente) {
                for (const [element, level] of Object.entries(data.charakter.Magische_Elemente)) {
                    if (typeof level === "number" && level > 0) {
                        data.magieSystem.magicAbilities.push({ element, type: 'Angriff', level });
                    }
                }
                slLog("migrateToNewMagieSystem: abilities migriert =", data.magieSystem.magicAbilities.length);

                delete data.charakter.Magische_Elemente;
                slLog("migrateToNewMagieSystem: alte Struktur gelöscht");
            }
        }

        slLog("migrateToNewMagieSystem: done");
    } catch (error) {
        slErr("migrateToNewMagieSystem: error", error);
    }
}
