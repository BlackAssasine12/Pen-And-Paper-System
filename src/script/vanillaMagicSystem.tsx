// script/vanillaMagicSystem.js - Verbesserte Version mit zuverlässigem Speichern und Laden
import { updateCharakterCalculation } from "./calculations";
import type { MagicAbility, MagicSystemApi } from "../types/character";

type MagicElementGroup = Record<string, MagicAbility[]>;

const getInputElement = (id: string) => {
    const element = document.getElementById(id);
    return element instanceof HTMLInputElement ? element : null;
};

const getSelectElement = (id: string) => {
    const element = document.getElementById(id);
    return element instanceof HTMLSelectElement ? element : null;
};

const getElement = (id: string) => document.getElementById(id);
const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

// Magiedaten
const magicData = {
    elements: [
        "Feuer", "Wasser", "Erde", "Luft", "Natur", "Heilung", 
        "Dunkle", "Helle", "Schatten", "Licht", "Holz", "Metall", 
        "Eis", "Leben", "Nekromantie", "Blitz", "Blut", "Gravitation", 
        "Erschaffung", "Raumzeit"
    ],
    magicTypes: [
        "Angriff", "Verteidigung", "Unterstützung", "Kontrolle",
        "Beschwörung", "Illusion", "Heilung"
    ]
};

// Element-Anforderungen
const elementRequirements: Record<string, string> = {
    "Schatten": "Benötigt: Luft Dunkle",
    "Licht": "Benötigt: Helle Feuer",
    "Holz": "Benötigt: Erde Wasser",
    "Metall": "Benötigt: Erde Feuer",
    "Eis": "Benötigt: Luft Wasser",
    "Leben": "Benötigt: Heilung Natur",
    "Nekromantie": "Benötigt: Dunkle Leben",
    "Blitz": "Benötigt: Licht Luft",
    "Gravitation": "Benötigt: Erde Luft",
    "Erschaffung": "Benötigt: Feuer Wasser Erde Luft Natur Dunkle Helle",
    "Raumzeit": "Benötigt: Alle Elemente",
    "Blut": "Benötigt: Leben Wasser",
};

// Icons für Elemente und Magiearten
const elementIcons: Record<string, string> = {
    "Feuer": "🔥",
    "Wasser": "💧",
    "Erde": "🌍",
    "Luft": "💨",
    "Natur": "🌿",
    "Heilung": "❤️",
    "Dunkle": "🌑",
    "Helle": "✨",
    "Schatten": "👤",
    "Licht": "☀️",
    "Holz": "🌲",
    "Metall": "⚙️",
    "Eis": "❄️",
    "Leben": "🍃",
    "Nekromantie": "💀",
    "Blitz": "⚡",
    "Blut": "🩸",
    "Gravitation": "🧲",
    "Erschaffung": "✨",
    "Raumzeit": "🌀"
};

const magicTypeIcons: Record<string, string> = {
    "Angriff": "⚔️",
    "Verteidigung": "🛡️",
    "Unterstützung": "🔮",
    "Kontrolle": "🕸️",
    "Beschwörung": "🌀",
    "Illusion": "👁️",
    "Heilung": "💖"
};

// Steigerungskosten
const levelUpCosts = [0, 2, 4, 6, 9, 12, 15, 18, 22, 26, 30, 34, 38, 43, 48, 53, 58, 64, 70, 76, 82];

