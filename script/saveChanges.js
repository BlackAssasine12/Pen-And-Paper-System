// saveChanges.js - Komplett überarbeitet für das neue Magie-System

// Hilfsfunktion zur Ersetzung von Leerzeichen durch Unterstriche
function sanitizeKey(key) {
    return key.replace(/\s+/g, '_');
}

// Funktion zum Generieren eines Standarddateinamens mit Charakter-Name, Datum und Uhrzeit
function generateStandardFilename(characterName = "") {
    const now = new Date();
    const datePart = now.toLocaleDateString().replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }).replace(':', '-');
    
    let name = characterName || "Charakter";
    // Leerzeichen durch Unterstriche ersetzen, Sonderzeichen entfernen
    name = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    
    return `${name}_${datePart}_${timePart}.json`;
}

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
    charakterInfo.rasse = getIdValue('rassen-select'); // Rasse speichern
    charakterInfo.klasse = getIdValue('klassen-select'); // Klasse speichern
    charakterInfo.größe = getIdValue('größe');
    charakterInfo.gewicht = getIdValue('gewicht');
    charakterInfo.haarfarbe = getIdValue('haarfarbe');
    charakterInfo.augenfarbe = getIdValue('augenfarbe');
    charakterInfo.titel = getIdValue('titel');
}

// Speichert die Magie-Daten aus dem VanillaMagicSystem
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

function saveChanges(data) {
    const charakter = data.charakter;

    if (!charakter.charakterInfo) {
        console.error('charakterInfo-Objekt nicht gefunden.');
        return;
    }

    updateCharakterInfo(charakter.charakterInfo);

    if (charakter.fähigkeiten) {
        const fähigkeiten = charakter.fähigkeiten;

        if (fähigkeiten.modifier) {
            updateSectionValues(fähigkeiten.modifier, 'modifier');
        }
        if (charakter.werte) {
            updateSectionValues(charakter.werte, 'erfahrung');
        }
        if (fähigkeiten.sonderwerte) {
            updateSectionValues(fähigkeiten.sonderwerte, 'sonderwerte');
        }
        if (fähigkeiten.attribute) {
            updateSectionValues(fähigkeiten.attribute, 'attribute');
        }
        if (fähigkeiten.Assassinen_Talente) {
            updateSectionValues(fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
        }
        if (fähigkeiten.Talente_1) {
            updateSectionValues(fähigkeiten.Talente_1, 'Talente_1');
        }
        if (fähigkeiten.Talente_2) {
            updateSectionValues(fähigkeiten.Talente_2, 'Talente_2');
        }
        if (fähigkeiten.KampfBasiswerte) {
            updateSectionValues(fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
        }
        if (fähigkeiten.Kampf_Talente) {
            updateSectionValues(fähigkeiten.Kampf_Talente, 'Kampf_Talente');
        }
        if (fähigkeiten.Handwerkstalente) {
            updateSectionValues(fähigkeiten.Handwerkstalente, 'Handwerkstalente');
        }
        if (fähigkeiten.Gespeicherte_Kampftalente) {
            updateSectionValues(fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        }
    }

    // Speichern der Magie-Daten mit der neuen Funktion
    saveMagieSystem(data);

    if (charakter.geld) {
        charakter.geld = { ...wallet }; // Aktualisierung des Geld-Objekts
    }

    data.inventory = saveInventory(); // Inventar speichern

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

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

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

// Laden der Magie-Daten beim Datei-Upload
function loadMagieSystem(data) {
    // Handle neue Struktur
    if (data.magieSystem && data.magieSystem.magicAbilities) {
        window.characterMagic = data.magieSystem.magicAbilities;
        
        if (data.magieSystem.advancementPoints !== undefined) {
            window.advancementPoints = data.magieSystem.advancementPoints;
            const advancementPointsSpan = document.getElementById('advancement-points');
            if (advancementPointsSpan) {
                advancementPointsSpan.textContent = window.advancementPoints;
            }
        }
    } 
    // Fallback für alte Struktur (Konvertierung)
    else if (data.charakter && data.charakter.Magische_Elemente) {
        // Alte Struktur in neue Struktur konvertieren
        window.characterMagic = [];
        for (const [element, level] of Object.entries(data.charakter.Magische_Elemente)) {
            if (level > 0) {
                window.characterMagic.push({
                    element,
                    type: 'Angriff', // Standard-Typ für die Konvertierung
                    level
                });
            }
        }
        
        // Konvertieren und alte Struktur entfernen
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: data.charakter.werte ? data.charakter.werte.Steigerungspunkte : 0,
                magicAbilities: window.characterMagic
            };
        }
        
        // Alte Struktur entfernen
        if (data.charakter.Magische_Elemente) {
            delete data.charakter.Magische_Elemente;
        }
    }
    
    // Wenn das Magie-System initialisiert ist, aktualisiere die Anzeige
    if (typeof renderMagicList === 'function') {
        renderMagicList();
    }
    if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

// Event-Listener für den "Standard-Name" Button
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Erweiterung der fileReader.js um das neue Magie-System zu laden
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const originalFileReaderHandler = fileInput.onchange;
        fileInput.addEventListener('change', function(event) {
            // Original-Handler aufrufen
            if (originalFileReaderHandler) {
                originalFileReaderHandler(event);
            }
            
            // Zusätzlich das Magie-System laden
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = JSON.parse(e.target.result);
                    loadMagieSystem(data);
                };
                reader.readAsText(file);
            }
        });
    }
});