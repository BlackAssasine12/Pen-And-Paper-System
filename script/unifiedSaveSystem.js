// unifiedSaveSystem.js - Einheitliches Speicher- und Ladesystem für Charaktere und Magie

/**
 * Hauptfunktion zum Speichern aller Charakterdaten
 * Diese Funktion ersetzt die vorhandene saveChanges-Funktion
 */
function saveChanges(data) {
    try {
        const charakter = data.charakter;

        // 1. Charakterinfos aktualisieren
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

        // 3. Magie-System-Daten speichern
        saveMagieSystem(data);

        // 4. Geld-Objekt aktualisieren
        if (charakter.geld) {
            charakter.geld = { ...wallet };
        }

        // 5. Inventar speichern
        data.inventory = saveInventory();

        // 6. JSON erstellen und Download anbieten
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Den Dateinamen aus dem Eingabefeld holen oder einen Standardnamen generieren
        const filenameInput = document.getElementById('filenameInput');
        let filename = filenameInput.value.trim();
        
        // Wenn kein Name eingegeben wurde, Standardnamen erzeugen
        if (!filename) {
            filename = generateStandardFilename(charakter.charakterInfo.name);
        }
        
        // Sicherstellen, dass die Datei eine .json-Endung hat
        if (!filename.toLowerCase().endsWith('.json')) {
            filename += '.json';
        }

        // Download starten
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log("Alle Daten erfolgreich gespeichert:", filename);
    } catch (error) {
        console.error("Fehler beim Speichern der Daten:", error);
        alert("Fehler beim Speichern: " + error.message);
    }
}

/**
 * Aktualisiert die Werte eines Abschnitts im Datenmodell
 */
function updateSectionValues(section, sectionId) {
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
                    section[key].push(parseFloat(input.value));
                    index++;
                }
            } else {
                const sanitizedKey = sanitizeKey(key);
                const input = document.getElementById(`${sectionId}_${sanitizedKey}`);
                if (input) {
                    // Überprüfen, ob der Wert eine Zahl ist
                    const parsedValue = parseFloat(input.value);
                    section[key] = isNaN(parsedValue) ? input.value : parsedValue;
                }
            }
        }
    }
}

/**
 * Aktualisiert spezielle Abschnitte wie Talente
 */
function updateSpecialSection(section, sectionId) {
    section.forEach((item, index) => {
        const key = sanitizeKey(item.Name);
        const input = document.getElementById(`${sectionId}_${key}`);
        if (input) {
            const parsedValue = parseFloat(input.value);
            item.Wert = isNaN(parsedValue) ? input.value : parsedValue;
        }
    });
}

/**
 * Hilfsfunktion zur Ersetzung von Leerzeichen durch Unterstriche
 */
function sanitizeKey(key) {
    return key.replace(/\s+/g, '_');
}

/**
 * Aktualisiert die Charakterinfo-Daten
 */
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

/**
 * Speichert die Magie-Daten in das Datenmodell
 */
function saveMagieSystem(data) {
    // Falls die magieSystem-Variable nicht existiert, erstellen wir sie
    if (!data.magieSystem) {
        data.magieSystem = {
            advancementPoints: 0,
            magicAbilities: []
        };
    }
    
    // Speichere die Steigerungspunkte
    const steigerungspunkteInput = document.getElementById("erfahrung_Steigerungspunkte");
    if (steigerungspunkteInput) {
        data.magieSystem.advancementPoints = parseInt(steigerungspunkteInput.value) || 0;
    }
    
    // Speichere die Magischen Fähigkeiten, wenn die globale Variable existiert
    if (window.characterMagic && Array.isArray(window.characterMagic)) {
        data.magieSystem.magicAbilities = window.characterMagic;
    }
}

/**
 * Speichert das Inventar
 */
function saveInventory() {
    const inventory = [];
    const items = document.querySelectorAll('#inventory li');
    items.forEach(item => {
        const text = item.textContent;
        const [name, quantity] = text.split(' - ');
        inventory.push({ 
            name, 
            quantity: parseInt(quantity.replace('x', '')) 
        });
    });
    return inventory;
}

/**
 * Hauptfunktion zum Laden aller Charakterdaten
 * Diese Funktion integriert das Laden von Charakter- und Magiedaten
 */