// *** VERBESSERT: Zentrales Magie-System-Modul ***
const MagicSystem: MagicSystemApi = (function () {
    // Private Variablen
    let _characterMagic: MagicAbility[] = [];
    let _advancementPoints = 0;
    let _characterName = "";
    let _initialized = false;
    let _characterLevel = 0;
    let _characterXP = 0;
    let _gesteigertePoints = 0;

    // Öffentliche Methoden
    return {
        init: function() {
            console.log("MagicSystem: Initialisierung");
            if (!_initialized) {
                // Stelle sicher, dass die globalen Variablen gesetzt sind
                window.characterMagic = window.characterMagic || [];
                window.advancementPoints = window.advancementPoints || 0;
                
                // Lade aus globalen Variablen, falls vorhanden
                if (Array.isArray(window.characterMagic)) {
                    _characterMagic = JSON.parse(JSON.stringify(window.characterMagic));
                }
                
                if (typeof window.advancementPoints === 'number') {
                    _advancementPoints = window.advancementPoints;
                }
                
                _initialized = true;
                console.log("MagicSystem: Erfolgreich initialisiert", {
                    magicCount: _characterMagic.length,
                    points: _advancementPoints
                });
            }
            
            // Stelle sicher, dass globale Variablen synchronisiert sind
            this.syncToGlobals();
            return this;
        },
        
        syncToGlobals: function() {
            // Wichtig: Wir exportieren alle relevanten Daten zu globalen Variablen
            window.characterMagic = JSON.parse(JSON.stringify(_characterMagic));
            window.advancementPoints = _advancementPoints;
            // Wir könnten auch Level/XP exportieren, aber das ist normalerweise nicht nötig,
            // da diese primär im Charakter-Tab verwaltet werden
            const magicList = window.characterMagic ?? [];
            
            console.log("MagicSystem: Zu globalen Variablen synchronisiert", {
                magicCount: magicList.length,
                points: window.advancementPoints,
                level: _characterLevel,
                xp: _characterXP
            });
            return this;
        },
        
        syncFromGlobals: function() {
            if (Array.isArray(window.characterMagic)) {
                _characterMagic = JSON.parse(JSON.stringify(window.characterMagic));
            }
            
            if (typeof window.advancementPoints === 'number') {
                _advancementPoints = window.advancementPoints;
            }
            
            // Wir könnten auch Level/XP aus dem DOM laden, wenn nötig
            const levelInput = getInputElement('erfahrung_level');
            const xpInput = getInputElement('erfahrung_xp');
            const gesteigerteInput = getInputElement('erfahrung_Gesteigerte');
            
            if (levelInput) _characterLevel = parseInt(levelInput.value, 10) || 0;
            if (xpInput) _characterXP = parseInt(xpInput.value, 10) || 0;
            if (gesteigerteInput) _gesteigertePoints = parseInt(gesteigerteInput.value, 10) || 0;
            
            console.log("MagicSystem: Von globalen Variablen synchronisiert", {
                magicCount: _characterMagic.length,
                points: _advancementPoints,
                level: _characterLevel,
                xp: _characterXP
            });
            return this;
        },
        
        getMagicList: function() {
            return JSON.parse(JSON.stringify(_characterMagic));
        },
        
        getAdvancementPoints: function() {
            return _advancementPoints;
        },
        
        setAdvancementPoints: function(points: number) {
            _advancementPoints = points;
            this.syncToGlobals();
            return this;
        },
        
        addMagic: function(magic: MagicAbility) {
            _characterMagic.push(magic);
            this.syncToGlobals();
            return this;
        },
        
        removeMagic: function(index: number) {
            if (index >= 0 && index < _characterMagic.length) {
                _characterMagic.splice(index, 1);
                this.syncToGlobals();
            }
            return this;
        },
        
        levelUpMagic: function(index: number, cost = 0) {
            if (index >= 0 && index < _characterMagic.length) {
                _characterMagic[index].level++;
                _advancementPoints -= cost;
                this.syncToGlobals();
            }
            return this;
        },
        
        setCharacterLevel: function(level: number) {
            _characterLevel = level;
            return this;
        },

        getCharacterLevel: function() {
            return _characterLevel;
        },

        setCharacterXP: function(xp: number) {
            _characterXP = xp;
            return this;
        },

        getCharacterXP: function() {
            return _characterXP;
        },

        setGesteigertePoints: function(points: number) {
            _gesteigertePoints = points;
            return this;
        },

        getGesteigertePoints: function() {
            return _gesteigertePoints;
        },
        
        setCharacterName: function(name: string) {
            _characterName = name;
            return this;
        },
        
        getCharacterName: function() {
            return _characterName;
        },
        
        resetAll: function() {
            _characterMagic = [];
            _advancementPoints = 0;
            _characterName = "";
            _characterLevel = 0;
            _characterXP = 0;
            _gesteigertePoints = 0;
            this.syncToGlobals();
            return this;
        }
    };
})();

// Exportiere das MagicSystem-Modul global, damit es von saveLoader.js verwendet werden kann
window.MagicSystem = MagicSystem;

// *** VERBESSERT: Verbesserte Synchronisierung mit dem Charakterbogen ***
function synchronizeWithCharacterSheet() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // 1. Von Charakter-Tab zum Magie-Tab (Steigerungspunkte)
        const steigerungspunkteInput = getInputElement('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            const punkteValue = parseInt(steigerungspunkteInput.value, 10) || 0;
            
            // Nur aktualisieren, wenn die Werte unterschiedlich sind
            if (MagicSystem.getAdvancementPoints() !== punkteValue) {
                MagicSystem.setAdvancementPoints(punkteValue);
                
                const advancementPointsSpan = document.getElementById('advancement-points');
                if (advancementPointsSpan) {
                    advancementPointsSpan.textContent = String(MagicSystem.getAdvancementPoints());
                }
                console.log("Steigerungspunkte vom Charakter-Tab übernommen:", MagicSystem.getAdvancementPoints());
            }
        }
        
        // 2. Von Charakter-Tab zum Magie-Tab (Level/XP)
        const levelInput = getInputElement('erfahrung_level');
        const xpInput = getInputElement('erfahrung_xp');
        const gesteigerteInput = getInputElement('erfahrung_Gesteigerte');
        
        if (levelInput && xpInput && gesteigerteInput) {
            const level = parseInt(levelInput.value, 10) || 0;
            const xp = parseInt(xpInput.value, 10) || 0;
            const gesteigerte = parseInt(gesteigerteInput.value, 10) || 0;
            
            // Diese Werte im MagicSystem speichern
            if (typeof MagicSystem.setCharacterLevel === 'function') {
                MagicSystem.setCharacterLevel(level);
            }
            
            if (typeof MagicSystem.setCharacterXP === 'function') {
                MagicSystem.setCharacterXP(xp);
            }
            
            if (typeof MagicSystem.setGesteigertePoints === 'function') {
                MagicSystem.setGesteigertePoints(gesteigerte);
            }
            
            console.log("Level/XP vom Charakter-Tab übernommen:", { level, xp, gesteigerte });
        }
        
        // 3. Lade den Charakternamen, falls verfügbar
        const nameInput = getInputElement('name');
        if (nameInput) {
            const characterName = nameInput.value.trim();
            MagicSystem.setCharacterName(characterName);
            
            const characterNameInput = getInputElement('characterName');
            if (characterNameInput) {
                characterNameInput.value = characterName;
            }
        }
    } catch (error) {
        console.error("Fehler bei der Synchronisation mit dem Charakterbogen:", error);
    }
}

