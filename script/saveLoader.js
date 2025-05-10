// ANLEITUNG:
// 1. Erstellen Sie eine neue Datei namens "saveLoader.js" im "script"-Verzeichnis
// 2. Kopieren Sie den gesamten unten stehenden Code in diese Datei
// 3. Entfernen Sie aus Ihrer index.html jede Zeile mit:
//    - "saveChanges.js"
//    - "fileReader.js" 
//    - "unifiedSaveSystem.js"
// 4. Fügen Sie stattdessen am Ende Ihrer Script-Tags ein:
//    <script src="./script/saveLoader.js"></script>

// saveLoader.js - Einheitliches Speicher- und Ladesystem

// Globale Variablen
let myData = null;
let fileName = null;

// Warte auf DOM-Bereitschaft
document.addEventListener('DOMContentLoaded', function() {
    console.log("SaveLoader: Initialisiere Speicher- und Ladesystem...");
    
    // Initialisiere Event-Listener
    setupEventListeners();
});

// Einrichtung der Event-Listener
function setupEventListeners() {
    // Entferne alle möglicherweise bestehenden Event-Listener
    removeExistingListeners();
    
    // Speichern-Button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function(event) {
            console.log("SaveLoader: Speichern-Button geklickt");
            event.preventDefault();
            
            if (myData) {
                saveCharacterData(myData);
            } else {
                console.warn("SaveLoader: Keine Daten zum Speichern vorhanden");
                alert("Es wurden noch keine Charakterdaten geladen!");
            }
        });
    }
    
    // Datei-Input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            console.log("SaveLoader: Datei ausgewählt für Upload");
            handleFileUpload(event);
        });
    }
    
    // Dateiname-Generator-Button
    const generateFilenameButton = document.getElementById('generateFilenameButton');
    if (generateFilenameButton) {
        generateFilenameButton.addEventListener('click', function() {
            console.log("SaveLoader: Generiere Standard-Dateinamen");
            const nameInput = document.getElementById('name');
            const characterName = nameInput ? nameInput.value.trim() : '';
            
            const filenameInput = document.getElementById('filenameInput');
            if (filenameInput) {
                filenameInput.value = generateStandardFilename(characterName);
            }
        });
    }
    
    console.log("SaveLoader: Event-Listener erfolgreich eingerichtet");
}

// Entfernt alle existierenden Event-Listener durch Klonen der Elemente
function removeExistingListeners() {
    // Speichern-Button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        const newSaveButton = saveButton.cloneNode(true);
        if (saveButton.parentNode) {
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        }
    }
    
    // Datei-Input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const newFileInput = fileInput.cloneNode(true);
        if (fileInput.parentNode) {
            fileInput.parentNode.replaceChild(newFileInput, fileInput);
        }
    }
    
    // Dateiname-Generator-Button
    const generateFilenameButton = document.getElementById('generateFilenameButton');
    if (generateFilenameButton) {
        const newGenerateButton = generateFilenameButton.cloneNode(true);
        if (generateFilenameButton.parentNode) {
            generateFilenameButton.parentNode.replaceChild(newGenerateButton, generateFilenameButton);
        }
    }
}

