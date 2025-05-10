// script/vanillaMagicSystem.js - Verbesserte Version mit zuverlässigem Speichern

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
const elementRequirements = {
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
const elementIcons = {
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

const magicTypeIcons = {
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
const MagicSystem = (function () {
    // Private Variablen
    let _characterMagic = [];
    let _advancementPoints = 0;
    let _characterName = "";
    let _initialized = false;

    // Öffentliche Methoden
    return {
        init: function () {
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

        syncToGlobals: function () {
            window.characterMagic = JSON.parse(JSON.stringify(_characterMagic));
            window.advancementPoints = _advancementPoints;
            console.log("MagicSystem: Zu globalen Variablen synchronisiert", {
                magicCount: window.characterMagic.length,
                points: window.advancementPoints
            });
            return this;
        },

        syncFromGlobals: function () {
            if (Array.isArray(window.characterMagic)) {
                _characterMagic = JSON.parse(JSON.stringify(window.characterMagic));
            }

            if (typeof window.advancementPoints === 'number') {
                _advancementPoints = window.advancementPoints;
            }

            console.log("MagicSystem: Von globalen Variablen synchronisiert", {
                magicCount: _characterMagic.length,
                points: _advancementPoints
            });
            return this;
        },

        getMagicList: function () {
            return JSON.parse(JSON.stringify(_characterMagic));
        },

        getAdvancementPoints: function () {
            return _advancementPoints;
        },

        setAdvancementPoints: function (points) {
            _advancementPoints = points;
            this.syncToGlobals();
            return this;
        },

        addMagic: function (magic) {
            _characterMagic.push(magic);
            this.syncToGlobals();
            return this;
        },

        removeMagic: function (index) {
            if (index >= 0 && index < _characterMagic.length) {
                _characterMagic.splice(index, 1);
                this.syncToGlobals();
            }
            return this;
        },

        levelUpMagic: function (index, cost) {
            if (index >= 0 && index < _characterMagic.length) {
                _characterMagic[index].level++;
                _advancementPoints -= cost;
                this.syncToGlobals();
            }
            return this;
        },

        setCharacterName: function (name) {
            _characterName = name;
            return this;
        },

        getCharacterName: function () {
            return _characterName;
        },

        resetAll: function () {
            _characterMagic = [];
            _advancementPoints = 0;
            _characterName = "";
            this.syncToGlobals();
            return this;
        }
    };
})();

window.MagicSystem = MagicSystem;
// *** VERBESSERT: Verbesserte Synchronisierung mit dem Charakterbogen ***
function synchronizeWithCharacterSheet() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();

        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');

        // 1. Von Charakter-Tab zum Magie-Tab
        if (steigerungspunkteInput) {
            const punkteValue = parseInt(steigerungspunkteInput.value) || 0;

            // Nur aktualisieren, wenn die Werte unterschiedlich sind
            if (MagicSystem.getAdvancementPoints() !== punkteValue) {
                MagicSystem.setAdvancementPoints(punkteValue);

                const advancementPointsSpan = document.getElementById('advancement-points');
                if (advancementPointsSpan) {
                    advancementPointsSpan.textContent = MagicSystem.getAdvancementPoints();
                }
                console.log("Steigerungspunkte vom Charakter-Tab übernommen:", MagicSystem.getAdvancementPoints());
            }
        }

        // Lade den Charakternamen, falls verfügbar
        const nameInput = document.getElementById('name');
        if (nameInput) {
            const characterName = nameInput.value.trim();
            MagicSystem.setCharacterName(characterName);

            const characterNameInput = document.getElementById('characterName');
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

        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            // Aktualisiere den Wert im Charakter-Tab mit dem Wert aus dem Magie-Tab
            const currentPoints = parseInt(steigerungspunkteInput.value) || 0;
            const magicPoints = MagicSystem.getAdvancementPoints();

            if (currentPoints !== magicPoints) {
                steigerungspunkteInput.value = magicPoints;

                // Wichtig: Aktualisiere auch die Gesteigerten-Punkte basierend auf dem neuen Wert
                updateGesteigertePoints();

                // Löse die Berechnung im Charakter-Tab aus
                if (typeof updateCharakterCalculation === 'function') {
                    updateCharakterCalculation();
                } else {
                    // Fallback: Event auslösen, damit andere Handler reagieren können
                    const event = new Event('change');
                    steigerungspunkteInput.dispatchEvent(event);
                }

                console.log("Steigerungspunkte an Charakter-Tab gesendet:", magicPoints);
            }
        }
    } catch (error) {
        console.error("Fehler bei der Synchronisation zum Charakterbogen:", error);
    }
}

// Hilfsfunktion zur Aktualisierung der Gesteigerte-Punkte
function updateGesteigertePoints() {
    try {
        const levelInput = document.getElementById('erfahrung_level');
        const gesteigerteInput = document.getElementById('erfahrung_Gesteigerte');
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');

        if (levelInput && gesteigerteInput && steigerungspunkteInput) {
            const level = parseInt(levelInput.value) || 0;
            const steigerungspunkte = parseInt(steigerungspunkteInput.value) || 0;

            // Formel: Gesteigerte = (level * 30 + 100) - Steigerungspunkte
            const gesteigerte = (level * 30 + 100) - steigerungspunkte;
            gesteigerteInput.value = gesteigerte;

            console.log("Gesteigerte Punkte aktualisiert:", gesteigerte);
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

        const elementSelect = document.getElementById('elementSelect');
        const customElementContainer = document.getElementById('customElementContainer');
        const customElementInput = document.getElementById('customElement');
        const magicTypeSelect = document.getElementById('magicTypeSelect');
        const magicLevelInput = document.getElementById('magicLevel');
        const levelErrorDiv = document.getElementById('levelError');
        const addMagicBtn = document.getElementById('addMagicBtn');
        const magicListDiv = document.getElementById('magic-list');
        const advancementPointsSpan = document.getElementById('advancement-points');
        const addPointsBtn = document.getElementById('add-points-btn');
        const characterNameInput = document.getElementById('characterName');
        const saveButton = document.getElementById('saveButton');
        const loadButton = document.getElementById('loadButton');
        const fileInput = document.getElementById('fileInput');
        const previewContent = document.getElementById('previewContent');

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
            saveButton.addEventListener('click', function () {
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
            MagicSystem.setCharacterName(e.target.value);
            updatePreview();
        });

        // Synchronisiere mit dem Hauptcharakterbogen
        synchronizeWithCharacterSheet();

        // Event-Listener für Änderungen am Steigerungspunkte-Input im Charakter-Tab
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            steigerungspunkteInput.addEventListener('change', synchronizeWithCharacterSheet);
            steigerungspunkteInput.addEventListener('input', synchronizeWithCharacterSheet);
        }

        // UI-Werte initialisieren
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = MagicSystem.getAdvancementPoints();
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
        const elementSelect = document.getElementById('elementSelect');
        const magicTypeSelect = document.getElementById('magicTypeSelect');

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
        const elementSelect = document.getElementById('elementSelect');
        const customElementContainer = document.getElementById('customElementContainer');

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

        const elementSelect = document.getElementById('elementSelect');
        const customElementInput = document.getElementById('customElement');
        const magicTypeSelect = document.getElementById('magicTypeSelect');
        const magicLevelInput = document.getElementById('magicLevel');
        const levelErrorDiv = document.getElementById('levelError');

        if (!elementSelect || !customElementInput || !magicTypeSelect || !magicLevelInput || !levelErrorDiv) {
            console.error("Erforderliche Elemente für addMagic nicht gefunden");
            return;
        }

        let elementToAdd = elementSelect.value;
        const selectedMagicType = magicTypeSelect.value;
        const magicLevel = parseInt(magicLevelInput.value);

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
        const newMagic = {
            element: elementToAdd,
            type: selectedMagicType,
            level: magicLevel
        };

        // Neue Magie hinzufügen
        MagicSystem.addMagic(newMagic);

        // Formular zurücksetzen
        magicLevelInput.value = 1;

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

function showError(element, message) {
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

function removeMagic(index) {
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

function levelUpMagic(index) {
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
        const advancementPointsSpan = document.getElementById('advancement-points');
        if (advancementPointsSpan) {
            advancementPointsSpan.textContent = MagicSystem.getAdvancementPoints();
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

function getLevelUpCost(currentLevel) {
    if (currentLevel < 1 || currentLevel >= levelUpCosts.length) {
        return Infinity;
    }
    return levelUpCosts[currentLevel];
}

function getIcon(type, key) {
    const iconMap = type === 'element' ? elementIcons : magicTypeIcons;
    return iconMap[key] || '✨';
}

function addPoints() {
    try {
        // Lade MagicSystem, falls noch nicht initialisiert
        MagicSystem.init();

        // Zuerst den aktuellen Wert vom Charakter-Tab übernehmen
        synchronizeWithCharacterSheet();

        const pointsToAdd = parseInt(prompt('Wie viele Steigerungspunkte möchtest du hinzufügen?', '5'));

        if (!isNaN(pointsToAdd) && pointsToAdd > 0) {
            // Punkte im MagicSystem hinzufügen
            const currentPoints = MagicSystem.getAdvancementPoints();
            MagicSystem.setAdvancementPoints(currentPoints + pointsToAdd);

            // UI aktualisieren
            const advancementPointsSpan = document.getElementById('advancement-points');
            if (advancementPointsSpan) {
                advancementPointsSpan.textContent = MagicSystem.getAdvancementPoints();
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

        const magicListDiv = document.getElementById('magic-list');
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
            const levelUpDisabled = nextLevelCost > MagicSystem.getAdvancementPoints() || magic.level >= 21;

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

        const previewContent = document.getElementById('previewContent');
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
        const elementGroups = {};
        characterMagic.forEach(magic => {
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

            magicList.forEach(magic => {
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

        const characterData = {
            name: MagicSystem.getCharacterName() || 'Unbenannter Charakter',
            advancementPoints: MagicSystem.getAdvancementPoints(),
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
        alert("Fehler beim Speichern: " + error.message);
    }
}

function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const loadedData = JSON.parse(e.target.result);

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

                // Formular aktualisieren
                const characterNameInput = document.getElementById('characterName');
                if (characterNameInput) {
                    characterNameInput.value = MagicSystem.getCharacterName();
                }

                const advancementPointsSpan = document.getElementById('advancement-points');
                if (advancementPointsSpan) {
                    advancementPointsSpan.textContent = MagicSystem.getAdvancementPoints();
                }

                // UI aktualisieren
                renderMagicList();
                updatePreview();

                // Synchronisiere Änderungen zum Hauptsystem
                syncMagieToCharacter();

                alert('Magie-Daten erfolgreich geladen!');
            } catch (error) {
                alert('Fehler beim Laden der Datei: ' + error.message);
            }
        };

        reader.readAsText(file);
    } catch (error) {
        console.error("Fehler beim Datei-Upload:", error);
        alert("Fehler beim Laden der Datei: " + error.message);
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
    } else {
        console.error("MagicSystem ist nicht definiert!");
    }

    // DOM-Elemente überprüfen
    const magieTab = document.getElementById('magie-tab');
    console.log("Magie-Tab gefunden:", !!magieTab);

    if (magieTab) {
        console.log("Magie-Tab Inhalt:", magieTab.innerHTML.substring(0, 100) + "...");
    }

    const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
    console.log("Steigerungspunkte-Input gefunden:", !!steigerungspunkteInput);

    if (steigerungspunkteInput) {
        console.log("Steigerungspunkte-Wert:", steigerungspunkteInput.value);
    }

    console.log("%c=== Debug Ende ===", "color: purple; font-weight: bold;");
}

// Tab-Wechsel-Erkennung und Initialisierung
document.addEventListener('DOMContentLoaded', function () {
    // *** VERBESSERT: Initialisiere MagicSystem zuerst ***
    MagicSystem.init();

    // Setze globale Funktionen für andere Skripte
    window.renderMagicList = renderMagicList;
    window.updatePreview = updatePreview;

    // Tab-Wechsel erkennen und Synchronisation auslösen
    const tabItems = document.querySelectorAll('.tab-item');

    tabItems.forEach(tab => {
        tab.addEventListener('click', function () {
            if (this.getAttribute('data-tab') === 'magie-tab') {
                // Wenn der Magie-Tab aktiviert wird, Magie-System initialisieren
                console.log("Magie-Tab aktiviert, initialisiere System");

                // Sicherstellen, dass das Magiesystem initialisiert ist
                setTimeout(() => {
                    if (document.getElementById('magie-tab') &&
                        !document.getElementById('magie-tab').querySelector('.vanilla-magic-system')) {
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
        saveButton.onclick = function (event) {
            // Stelle sicher, dass das MagicSystem initialisiert ist
            MagicSystem.init();

            // Stelle sicher, dass die globalen Variablen aktuell sind
            MagicSystem.syncToGlobals();

            console.log("Speichern vorbereitet: Magie-Daten synchronisiert");

            // Falls es eine originale Click-Funktion gibt, führe sie aus
            if (typeof originalClick === 'function') {
                originalClick.call(this, event);
            }
        };
    }

    // Initialisiere das VanillaMagicSystem, wenn die Seite geladen ist
    if (document.getElementById('magie-tab')) {
        console.log("Magie-Tab gefunden, initialisiere System");
        setTimeout(() => {
            initializeVanillaMagicSystem();

            // Debug-Ausgabe für Fehlerbehebung
            setTimeout(debugMagicSystem, 200);
        }, 300);
    }
});

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
function createVanillaMagicHTML() {
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