// Funktion zum expliziten Synchronisieren von Magie-Tab zum Charakter-Tab
function syncMagieToCharacter() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // 1. Von Magie-Tab zum Charakter-Tab (Steigerungspunkte)
        const steigerungspunkteInput = getInputElement('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            // Aktualisiere den Wert im Charakter-Tab mit dem Wert aus dem Magie-Tab
            const currentPoints = parseInt(steigerungspunkteInput.value, 10) || 0;
            const magicPoints = MagicSystem.getAdvancementPoints();
            
            if (currentPoints !== magicPoints) {
                steigerungspunkteInput.value = String(magicPoints);
                console.log("Steigerungspunkte an Charakter-Tab gesendet:", magicPoints);
            }
        }
        
        // 2. Von Magie-Tab zum Charakter-Tab (Level/XP)
        // Diese Werte bleiben normalerweise im Charakter-Tab primär
        // Aber wir aktualisieren Gesteigerte basierend auf Steigerungspunkten
        updateGesteigertePoints();
        
        // 3. Berechnung im Charakter-Tab auslösen
        if (typeof updateCharakterCalculation === 'function') {
            updateCharakterCalculation();
            console.log("Charakterberechnung nach Magie-Änderung ausgelöst");
        } else {
            // Fallback: Event auslösen, damit andere Handler reagieren können
            const event = new Event('change');
            if (steigerungspunkteInput) {
                steigerungspunkteInput.dispatchEvent(event);
                console.log("Change-Event für Steigerungspunkte ausgelöst");
            }
        }
    } catch (error) {
        console.error("Fehler bei der Synchronisation zum Charakterbogen:", error);
    }
}

// Hilfsfunktion zur Aktualisierung der Gesteigerte-Punkte
function updateGesteigertePoints() {
    try {
        const levelInput = getInputElement('erfahrung_level');
        const gesteigerteInput = getInputElement('erfahrung_Gesteigerte');
        const steigerungspunkteInput = getInputElement('erfahrung_Steigerungspunkte');
        
        if (levelInput && gesteigerteInput && steigerungspunkteInput) {
            const level = parseInt(levelInput.value, 10) || 0;
            const steigerungspunkte = parseInt(steigerungspunkteInput.value, 10) || 0;
            
            // Formel: Gesteigerte = (level * 30 + 100) - Steigerungspunkte
            const gesteigerte = (level * 30 + 100) - steigerungspunkte;
            
            // Nur aktualisieren, wenn der Wert sich geändert hat
            if (parseInt(gesteigerteInput.value, 10) !== gesteigerte) {
                gesteigerteInput.value = String(gesteigerte);
                console.log("Gesteigerte Punkte aktualisiert:", gesteigerte);
                
                // Da sich Gesteigerte geändert hat, löse eine Neuberechnung aus
                if (typeof updateCharakterCalculation === 'function') {
                    console.log("Löse Charakterberechnung nach Änderung der Gesteigerten aus");
                    updateCharakterCalculation();
                }
            }
        }
    } catch (error) {
        console.error("Fehler bei der Aktualisierung der Gesteigerte-Punkte:", error);
    }
}

// DOM-Elemente initialisieren
function initVanillaMagicSystem() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        const elementSelect = getSelectElement('elementSelect');
        const customElementContainer = getElement('customElementContainer');
        const customElementInput = getInputElement('customElement');
        const magicTypeSelect = getSelectElement('magicTypeSelect');
        const magicLevelInput = getInputElement('magicLevel');
        const levelErrorDiv = getElement('levelError');
        const addMagicBtn = getElement('addMagicBtn');
        const magicListDiv = getElement('magic-list');
        const advancementPointsSpan = getElement('advancement-points');
        const addPointsBtn = getElement('add-points-btn');
        const characterNameInput = getInputElement('characterName');
        const saveButton = getElement('saveButton');
        const loadButton = getElement('loadButton');
        const fileInput = getInputElement('fileInput');
        const previewContent = getElement('previewContent');

        if (
            !elementSelect ||
            !customElementContainer ||
            !customElementInput ||
            !magicTypeSelect ||
            !magicLevelInput ||
            !levelErrorDiv ||
            !addMagicBtn ||
            !magicListDiv ||
            !advancementPointsSpan ||
            !addPointsBtn ||
            !characterNameInput ||
            !saveButton ||
            !loadButton ||
            !fileInput ||
            !previewContent
        ) {
            console.error("Erforderliche Elemente für das Magiesystem fehlen");
            return;
        }
        
        // Populiere die Select-Elemente
        populateSelectElements();
        
        // Event-Listener hinzufügen
        elementSelect.addEventListener('change', toggleCustomElement);
        addMagicBtn.addEventListener('click', addMagic);
        addPointsBtn.addEventListener('click', addPoints);
        
        // *** VERBESSERT: Speicherschaltfläche neu verknüpfen mit der Hauptspeicherfunktion ***
        const parentSaveButton = document.getElementById('saveButton');
        if (parentSaveButton) {
            console.log("Verbesserter Save-Button gefunden und neu verknüpft");
            saveButton.addEventListener('click', function() {
                // Sicherstellen, dass die globalen Variablen aktuell sind
                MagicSystem.syncToGlobals();
                
                // Hauptspeicherfunktion aufrufen
                parentSaveButton.click();
                
                console.log("Hauptspeicherfunktion aufgerufen");
            });
        } else {
            // Fallback zum selbstständigen Speichern
            saveButton.addEventListener('click', saveCharacter);
        }
        
        loadButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
        characterNameInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement | null;
            if (!target) {
                return;
            }
            MagicSystem.setCharacterName(target.value);
            updatePreview();
        });
        
        // Synchronisiere mit dem Hauptcharakterbogen
        synchronizeWithCharacterSheet();
        
        // Event-Listener für Änderungen am Steigerungspunkte-Input im Charakter-Tab
        const steigerungspunkteInput = getInputElement('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            steigerungspunkteInput.addEventListener('change', synchronizeWithCharacterSheet);
            steigerungspunkteInput.addEventListener('input', synchronizeWithCharacterSheet);
        }
        
        // Event-Listener für Änderungen am Level/XP-Input im Charakter-Tab
        const levelInput = getInputElement('erfahrung_level');
        if (levelInput) {
            levelInput.addEventListener('change', synchronizeWithCharacterSheet);
            levelInput.addEventListener('input', synchronizeWithCharacterSheet);
        }
        
        const xpInput = getInputElement('erfahrung_xp');
        if (xpInput) {
            xpInput.addEventListener('change', synchronizeWithCharacterSheet);
            xpInput.addEventListener('input', synchronizeWithCharacterSheet);
        }
        
        // UI-Werte initialisieren
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = String(MagicSystem.getAdvancementPoints());
        }
        
        if (characterNameInput) {
            characterNameInput.value = MagicSystem.getCharacterName();
        }
        
        // Magie-Liste und Vorschau aktualisieren
        renderMagicList();
        updatePreview();
        
        console.log("VanillaMagicSystem erfolgreich initialisiert");
    } catch (error) {
        console.error("Fehler bei der Initialisierung des VanillaMagicSystems:", error);
    }
}

