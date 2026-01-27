// @ts-nocheck

// saveLoader.tsx - Einheitliches Speicher- und Ladesystem
import { readNumericInput, readTextInput, writeInputValue } from "./characterState";

// Globale Variablen
let myData = null;
let fileName = null;

// Kleine Debug-Helper
const SL_DEBUG = true; // bei Bedarf auf false
const slLog = (...args) => SL_DEBUG && console.log("[SaveLoader]", ...args);
const slWarn = (...args) => SL_DEBUG && console.warn("[SaveLoader]", ...args);
const slErr = (...args) => SL_DEBUG && console.error("[SaveLoader]", ...args);

const initializeSaveLoader = () => {
    slLog("Init: Speicher- und Ladesystem startet");
    slLog("Init: document.readyState =", document.readyState);

    // Initialisiere Event-Listener
    setupEventListeners();
};

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', () => {
        slLog("DOMContentLoaded: fired");
        initializeSaveLoader();
    });
} else {
    initializeSaveLoader();
}

// Einrichtung der Event-Listener
function setupEventListeners() {
    slLog("setupEventListeners: start");
    // Entferne alle möglicherweise bestehenden Event-Listener
    removeExistingListeners();

    // Speichern-Button
    const saveButton = document.getElementById('saveButton');
    slLog("setupEventListeners: saveButton gefunden =", !!saveButton);
    if (saveButton) {
        saveButton.addEventListener('click', function (event) {
            slLog("UI: saveButton click");
            event.preventDefault();

            if (myData) {
                slLog("UI: saveButton -> myData vorhanden, speichere...");
                saveCharacterData(myData);
            } else {
                slWarn("UI: saveButton -> myData fehlt");
                alert("Es wurden noch keine Charakterdaten geladen!");
            }
        });
    }

    // Datei-Input
    const fileInput = document.getElementById('fileInput');
    slLog("setupEventListeners: fileInput gefunden =", !!fileInput);
    if (fileInput) {
        fileInput.addEventListener('change', function (event) {
            slLog("UI: fileInput change");
            handleFileUpload(event);
        });
    }

    // Dateiname-Generator-Button
    const generateFilenameButton = document.getElementById('generateFilenameButton');
    slLog("setupEventListeners: generateFilenameButton gefunden =", !!generateFilenameButton);
    if (generateFilenameButton) {
        generateFilenameButton.addEventListener('click', function () {
            slLog("UI: generateFilenameButton click");
            const nameInput = document.getElementById('name');
            const characterName = nameInput ? nameInput.value.trim() : '';
            slLog("UI: generateFilenameButton -> characterName =", characterName || "(leer)");

            const filenameInput = document.getElementById('filenameInput');
            slLog("UI: generateFilenameButton -> filenameInput gefunden =", !!filenameInput);
            if (filenameInput) {
                filenameInput.value = generateStandardFilename(characterName);
                slLog("UI: generateFilenameButton -> gesetzt auf", filenameInput.value);
            }
        });
    }

    slLog("setupEventListeners: done");
}

// Entfernt alle existierenden Event-Listener durch Klonen der Elemente
function removeExistingListeners() {
    slLog("removeExistingListeners: start");

    // Speichern-Button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        const newSaveButton = saveButton.cloneNode(true);
        if (saveButton.parentNode) {
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        }
        slLog("removeExistingListeners: saveButton ersetzt");
    } else {
        slLog("removeExistingListeners: saveButton nicht vorhanden");
    }

    // Datei-Input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const newFileInput = fileInput.cloneNode(true);
        if (fileInput.parentNode) {
            fileInput.parentNode.replaceChild(newFileInput, fileInput);
        }
        slLog("removeExistingListeners: fileInput ersetzt");
    } else {
        slLog("removeExistingListeners: fileInput nicht vorhanden");
    }

    // Dateiname-Generator-Button
    const generateFilenameButton = document.getElementById('generateFilenameButton');
    if (generateFilenameButton) {
        const newGenerateButton = generateFilenameButton.cloneNode(true);
        if (generateFilenameButton.parentNode) {
            generateFilenameButton.parentNode.replaceChild(newGenerateButton, generateFilenameButton);
        }
        slLog("removeExistingListeners: generateFilenameButton ersetzt");
    } else {
        slLog("removeExistingListeners: generateFilenameButton nicht vorhanden");
    }

    slLog("removeExistingListeners: done");
}