function loadCharacterData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // JSON-Daten parsen
            const data = JSON.parse(e.target.result);
            myData = data; // Für globalen Zugriff
            fileName = file.name;

            // Überprüfe die Struktur der Datei
            if (!data.charakter) {
                throw new Error("Die Datei enthält keine gültige Charakterstruktur");
            }

            console.log("Datei erfolgreich geladen:", fileName);

            // 1. Datenmigration für das neue Magiesystem falls nötig
            migrateToNewMagieSystem(data);

            // 2. Lade die verschiedenen Bereiche des Charakters
            initializeWallet(data);
            generateCharakterAttributes(data);
            genCharInfo(data);
            bindHideButtons();

            // 3. Inventar laden
            if (data.inventory) {
                window.inventory = data.inventory; // Inventory-Objekt aktualisieren
                loadInventory(data.inventory);
            }

            // 4. Magiesystem laden
            loadMagieSystem(data);

            // 5. Berechnung aktualisieren erst nach dem Laden aller Daten
            updateCharakterCalculation();

            // 6. Dateinamen aktualisieren
            const filenameInput = document.getElementById('filenameInput');
            if (filenameInput && file) {
                filenameInput.value = file.name;
            }

        } catch (error) {
            console.error("Fehler beim Laden der Datei:", error);
            alert("Fehler beim Laden der Datei: " + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Funktion zur Migration alter Daten auf das neue Magiesystem
 */
function migrateToNewMagieSystem(data) {
    try {
        // Stelle sicher, dass magieSystem existiert
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
        }
        
        // Falls alte Struktur vorhanden
        if (data.charakter && data.charakter.Magische_Elemente) {
            // Setze Steigerungspunkte, falls noch nicht gesetzt
            if (data.magieSystem.advancementPoints === 0 && data.charakter.werte && 
                data.charakter.werte.Steigerungspunkte !== undefined) {
                data.magieSystem.advancementPoints = data.charakter.werte.Steigerungspunkte;
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
                
                // Alte Struktur entfernen
                delete data.charakter.Magische_Elemente;
                
                console.log('Magiesystem erfolgreich migriert');
            }
        }
    } catch (error) {
        console.error("Fehler bei der Migration des Magiesystems:", error);
    }
}

/**
 * Inventar laden
 */
function loadInventory(inventory) {
    try {
        window.inventory = inventory.map(item => {
            return {
                name: item.name,
                quantity: item.quantity || item.count || 0
            };
        });
        renderInventory();
    } catch (error) {
        console.error("Fehler beim Laden des Inventars:", error);
    }
}

/**
 * Funktion zum Laden der Magiesystem-Daten
 */
function loadMagieSystem(data) {
    try {
        if (data.magieSystem) {
            // Globale Variablen für das Magiesystem setzen
            window.characterMagic = Array.isArray(data.magieSystem.magicAbilities) ? 
                data.magieSystem.magicAbilities : [];
            
            window.advancementPoints = data.magieSystem.advancementPoints || 0;
            
            console.log("Magie-Fähigkeiten geladen:", window.characterMagic.length);
            console.log("Steigerungspunkte geladen:", window.advancementPoints);
            
            // UI aktualisieren, falls die Funktionen bereits definiert sind
            if (typeof window.renderMagicList === 'function') {
                window.renderMagicList();
                console.log("Magic-Liste gerendert");
            }
            
            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
                console.log("Preview aktualisiert");
            }
            
            // Aktualisiere die Steigerungspunkte-Anzeige im Magie-Tab
            const advancementPointsSpan = document.getElementById('advancement-points');
            if (advancementPointsSpan) {
                advancementPointsSpan.textContent = window.advancementPoints;
                console.log("Steigerungspunkte-Anzeige aktualisiert");
            }

            // Synchronisiere zum Charakterbogen
            synchronizeToCharacterSheet();
        } else {
            console.warn("Keine Magie-Daten in der geladenen Datei gefunden");
        }
    } catch (error) {
        console.error("Fehler beim Laden der Magie-Daten:", error);
    }
}

/**
 * Synchronisiert Magiedaten zum Charakterbogen
 */
function synchronizeToCharacterSheet() {
    try {
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput && window.advancementPoints !== undefined) {
            steigerungspunkteInput.value = window.advancementPoints;
            console.log("Steigerungspunkte zum Charakterbogen synchronisiert:", window.advancementPoints);
            
            // Berechnung aktualisieren
            if (typeof updateCharakterCalculation === 'function') {
                updateCharakterCalculation();
            }
        }
    } catch (error) {
        console.error("Fehler bei der Synchronisation zum Charakterbogen:", error);
    }
}

/**
 * Generiert einen Standarddateinamen für den Charakter
 */
function generateStandardFilename(characterName = "") {
    const now = new Date();
    const datePart = now.toLocaleDateString().replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
    
    let name = characterName || "Charakter";
    // Leerzeichen durch Unterstriche ersetzen, Sonderzeichen entfernen
    name = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    
    return `${name}_${datePart}_${timePart}.json`;
}

/**
 * Initialisierung des Systems
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialisiere Event-Listener für den Datei-Input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        // Alten Event-Listener entfernen falls vorhanden
        fileInput.replaceWith(fileInput.cloneNode(true));
        
        // Neuen Event-Listener hinzufügen
        document.getElementById('fileInput').addEventListener('change', loadCharacterData);
    }
    
    // Event-Listener für den Speichern-Button
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            if (myData) {
                saveChanges(myData);
            } else {
                alert("Es wurden noch keine Charakterdaten geladen!");
            }
        });
    }
    
    // Event-Listener für den "Standard-Name" Button
    const generateFilenameButton = document.getElementById('generateFilenameButton');
    if (generateFilenameButton) {
        generateFilenameButton.addEventListener('click', function() {
            const nameInput = document.getElementById('name');
            const characterName = nameInput ? nameInput.value : '';
            const filenameInput = document.getElementById('filenameInput');
            if (filenameInput) {
                filenameInput.value = generateStandardFilename(characterName);
            }
        });
    }
});