function populateSelectElements() {
    try {
        const elementSelect = getSelectElement('elementSelect');
        const magicTypeSelect = getSelectElement('magicTypeSelect');
        
        if (!elementSelect || !magicTypeSelect) {
            console.error("Select-Elemente nicht gefunden");
            return;
        }
        
        // Elemente-Select leeren und neu füllen
        elementSelect.innerHTML = '<option value="">-- Element wählen --</option>';
        magicData.elements.forEach(element => {
            const option = document.createElement('option');
            option.value = element;
            option.textContent = element;
            elementSelect.appendChild(option);
        });
        elementSelect.innerHTML += '<option value="custom">Eigenes Element eingeben</option>';
        
        // Magietypen-Select leeren und neu füllen
        magicTypeSelect.innerHTML = '<option value="">-- Magie-Art wählen --</option>';
        magicData.magicTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            magicTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Fehler beim Populieren der Select-Elemente:", error);
    }
}

function toggleCustomElement() {
    try {
        const elementSelect = getSelectElement('elementSelect');
        const customElementContainer = getElement('customElementContainer');
        
        if (!elementSelect || !customElementContainer) {
            console.error("Elemente für Custom-Element nicht gefunden");
            return;
        }
        
        if (elementSelect.value === 'custom') {
            customElementContainer.classList.remove('hidden');
        } else {
            customElementContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error("Fehler beim Umschalten des Custom-Elements:", error);
    }
}

function addMagic() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // Synchronisiere erst mit dem Charakter-Tab
        synchronizeWithCharacterSheet();
        
        const elementSelect = getSelectElement('elementSelect');
        const customElementInput = getInputElement('customElement');
        const magicTypeSelect = getSelectElement('magicTypeSelect');
        const magicLevelInput = getInputElement('magicLevel');
        const levelErrorDiv = getElement('levelError');
        
        if (!elementSelect || !customElementInput || !magicTypeSelect || !magicLevelInput || !levelErrorDiv) {
            console.error("Erforderliche Elemente für addMagic nicht gefunden");
            return;
        }
        
        let elementToAdd = elementSelect.value;
        const selectedMagicType = magicTypeSelect.value;
        const magicLevel = parseInt(magicLevelInput.value, 10);
        
        // Validierungen
        if (elementToAdd === 'custom') {
            elementToAdd = customElementInput.value.trim();
            if (!elementToAdd) {
                showError(levelErrorDiv, 'Bitte gib ein eigenes Element ein');
                return;
            }
        }
        
        if (!elementToAdd || elementToAdd === '') {
            showError(levelErrorDiv, 'Bitte wähle ein Element aus');
            return;
        }
        
        if (!selectedMagicType) {
            showError(levelErrorDiv, 'Bitte wähle eine Magie-Art aus');
            return;
        }
        
        if (magicLevel < 1 || magicLevel > 21) {
            showError(levelErrorDiv, 'Level muss zwischen 1 und 21 liegen');
            return;
        }
    
        // Füge neue Magie hinzu
        const newMagic: MagicAbility = {
            element: elementToAdd,
            type: selectedMagicType,
            level: magicLevel
        };
        
        // Neue Magie hinzufügen
        MagicSystem.addMagic(newMagic);
        
        // Formular zurücksetzen
        magicLevelInput.value = "1";
        
        // UI aktualisieren
        renderMagicList();
        updatePreview();
        
        // WICHTIG: Synchronisiere zum Charakter-Tab, da die Magie-Summe geändert wurde
        syncMagieToCharacter();
    
        // Fehlermeldungen zurücksetzen
        levelErrorDiv.classList.add('hidden');
        
        console.log("Magie hinzugefügt:", newMagic);
    } catch (error) {
        console.error("Fehler beim Hinzufügen von Magie:", error);
        alert("Es ist ein Fehler beim Hinzufügen von Magie aufgetreten. Siehe Konsole für Details.");
    }
}