// Hauptfunktion zum Speichern der Charakterdaten
function saveCharacterData(data) {
    try {
        slLog("saveCharacterData: start");
        const charakter = data.charakter;

        // 1. Charakterinfo aktualisieren
        if (charakter.charakterInfo) {
            slLog("saveCharacterData: updateCharakterInfo");
            updateCharakterInfo(charakter.charakterInfo);
        } else {
            slWarn("saveCharacterData: charakter.charakterInfo fehlt");
        }

        // 2. XP und Level separat aktualisieren, damit sie nicht verloren gehen
        if (charakter.werte) {
            slLog("saveCharacterData: werte vorhanden, lese XP/Level Inputs");
            const xpInput = document.getElementById('erfahrung_xp');
            const levelInput = document.getElementById('erfahrung_level');
            const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
            const gesteigerteInput = document.getElementById('erfahrung_Gesteigerte');

            if (xpInput) charakter.werte.xp = readNumericInput('erfahrung_xp', 0);
            if (levelInput) charakter.werte.level = readNumericInput('erfahrung_level', 0);
            if (steigerungspunkteInput) charakter.werte.Steigerungspunkte = readNumericInput('erfahrung_Steigerungspunkte', 0);
            if (gesteigerteInput) charakter.werte.Gesteigerte = readNumericInput('erfahrung_Gesteigerte', 0);

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
        if (charakter.geld && typeof wallet !== 'undefined') {
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
        saveMagieSystem(data);

        // 7. JSON erstellen und herunterladen
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Dateinamen bestimmen
        const filenameInput = document.getElementById('filenameInput');
        let filename = filenameInput ? filenameInput.value.trim() : '';

        if (!filename) {
            filename = generateStandardFilename(charakter.charakterInfo ? charakter.charakterInfo.name : '');
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
        alert("Fehler beim Speichern: " + error.message);
    }
}

// Hilfsfunktion: Sanitize Key (Ersetzt Leerzeichen durch Unterstriche)
function sanitizeKey(key) {
    return key.replace(/\s+/g, '_');
}

// Hilfsfunktion: Aktualisiert Charakterinfo
function updateCharakterInfo(charakterInfo) {
    charakterInfo.name = readTextInput('name');
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
function updateSectionValues(section, sectionId) {
    slLog("updateSectionValues:", sectionId);
    const specialSections = ['Assassinen_Talente', 'Talente_1', 'Talente_2', 'Handwerkstalente'];

    if (specialSections.includes(sectionId)) {
        updateSpecialSection(section, sectionId);
    } else {
        for (let key in section) {
            if (Array.isArray(section[key])) {
                section[key] = [];
                let index = 0;
                let input;
                const sanitizedKey = sanitizeKey(key);

                while ((input = document.getElementById(`${sectionId}_${sanitizedKey}_${index}`)) !== null) {
                    section[key].push(parseFloat(input.value) || 0);
                    index++;
                }
            } else {
                const sanitizedKey = sanitizeKey(key);
                const input = document.getElementById(`${sectionId}_${sanitizedKey}`);

                if (input) {
                    const parsedValue = parseFloat(input.value);
                    section[key] = isNaN(parsedValue) ? input.value : parsedValue;
                }
            }
        }
    }
}

// Hilfsfunktion: Aktualisiert spezielle Sektionen (Talente)
function updateSpecialSection(section, sectionId) {
    slLog("updateSpecialSection:", sectionId, "items =", Array.isArray(section) ? section.length : "n/a");
    section.forEach((item) => {
        const key = sanitizeKey(item.Name);
        const input = document.getElementById(`${sectionId}_${key}`);

        if (input) {
            const parsedValue = parseFloat(input.value);
            item.Wert = isNaN(parsedValue) ? input.value : parsedValue;
        }
    });
}

// Hilfsfunktion: Speichert das Inventar
function saveInventory() {
    try {
        const inventory = [];
        const items = document.querySelectorAll('#inventory li');
        slLog("saveInventory: DOM items =", items.length);

        items.forEach(item => {
            const text = item.textContent;
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
function saveMagieSystem(data) {
    try {
        slLog("saveMagieSystem: start");

        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
            slLog("saveMagieSystem: magieSystem init");
        }

        if (typeof window.advancementPoints === 'number') {
            data.magieSystem.advancementPoints = window.advancementPoints;
            slLog("saveMagieSystem: AP aus global =", window.advancementPoints);
        } else {
            const steigerungspunkteInput = document.getElementById("erfahrung_Steigerungspunkte");
            if (steigerungspunkteInput) {
                data.magieSystem.advancementPoints = parseInt(steigerungspunkteInput.value) || 0;
                slLog("saveMagieSystem: AP aus DOM =", data.magieSystem.advancementPoints);
            } else {
                slWarn("saveMagieSystem: keine AP Quelle gefunden");
            }
        }

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
function generateStandardFilename(characterName = "") {
    const now = new Date();
    const datePart = now.toLocaleDateString().replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');

    let name = characterName.trim() || "Charakter";
    name = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    return `${name}_${datePart}_${timePart}.json`;
}

// Hauptfunktion: Verarbeitet den Upload einer Datei
function handleFileUpload(event) {
    const file = event.target.files?.[0];
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
            slLog("FileReader: onload, result type =", typeof raw, "len =", raw?.length ?? "n/a");

            // JSON-Daten parsen
            const data = JSON.parse(raw);

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

            // 4. Magiesystem laden
            slLog("handleFileUpload: loadMagieSystem()");
            loadMagieSystem(data);

            // 5. Fülle XP, Level, Steigerungspunkte und Gesteigerte explizit
            slLog("handleFileUpload: loadXPAndLevel()");
            loadXPAndLevel(data);

            // 6. Berechnung aktualisieren
            if (typeof updateCharakterCalculation === 'function') {
                slLog("handleFileUpload: updateCharakterCalculation()");
                updateCharakterCalculation();
            } else slWarn("handleFileUpload: updateCharakterCalculation fehlt");

            // 7. Dateinamen aktualisieren
            const filenameInput = document.getElementById('filenameInput');
            slLog("handleFileUpload: filenameInput gefunden =", !!filenameInput);
            if (filenameInput) {
                filenameInput.value = file.name;
                slLog("handleFileUpload: filenameInput gesetzt =", filenameInput.value);
            }

            slLog("handleFileUpload: done");
        } catch (error) {
            slErr("handleFileUpload: error", error);
            alert("Fehler beim Laden der Datei: " + error.message);
        }
    };

    slLog("handleFileUpload: reader.readAsText()");
    reader.readAsText(file);
}

// Hilfsfunktion: Lädt und befüllt explizit XP, Level, usw.
function loadXPAndLevel(data) {
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

            const xpInput = document.getElementById('erfahrung_xp');
            const levelInput = document.getElementById('erfahrung_level');
            const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
            const gesteigerteInput = document.getElementById('erfahrung_Gesteigerte');

            if (xpInput && werte.xp !== undefined) writeInputValue('erfahrung_xp', werte.xp);
            if (levelInput && werte.level !== undefined) writeInputValue('erfahrung_level', werte.level);
            if (steigerungspunkteInput && werte.Steigerungspunkte !== undefined) writeInputValue('erfahrung_Steigerungspunkte', werte.Steigerungspunkte);
            if (gesteigerteInput && werte.Gesteigerte !== undefined) writeInputValue('erfahrung_Gesteigerte', werte.Gesteigerte);

            slLog("loadXPAndLevel: done");
        } else {
            slWarn("loadXPAndLevel: data.charakter.werte fehlt");
        }
    } catch (error) {
        slErr("loadXPAndLevel: error", error);
    }
}

// Hilfsfunktion: Lädt das Inventar
function loadInventory(inventory) {
    try {
        slLog("loadInventory: start, items =", Array.isArray(inventory) ? inventory.length : "n/a");
        window.inventory = inventory.map(item => {
            return {
                name: item.name,
                quantity: item.quantity || item.count || 0
            };
        });

        if (typeof renderInventory === 'function') {
            slLog("loadInventory: renderInventory()");
            renderInventory();
        } else {
            slWarn("loadInventory: renderInventory fehlt");
        }
    } catch (error) {
        slErr("loadInventory: error", error);
    }
}

// Hilfsfunktion: Lädt das Magiesystem
function loadMagieSystem(data) {
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
            advancementPointsSpan.textContent = window.advancementPoints;
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

        if (steigerungspunkteInput && window.advancementPoints !== undefined) {
            steigerungspunkteInput.value = window.advancementPoints;

            if (typeof updateCharakterCalculation === 'function') {
                updateCharakterCalculation();
            }
        }
    } catch (error) {
        slErr("synchronizeToCharacterSheet: error", error);
    }
}

// Hilfsfunktion: Migriert alte Daten auf das neue Magiesystem
function migrateToNewMagieSystem(data) {
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

            if (data.magieSystem.magicAbilities.length === 0) {
                for (const [element, level] of Object.entries(data.charakter.Magische_Elemente)) {
                    if (level > 0) {
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