// Hauptfunktion zum Speichern der Charakterdaten
function saveCharacterData(data) {
    try {
        console.log("SaveLoader: Speichere Charakterdaten...");
        const charakter = data.charakter;

        // 1. Charakterinfo aktualisieren
        if (charakter.charakterInfo) {
            updateCharakterInfo(charakter.charakterInfo);
        }

        // 2. Fähigkeiten aktualisieren
        if (charakter.fähigkeiten) {
            const fähigkeiten = charakter.fähigkeiten;
            
            if (fähigkeiten.modifier) updateSectionValues(fähigkeiten.modifier, 'modifier');
            if (charakter.werte) updateSectionValues(charakter.werte, 'erfahrung');
            if (fähigkeiten.sonderwerte) updateSectionValues(fähigkeiten.sonderwerte, 'sonderwerte');
            if (fähigkeiten.attribute) updateSectionValues(fähigkeiten.attribute, 'attribute');
            if (fähigkeiten.Assassinen_Talente) updateSectionValues(fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
            if (fähigkeiten.Talente_1) updateSectionValues(fähigkeiten.Talente_1, 'Talente_1');
            if (fähigkeiten.Talente_2) updateSectionValues(fähigkeiten.Talente_2, 'Talente_2');
            if (fähigkeiten.KampfBasiswerte) updateSectionValues(fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
            if (fähigkeiten.Kampf_Talente) updateSectionValues(fähigkeiten.Kampf_Talente, 'Kampf_Talente');
            if (fähigkeiten.Handwerkstalente) updateSectionValues(fähigkeiten.Handwerkstalente, 'Handwerkstalente');
            if (fähigkeiten.Gespeicherte_Kampftalente) updateSectionValues(fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        }

        // 3. Geldbeutel aktualisieren
        if (charakter.geld && typeof wallet !== 'undefined') {
            charakter.geld = JSON.parse(JSON.stringify(wallet));
        }

        // 4. Inventar speichern
        data.inventory = saveInventory();
        
        // 5. Magiesystem speichern
        saveMagieSystem(data);

        // 6. JSON erstellen und herunterladen
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Dateinamen bestimmen
        const filenameInput = document.getElementById('filenameInput');
        let filename = filenameInput ? filenameInput.value.trim() : '';
        
        if (!filename) {
            filename = generateStandardFilename(charakter.charakterInfo ? charakter.charakterInfo.name : '');
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
        
        console.log("SaveLoader: Charakterdaten erfolgreich gespeichert als", filename);
    } catch (error) {
        console.error("SaveLoader Fehler beim Speichern:", error);
        alert("Fehler beim Speichern: " + error.message);
    }
}

// Hilfsfunktion: Sanitize Key (Ersetzt Leerzeichen durch Unterstriche)
function sanitizeKey(key) {
    return key.replace(/\s+/g, '_');
}

// Hilfsfunktion: Aktualisiert Charakterinfo
function updateCharakterInfo(charakterInfo) {
    const getIdValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
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

// Hilfsfunktion: Aktualisiert Sektionswerte
function updateSectionValues(section, sectionId) {
    const specialSections = ['Assassinen_Talente', 'Talente_1', 'Talente_2', 'Handwerkstalente'];

    if (specialSections.includes(sectionId)) {
        updateSpecialSection(section, sectionId);
    } else {
        for (let key in section) {
            if (Array.isArray(section[key])) {
                // Array-Werte aktualisieren (z.B. Kampf_Talente)
                section[key] = [];
                let index = 0;
                let input;
                const sanitizedKey = sanitizeKey(key);
                
                while ((input = document.getElementById(`${sectionId}_${sanitizedKey}_${index}`)) !== null) {
                    section[key].push(parseFloat(input.value) || 0);
                    index++;
                }
            } else {
                // Einfache Werte aktualisieren
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
        console.error("SaveLoader Fehler beim Speichern des Inventars:", error);
        return [];
    }
}

// Hilfsfunktion: Speichert das Magiesystem
function saveMagieSystem(data) {
    try {
        console.log("SaveLoader: Speichere Magiesystem-Daten...");
        
        // Sicherstellen, dass die magieSystem-Struktur existiert
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
        }
        
        // 1. Versuche Steigerungspunkte zu speichern
        // Priorität: globale Variable > DOM-Element
        if (typeof window.advancementPoints === 'number') {
            data.magieSystem.advancementPoints = window.advancementPoints;
            console.log("SaveLoader: Steigerungspunkte aus globaler Variable gespeichert:", window.advancementPoints);
        } else {
            const steigerungspunkteInput = document.getElementById("erfahrung_Steigerungspunkte");
            if (steigerungspunkteInput) {
                data.magieSystem.advancementPoints = parseInt(steigerungspunkteInput.value) || 0;
                console.log("SaveLoader: Steigerungspunkte aus DOM gespeichert:", data.magieSystem.advancementPoints);
            } else {
                console.warn("SaveLoader: Keine Steigerungspunkte gefunden");
            }
        }
        
        // 2. Versuche Magie-Fähigkeiten zu speichern
        // Priorität: globale Variable > vorhandene Daten
        if (typeof window.characterMagic !== 'undefined' && Array.isArray(window.characterMagic)) {
            // Tiefe Kopie erstellen
            data.magieSystem.magicAbilities = JSON.parse(JSON.stringify(window.characterMagic));
            console.log("SaveLoader: Magie-Fähigkeiten gespeichert:", data.magieSystem.magicAbilities.length);
        } else {
            console.warn("SaveLoader: Keine characterMagic-Variable gefunden");
            // Bestehende Daten beibehalten oder leeres Array verwenden
            if (!Array.isArray(data.magieSystem.magicAbilities)) {
                data.magieSystem.magicAbilities = [];
            }
        }
        
        // Ausgabe für Debug-Zwecke
        console.log("SaveLoader: Magiesystem-Daten:", JSON.stringify(data.magieSystem));
    } catch (error) {
        console.error("SaveLoader Fehler beim Speichern des Magiesystems:", error);
        
        // Bei Fehler sicherstellen, dass ein gültiges Objekt existiert
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
    // Leerzeichen durch Unterstriche ersetzen, Sonderzeichen entfernen
    name = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    
    return `${name}_${datePart}_${timePart}.json`;
}

// Hauptfunktion: Verarbeitet den Upload einer Datei
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        console.warn("SaveLoader: Keine Datei ausgewählt");
        return;
    }

    console.log("SaveLoader: Lade Datei:", file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // JSON-Daten parsen
            const data = JSON.parse(e.target.result);
            
            // Globale Variablen setzen
            myData = data;
            fileName = file.name;

            // Grundlegende Validierung
            if (!data.charakter) {
                throw new Error("Die Datei enthält keine gültige Charakterstruktur");
            }

            console.log("SaveLoader: Datei erfolgreich geladen");

            // 1. Magiesystem-Migration (falls nötig)
            migrateToNewMagieSystem(data);

            // 2. Standard-Komponenten laden
            if (typeof initializeWallet === 'function') {
                initializeWallet(data);
            }
            
            if (typeof generateCharakterAttributes === 'function') {
                generateCharakterAttributes(data);
            }
            
            if (typeof genCharInfo === 'function') {
                genCharInfo(data);
            }
            
            if (typeof bindHideButtons === 'function') {
                bindHideButtons();
            }

            // 3. Inventar laden
            if (data.inventory) {
                loadInventory(data.inventory);
            }

            // 4. Magiesystem laden
            loadMagieSystem(data);

            // 5. Berechnung aktualisieren
            if (typeof updateCharakterCalculation === 'function') {
                updateCharakterCalculation();
            }

            // 6. Dateinamen aktualisieren
            const filenameInput = document.getElementById('filenameInput');
            if (filenameInput) {
                filenameInput.value = file.name;
            }
            
            console.log("SaveLoader: Alle Daten erfolgreich geladen");
        } catch (error) {
            console.error("SaveLoader Fehler beim Laden der Datei:", error);
            alert("Fehler beim Laden der Datei: " + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Hilfsfunktion: Lädt das Inventar
function loadInventory(inventory) {
    try {
        // Globales Inventar aktualisieren
        window.inventory = inventory.map(item => {
            return {
                name: item.name,
                quantity: item.quantity || item.count || 0
            };
        });
        
        // Inventar-Anzeige aktualisieren (falls Funktion verfügbar)
        if (typeof renderInventory === 'function') {
            renderInventory();
        }
    } catch (error) {
        console.error("SaveLoader Fehler beim Laden des Inventars:", error);
    }
}

// Hilfsfunktion: Lädt das Magiesystem
function loadMagieSystem(data) {
    try {
        console.log("SaveLoader: Lade Magiesystem-Daten...");
        
        if (data.magieSystem) {
            // 1. Magie-Fähigkeiten laden
            if (Array.isArray(data.magieSystem.magicAbilities)) {
                // Globale Variable aktualisieren (tiefe Kopie)
                window.characterMagic = JSON.parse(JSON.stringify(data.magieSystem.magicAbilities));
                console.log("SaveLoader: Magie-Fähigkeiten geladen:", window.characterMagic.length);
            } else {
                console.warn("SaveLoader: Keine gültigen Magie-Fähigkeiten in der Datei");
                window.characterMagic = [];
            }
            
            // 2. Steigerungspunkte laden
            window.advancementPoints = data.magieSystem.advancementPoints || 0;
            console.log("SaveLoader: Steigerungspunkte geladen:", window.advancementPoints);
            
            // 3. Versuche die UI zu aktualisieren
            
            // Magie-Liste aktualisieren
            if (typeof window.renderMagicList === 'function') {
                window.renderMagicList();
                console.log("SaveLoader: Magie-Liste aktualisiert");
            } else {
                console.warn("SaveLoader: renderMagicList Funktion nicht verfügbar");
            }
            
            // Vorschau aktualisieren
            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
                console.log("SaveLoader: Vorschau aktualisiert");
            } else {
                console.warn("SaveLoader: updatePreview Funktion nicht verfügbar");
            }
            
            // Steigerungspunkte-Anzeige aktualisieren
            updateAdvancementPointsDisplay();
            
            // Ausgabe für Debug-Zwecke
            console.log("SaveLoader: Magie geladen:", JSON.stringify({
                advancementPoints: window.advancementPoints,
                abilitiesCount: window.characterMagic.length
            }));
        } else {
            console.warn("SaveLoader: Keine Magiesystem-Daten in der Datei");
            // Standardwerte setzen
            window.characterMagic = [];
            window.advancementPoints = 0;
        }
    } catch (error) {
        console.error("SaveLoader Fehler beim Laden des Magiesystems:", error);
        // Standardwerte setzen
        window.characterMagic = [];
        window.advancementPoints = 0;
    }
    
    // Steigerungspunkte zum Charakterbogen synchronisieren
    synchronizeToCharacterSheet();
}

// Hilfsfunktion: Aktualisiert die Steigerungspunkte-Anzeige
function updateAdvancementPointsDisplay() {
    try {
        // Im Magie-Tab
        const advancementPointsSpan = document.getElementById('advancement-points');
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = window.advancementPoints;
            console.log("SaveLoader: Steigerungspunkte-Anzeige im Magie-Tab aktualisiert");
        }
    } catch (error) {
        console.error("SaveLoader Fehler beim Aktualisieren der Steigerungspunkte-Anzeige:", error);
    }
}

// Hilfsfunktion: Synchronisiert Magiedaten zum Charakterbogen
function synchronizeToCharacterSheet() {
    try {
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput && window.advancementPoints !== undefined) {
            steigerungspunkteInput.value = window.advancementPoints;
            console.log("SaveLoader: Steigerungspunkte zum Charakterbogen synchronisiert:", window.advancementPoints);
            
            // Berechnung aktualisieren
            if (typeof updateCharakterCalculation === 'function') {
                updateCharakterCalculation();
            }
        }
    } catch (error) {
        console.error("SaveLoader Fehler bei der Synchronisation zum Charakterbogen:", error);
    }
}

// Hilfsfunktion: Migriert alte Daten auf das neue Magiesystem
function migrateToNewMagieSystem(data) {
    try {
        console.log("SaveLoader: Prüfe auf Notwendigkeit einer Magiesystem-Migration...");
        
        // Sicherstellen, dass magieSystem existiert
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
            console.log("SaveLoader: Neue Magiesystem-Struktur erstellt");
        }
        
        // Falls ein existierendes magieSystem keinen magicAbilities-Array hat
        if (!Array.isArray(data.magieSystem.magicAbilities)) {
            data.magieSystem.magicAbilities = [];
            console.log("SaveLoader: Leeren magicAbilities-Array erstellt");
        }
        
        // Falls alte Struktur vorhanden
        if (data.charakter && data.charakter.Magische_Elemente) {
            console.log("SaveLoader: Alte Magische_Elemente-Struktur gefunden, Migration wird durchgeführt");
            
            // Setze Steigerungspunkte, falls noch nicht gesetzt
            if (data.magieSystem.advancementPoints === 0 && data.charakter.werte && 
                data.charakter.werte.Steigerungspunkte !== undefined) {
                data.magieSystem.advancementPoints = data.charakter.werte.Steigerungspunkte;
                console.log("SaveLoader: Steigerungspunkte migriert:", data.magieSystem.advancementPoints);
            }
            
            // Konvertiere die alten Magischen Elemente, falls das neue Array leer ist
            if (data.magieSystem.magicAbilities.length === 0) {
                for (const [element, level] of Object.entries(data.charakter.Magische_Elemente)) {
                    if (level > 0) {
                        data.magieSystem.magicAbilities.push({
                            element,
                            type: 'Angriff', // Standard-Typ für die Konvertierung
                            level
                        });
                    }
                }
                
                console.log("SaveLoader: Magie-Fähigkeiten migriert:", data.magieSystem.magicAbilities.length);
                
                // Alte Struktur entfernen
                delete data.charakter.Magische_Elemente;
                console.log("SaveLoader: Alte Magiestruktur entfernt");
            }
        } else {
            console.log("SaveLoader: Keine alte Magiestruktur gefunden, keine Migration nötig");
        }
    } catch (error) {
        console.error("SaveLoader Fehler bei der Magiesystem-Migration:", error);
    }
}