function showError(element: HTMLElement | null, message: string) {
    if (!element) {
        console.error("Fehler-Element nicht gefunden");
        alert(message);
        return;
    }
    
    element.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

function removeMagic(index: number) {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // Entferne die Magie
        MagicSystem.removeMagic(index);
        
        // UI aktualisieren
        renderMagicList();
        updatePreview();
        
        // WICHTIG: Aktualisiere den Charakter-Tab, da sich die Magie-Summe geändert hat
        syncMagieToCharacter();
        
        console.log("Magie entfernt, Index:", index);
    } catch (error) {
        console.error("Fehler beim Entfernen von Magie:", error);
    }
}

function levelUpMagic(index: number) {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // Zuerst den aktuellen Wert vom Charakter-Tab übernehmen
        synchronizeWithCharacterSheet();
        
        const characterMagic = MagicSystem.getMagicList();
        
        if (index < 0 || index >= characterMagic.length) {
            console.error("Ungültiger Index für levelUpMagic:", index);
            return;
        }
        
        const magic = characterMagic[index];
        
        if (magic.level >= 21) {
            alert('Maximales Level (21) bereits erreicht!');
            return;
        }
        
        const cost = getLevelUpCost(magic.level);
        
        if (MagicSystem.getAdvancementPoints() < cost) {
            alert(`Nicht genügend Steigerungspunkte! Du brauchst ${cost} Punkte, um auf Level ${magic.level + 1} zu steigern.`);
            return;
        }
        
        // Level erhöhen im MagicSystem
        MagicSystem.levelUpMagic(index, cost);
        
        // UI aktualisieren
        const advancementPointsSpan = getElement('advancement-points');
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = String(MagicSystem.getAdvancementPoints());
        }
        
        // WICHTIG: Bidirektionale Synchronisation - zum Charakter-Tab senden
        syncMagieToCharacter();
        
        renderMagicList();
        updatePreview();
        
        console.log(`Magie ${magic.element} auf Level ${magic.level + 1} gesteigert.`);
    } catch (error) {
        console.error("Fehler beim Level-Up:", error);
        alert("Es ist ein Fehler beim Steigern des Levels aufgetreten. Siehe Konsole für Details.");
    }
}

function getLevelUpCost(currentLevel: number) {
    if (currentLevel < 1 || currentLevel >= levelUpCosts.length) {
        return Infinity;
    }
    return levelUpCosts[currentLevel];
}

function getIcon(type: 'element' | 'magicType', key: string) {
    const iconMap = type === 'element' ? elementIcons : magicTypeIcons;
    return iconMap[key] || '✨';
}

function addPoints() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        // Zuerst den aktuellen Wert vom Charakter-Tab übernehmen
        synchronizeWithCharacterSheet();
        
        const rawPoints = prompt('Wie viele Steigerungspunkte möchtest du hinzufügen?', '5');
        const pointsToAdd = rawPoints ? parseInt(rawPoints, 10) : Number.NaN;
        
        if (!isNaN(pointsToAdd) && pointsToAdd > 0) {
            // Punkte im MagicSystem hinzufügen
            const currentPoints = MagicSystem.getAdvancementPoints();
            MagicSystem.setAdvancementPoints(currentPoints + pointsToAdd);
            
            // UI aktualisieren
            const advancementPointsSpan = getElement('advancement-points');
            if (advancementPointsSpan) {
                advancementPointsSpan.textContent = String(MagicSystem.getAdvancementPoints());
            }
            
            // WICHTIG: Bidirektionale Synchronisation - zum Charakter-Tab senden
            syncMagieToCharacter();
            
            console.log("Steigerungspunkte hinzugefügt:", pointsToAdd, "Neue Summe:", MagicSystem.getAdvancementPoints());
        }
    } catch (error) {
        console.error("Fehler beim Hinzufügen von Punkten:", error);
        alert("Es ist ein Fehler beim Hinzufügen von Steigerungspunkten aufgetreten. Siehe Konsole für Details.");
    }
}

function renderMagicList() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        const magicListDiv = getElement('magic-list');
        if (!magicListDiv) {
            console.error("magic-list Element nicht gefunden");
            return;
        }
        
        magicListDiv.innerHTML = '';
        
        const characterMagic = MagicSystem.getMagicList();
        
        if (characterMagic.length === 0) {
            magicListDiv.innerHTML = '<p>Noch keine Magien hinzugefügt. Füge oben deine erste Magie hinzu!</p>';
            return;
        }
        
        characterMagic.forEach((magic, index) => {
            const elementIcon = getIcon('element', magic.element);
            const typeIcon = getIcon('magicType', magic.type);
            
            // Kosten für nächstes Level berechnen
            const nextLevelCost = magic.level < 21 ? getLevelUpCost(magic.level) : null;
            const levelUpDisabled =
                (nextLevelCost ?? Infinity) > MagicSystem.getAdvancementPoints() || magic.level >= 21;
            
            const magicDiv = document.createElement('div');
            magicDiv.className = 'added-magic';
            
            magicDiv.innerHTML = `
                <div class="magic-info">
                    <span class="magic-icon">${elementIcon}</span>
                    <strong>${magic.element}</strong> - 
                    <span class="magic-icon">${typeIcon}</span>
                    <span class="magic-type">${magic.type}</span>
                    <span>Level <strong>${magic.level}</strong></span>
                    ${nextLevelCost ? `
                        <span class="tooltip">
                            <i>ℹ️</i>
                            <span class="tooltip-content">Nächstes Level: ${nextLevelCost} Punkte</span>
                        </span>
                    ` : ''}
                </div>
                <div class="magic-controls">
                    <button class="btn btn-level-up" ${levelUpDisabled ? 'disabled' : ''}>
                        ⬆️ Level
                    </button>
                    <button class="btn btn-remove">
                        🗑️
                    </button>
                </div>
            `;
            
            // Event-Listener hinzufügen
            const levelUpBtn = magicDiv.querySelector('.btn-level-up');
            const removeBtn = magicDiv.querySelector('.btn-remove');
            
            if (levelUpBtn) {
                levelUpBtn.addEventListener('click', () => levelUpMagic(index));
            }
            
            if (removeBtn) {
                removeBtn.addEventListener('click', () => removeMagic(index));
            }
            
            magicListDiv.appendChild(magicDiv);
        });
    } catch (error) {
        console.error("Fehler beim Rendern der Magic-Liste:", error);
    }
}

function updatePreview() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        const previewContent = getElement('previewContent');
        if (!previewContent) {
            console.error("previewContent Element nicht gefunden");
            return;
        }
        
        const characterMagic = MagicSystem.getMagicList();
        
        if (characterMagic.length === 0) {
            previewContent.innerHTML = '<p>Füge Magien hinzu, um die Vorschau zu sehen.</p>';
            return;
        }
        
        // Gruppiere Magie nach Element
        const elementGroups: MagicElementGroup = {};
        characterMagic.forEach((magic) => {
            if (!elementGroups[magic.element]) {
                elementGroups[magic.element] = [];
            }
            elementGroups[magic.element].push(magic);
        });
        
        let previewHTML = `
            <h2>${MagicSystem.getCharacterName() || 'Unbenannter Charakter'}</h2>
            <div class="stats-box">
                <div class="stat-item">
                    <span class="stat-label">Steigerungspunkte:</span>
                    <span class="stat-value">${MagicSystem.getAdvancementPoints()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${MagicSystem.getCharacterLevel()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">XP:</span>
                    <span class="stat-value">${MagicSystem.getCharacterXP()}</span>
                </div>
            </div>
            <div class="magic-abilities">
        `;
        
        for (const [element, magicList] of Object.entries(elementGroups)) {
            const elementIcon = getIcon('element', element);
            
            previewHTML += `
                <div class="element-section">
                    <h3 class="element-title">
                        ${elementIcon} ${element}
                    </h3>
                    <div class="magic-items">
            `;
            
            magicList.forEach((magic) => {
                const typeIcon = getIcon('magicType', magic.type);
                
                previewHTML += `
                    <div class="magic-item">
                        <div class="magic-info">
                            <span class="magic-icon">${typeIcon}</span>
                            <span class="magic-type">${magic.type}</span>
                        </div>
                        <span class="magic-level">${magic.level}</span>
                    </div>
                `;
            });
            
            previewHTML += `
                    </div>
                </div>
            `;
        }
        
        previewHTML += '</div>';
        previewContent.innerHTML = previewHTML;
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Preview:", error);
    }
}

function saveCharacter() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();
        
        const characterMagic = MagicSystem.getMagicList();
        
        if (characterMagic.length === 0) {
            alert('Füge mindestens eine Magie hinzu, bevor du speicherst');
            return;
        }
        
        const characterData: {
            name: string;
            advancementPoints: number;
            level: number;
            xp: number;
            gesteigerte: number;
            magic: MagicAbility[];
        } = {
            name: MagicSystem.getCharacterName() || 'Unbenannter Charakter',
            advancementPoints: MagicSystem.getAdvancementPoints(),
            level: MagicSystem.getCharacterLevel(),
            xp: MagicSystem.getCharacterXP(),
            gesteigerte: MagicSystem.getGesteigertePoints(),
            magic: characterMagic
        };
        
        const jsonString = JSON.stringify(characterData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${characterData.name.replace(/\s+/g, '_')}_magie.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Magie-Daten erfolgreich gespeichert!');
    } catch (error) {
        console.error("Fehler beim Speichern des Charakters:", error);
        alert("Fehler beim Speichern: " + getErrorMessage(error));
    }
}

function handleFileUpload(event: Event) {
    try {
        const target = event.target as HTMLInputElement | null;
        const file = target?.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const raw = e?.target?.result;
                if (typeof raw !== "string") {
                    throw new Error("Unerwartetes Dateiformat");
                }
                const loadedData = JSON.parse(raw) as {
                    name?: string;
                    advancementPoints?: number;
                    level?: number;
                    xp?: number;
                    gesteigerte?: number;
                    magic?: MagicAbility[];
                };
                
                // Validiere geladene Daten
                if (!loadedData.name || !Array.isArray(loadedData.magic)) {
                    throw new Error('Ungültiges Dateiformat');
                }
                
                // Lade MagicSystem, falls noch nicht initialisiert
                MagicSystem.init();
                
                // Daten setzen
                MagicSystem.setCharacterName(loadedData.name);
                
                // Magie-Daten setzen
                window.characterMagic = loadedData.magic;
                MagicSystem.syncFromGlobals();
                
                // Steigerungspunkte setzen
                if (loadedData.advancementPoints !== undefined) {
                    MagicSystem.setAdvancementPoints(loadedData.advancementPoints);
                }
                
                // Level/XP/Gesteigerte setzen, falls vorhanden
                if (loadedData.level !== undefined) {
                    MagicSystem.setCharacterLevel(loadedData.level);
                }
                
                if (loadedData.xp !== undefined) {
                    MagicSystem.setCharacterXP(loadedData.xp);
                }
                
                if (loadedData.gesteigerte !== undefined) {
                    MagicSystem.setGesteigertePoints(loadedData.gesteigerte);
                }
                
                // Formular aktualisieren
                const characterNameInput = getInputElement('characterName');
                if (characterNameInput) {
                    characterNameInput.value = MagicSystem.getCharacterName();
                }
                
                const advancementPointsSpan = getElement('advancement-points');
                if (advancementPointsSpan) {
                    advancementPointsSpan.textContent = String(MagicSystem.getAdvancementPoints());
                }
                
                // UI aktualisieren
                renderMagicList();
                updatePreview();
                
                // Synchronisiere Änderungen zum Hauptsystem
                syncMagieToCharacter();
                
                alert('Magie-Daten erfolgreich geladen!');
            } catch (error) {
                alert('Fehler beim Laden der Datei: ' + getErrorMessage(error));
            }
        };
        
        reader.readAsText(file);
    } catch (error) {
        console.error("Fehler beim Datei-Upload:", error);
        alert("Fehler beim Laden der Datei: " + getErrorMessage(error));
    }
}

// *** VERBESSERT: Debugging-Funktion ***
function debugMagicSystem() {
    console.log("%c=== Magic System Debug ===", "color: purple; font-weight: bold;");
    console.log("Global characterMagic:", window.characterMagic);
    console.log("Global advancementPoints:", window.advancementPoints);
    
    // Testen, ob MagicSystem geladen ist
    if (typeof MagicSystem !== 'undefined') {
        MagicSystem.init();
        console.log("MagicSystem Magic List:", MagicSystem.getMagicList());
        console.log("MagicSystem Points:", MagicSystem.getAdvancementPoints());
        console.log("MagicSystem Level:", MagicSystem.getCharacterLevel());
        console.log("MagicSystem XP:", MagicSystem.getCharacterXP());
        console.log("MagicSystem Gesteigerte:", MagicSystem.getGesteigertePoints());
    } else {
        console.error("MagicSystem ist nicht definiert!");
    }
    
    // DOM-Elemente überprüfen
    const magieTab = document.getElementById('magie-tab');
    console.log("Magie-Tab gefunden:", !!magieTab);
    
    if (magieTab) {
        console.log("Magie-Tab Inhalt:", magieTab.innerHTML.substring(0, 100) + "...");
    }
    
    const steigerungspunkteInput = getInputElement('erfahrung_Steigerungspunkte');
    console.log("Steigerungspunkte-Input gefunden:", !!steigerungspunkteInput);
    
    if (steigerungspunkteInput) {
        console.log("Steigerungspunkte-Wert:", steigerungspunkteInput.value);
    }
    
    const levelInput = getInputElement('erfahrung_level');
    const xpInput = getInputElement('erfahrung_xp');
    const gesteigerteInput = getInputElement('erfahrung_Gesteigerte');
    
    if (levelInput && xpInput && gesteigerteInput) {
        console.log("Level/XP/Gesteigerte im DOM:", {
            level: levelInput.value,
            xp: xpInput.value,
            gesteigerte: gesteigerteInput.value
        });
    }
    
    console.log("%c=== Debug Ende ===", "color: purple; font-weight: bold;");
}

// Tab-Wechsel-Erkennung und Initialisierung
const initializeMagicSystemTab = () => {
    // *** VERBESSERT: Initialisiere MagicSystem zuerst ***
    MagicSystem.init();
    
    // Setze globale Funktionen für andere Skripte
    window.renderMagicList = renderMagicList;
    window.updatePreview = updatePreview;
    
    // Tab-Wechsel erkennen und Synchronisation auslösen
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            const target = event.currentTarget as HTMLElement | null;
            if (target?.getAttribute('data-tab') === 'magie-tab') {
                // Wenn der Magie-Tab aktiviert wird, Magie-System initialisieren
                console.log("Magie-Tab aktiviert, initialisiere System");
                
                // Sicherstellen, dass das Magiesystem initialisiert ist
                setTimeout(() => {
                    const magieTabElement = document.getElementById('magie-tab');
                    if (magieTabElement &&
                        !magieTabElement.querySelector('.vanilla-magic-system')) {
                        console.log("Initialisiere Magie-System");
                        initializeVanillaMagicSystem();
                    }
                    // Synchronisiere mit dem Charakterbogen
                    setTimeout(synchronizeWithCharacterSheet, 100);
                    
                    // Debug-Ausgabe für Fehlerbehebung
                    setTimeout(debugMagicSystem, 200);
                }, 50);
            }
        });
    });
    
    // *** VERBESSERT: Speichervorgang abfangen ***
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        // Originale click-Funktion speichern
        const originalClick = saveButton.onclick;
        
        // Neue Funktion, die vorher die Magie synchronisiert
        saveButton.addEventListener('click', (event) => {
            // Stelle sicher, dass das MagicSystem initialisiert ist
            MagicSystem.init();
            
            // Stelle sicher, dass die globalen Variablen aktuell sind
            MagicSystem.syncToGlobals();
            
            console.log("Speichern vorbereitet: Magie-Daten synchronisiert");
            
            // Falls es eine originale Click-Funktion gibt, führe sie aus
            if (typeof originalClick === 'function') {
                originalClick.call(saveButton, event);
            }
        });
    }
    
    // Initialisiere das VanillaMagicSystem, wenn die Seite geladen ist
    const magieTab = document.getElementById('magie-tab');
    if (magieTab) {
        console.log("Magie-Tab gefunden, initialisiere System");
        setTimeout(() => {
            initializeVanillaMagicSystem();
            
            // Debug-Ausgabe für Fehlerbehebung
            setTimeout(debugMagicSystem, 200);
        }, 300);
    }
};

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initializeMagicSystemTab);
} else {
    initializeMagicSystemTab();
}

// Funktion zum Initialisieren des Systems nach DOM-Manipulation
function initializeVanillaMagicSystem() {
    console.log("Starte Initialisierung von VanillaMagicSystem");
    
    const magieTab = document.getElementById('magie-tab');
    if (!magieTab) {
        console.error("Magie-Tab nicht gefunden");
        return;
    }
    
    // Prüfen, ob das System bereits initialisiert wurde
    if (magieTab.querySelector('.vanilla-magic-system')) {
        console.log("Magie-System bereits initialisiert");
        return;
    }

    console.log("Erstelle Magie-System HTML");

    // HTML für das Vanilla Magic System einfügen
    const vanillaMagicHTML = createVanillaMagicHTML();
    magieTab.innerHTML = ''; // *** VERBESSERT: Vorherigen Inhalt löschen ***
    magieTab.appendChild(vanillaMagicHTML);

    // System initialisieren
    console.log("Initialisiere Magie-System");
    initVanillaMagicSystem();

    // Nach der Initialisierung einmal die Steigerungspunkte synchronisieren
    console.log("Synchronisiere mit dem Charakterbogen nach Initialisierung");
    setTimeout(synchronizeWithCharacterSheet, 100);
}

// Erstellt das HTML für das Vanilla Magic System
function createVanillaMagicHTML(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'vanilla-magic-system';

container.innerHTML = `
    <div class="card">
        <div class="scroll-decoration scroll-left"></div>
        <div class="scroll-decoration scroll-right"></div>
        <h2>Magie-Charakterbogen</h2>
        
        <div class="info-box">
            <div class="info-box-title">Hinweis</div>
            <p>Füge mehrere Magie-Elemente und -Arten hinzu, um einen mächtigen Charakterbogen zu erstellen. Jedes Element kann mehrere Magiearten beherrschen!</p>
        </div>
        
        <div class="stats-box">
            <div class="stat-item">
                <span class="stat-label">Steigerungspunkte:</span>
                <span id="advancement-points" class="stat-value">20</span>
            </div>
            <button id="add-points-btn" class="btn btn-small">
                <i class="fas fa-plus-circle"></i> Punkte hinzufügen
            </button>
        </div>
        
        <div class="form-group">
            <label for="characterName">Charaktername</label>
            <input type="text" id="characterName" placeholder="Gib deinen Charakternamen ein">
        </div>
        
        <div class="magic-title">
            <i class="fas fa-magic"></i>
            <h2>Magieauswahl</h2>
            <i class="fas fa-magic"></i>
        </div>
        
        <div class="form-group">
            <label for="elementSelect">Magie-Element</label>
            <select id="elementSelect">
                <option value="">-- Element wählen --</option>
            </select>
            
            <div id="customElementContainer" class="hidden">
                <input type="text" id="customElement" placeholder="Eigenes Element eingeben">
            </div>
        </div>
        
        <div class="form-group">
            <label for="magicTypeSelect">Magie-Art</label>
            <select id="magicTypeSelect">
                <option value="">-- Magie-Art wählen --</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="magicLevel">Magie-Level (1-21)</label>
            <input type="number" id="magicLevel" min="1" max="21" value="1">
            <div id="levelError" class="error hidden"></div>
        </div>
        
        <button id="addMagicBtn" class="btn">
            <i class="fas fa-plus-circle"></i> Magie hinzufügen
        </button>
        
        <div id="magic-list" class="magic-list">
            <!-- Hier werden hinzugefügte Magien angezeigt -->
        </div>
        
        <div class="btn-group">
            <button id="magieSpeichernButton" class="btn">
                <i class="fas fa-save"></i> Charakter speichern
            </button>
            <button id="loadButton" class="btn">
                <i class="fas fa-upload"></i> Magie laden
            </button>
            <input type="file" id="fileInput" style="display: none;" accept=".json">
        </div>
    </div>
    
    <div class="card character-preview">
        <div class="scroll-decoration scroll-left"></div>
        <div class="scroll-decoration scroll-right"></div>
        <h3>Charaktervorschau</h3>
        <div id="previewContent">
            <p>Füge Magien hinzu, um die Vorschau zu sehen.</p>
        </div>
    </div>
`;

    return container;
}
