// script/vanillaMagicSystem.js

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

// Globale Variablen für Magie
let characterMagic = [];
let advancementPoints = 20;
let characterName = "";

// DOM-Elemente initialisieren
function initVanillaMagicSystem() {
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
    saveButton.addEventListener('click', saveCharacter);
    loadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    characterNameInput.addEventListener('input', (e) => {
        characterName = e.target.value;
        updatePreview();
    });
    
    // Synchronisiere mit dem Hauptcharakterbogen
    synchronizeWithCharacterSheet();
}

function populateSelectElements() {
    const elementSelect = document.getElementById('elementSelect');
    const magicTypeSelect = document.getElementById('magicTypeSelect');
    
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
}

function toggleCustomElement() {
    const elementSelect = document.getElementById('elementSelect');
    const customElementContainer = document.getElementById('customElementContainer');
    
    if (elementSelect.value === 'custom') {
        customElementContainer.classList.remove('hidden');
    } else {
        customElementContainer.classList.add('hidden');
    }
}

function addMagic() {
    const elementSelect = document.getElementById('elementSelect');
    const customElementInput = document.getElementById('customElement');
    const magicTypeSelect = document.getElementById('magicTypeSelect');
    const magicLevelInput = document.getElementById('magicLevel');
    const levelErrorDiv = document.getElementById('levelError');
    
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
    
    characterMagic.push(newMagic);
    magicLevelInput.value = 1;
    
    // UI aktualisieren
    renderMagicList();
    updatePreview();
    
    // Aktualisiere die Magie-Elemente im Charakter-Sheet
    updateCharacterSheetMagic();

    // Fehlermeldungen zurücksetzen
    levelErrorDiv.classList.add('hidden');
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

function removeMagic(index) {
    characterMagic.splice(index, 1);
    renderMagicList();
    updatePreview();
    updateCharacterSheetMagic();
}

function levelUpMagic(index) {
    const magic = characterMagic[index];
    
    if (magic.level >= 21) {
        alert('Maximales Level (21) bereits erreicht!');
        return;
    }
    
    const cost = getLevelUpCost(magic.level);
    
    if (advancementPoints < cost) {
        alert(`Nicht genügend Steigerungspunkte! Du brauchst ${cost} Punkte, um auf Level ${magic.level + 1} zu steigern.`);
        return;
    }
    
    // Erhöhe Level und ziehe Punkte ab
    characterMagic[index].level++;
    advancementPoints -= cost;
    
    // UI aktualisieren
    const advancementPointsSpan = document.getElementById('advancement-points');
    advancementPointsSpan.textContent = advancementPoints;
    renderMagicList();
    updatePreview();
    updateCharacterSheetMagic();
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
    const pointsToAdd = parseInt(prompt('Wie viele Steigerungspunkte möchtest du hinzufügen?', '5'));
    
    if (!isNaN(pointsToAdd) && pointsToAdd > 0) {
        advancementPoints += pointsToAdd;
        document.getElementById('advancement-points').textContent = advancementPoints;
        
        // Synchronisiere mit dem Charakter-Sheet
        const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
        if (steigerungspunkteInput) {
            steigerungspunkteInput.value = parseInt(steigerungspunkteInput.value) + pointsToAdd;
        }
    }
}

function renderMagicList() {
    const magicListDiv = document.getElementById('magic-list');
    magicListDiv.innerHTML = '';
    
    if (characterMagic.length === 0) {
        magicListDiv.innerHTML = '<p>Noch keine Magien hinzugefügt. Füge oben deine erste Magie hinzu!</p>';
        return;
    }
    
    characterMagic.forEach((magic, index) => {
        const elementIcon = getIcon('element', magic.element);
        const typeIcon = getIcon('magicType', magic.type);
        
        // Kosten für nächstes Level berechnen
        const nextLevelCost = magic.level < 21 ? getLevelUpCost(magic.level) : null;
        const levelUpDisabled = nextLevelCost > advancementPoints || magic.level >= 21;
        
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
        
        levelUpBtn.addEventListener('click', () => levelUpMagic(index));
        removeBtn.addEventListener('click', () => removeMagic(index));
        
        magicListDiv.appendChild(magicDiv);
    });
}

function updatePreview() {
    const previewContent = document.getElementById('previewContent');
    
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
        <h2>${characterName || 'Unbenannter Charakter'}</h2>
        <div class="stats-box">
            <div class="stat-item">
                <span class="stat-label">Steigerungspunkte:</span>
                <span class="stat-value">${advancementPoints}</span>
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
}

function saveCharacter() {
    if (characterMagic.length === 0) {
        alert('Füge mindestens eine Magie hinzu, bevor du speicherst');
        return;
    }
    
    const characterData = {
        name: characterName || 'Unbenannter Charakter',
        advancementPoints,
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
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            
            // Validiere geladene Daten
            if (!loadedData.name || !Array.isArray(loadedData.magic)) {
                throw new Error('Ungültiges Dateiformat');
            }
            
            // Setze Charakternamen
            characterName = loadedData.name;
            document.getElementById('characterName').value = characterName;
            
            // Setze Magie-Daten
            characterMagic = loadedData.magic;
            
            // Behandle Steigerungspunkte
            if (loadedData.advancementPoints !== undefined) {
                advancementPoints = loadedData.advancementPoints;
                document.getElementById('advancement-points').textContent = advancementPoints;
            }
            
            // UI aktualisieren
            renderMagicList();
            updatePreview();
            updateCharacterSheetMagic();
            
            alert('Magie-Daten erfolgreich geladen!');
        } catch (error) {
            alert('Fehler beim Laden der Datei: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Synchronisiere mit dem Haupt-Charakter-Sheet
function synchronizeWithCharacterSheet() {
    // Lade die aktuellen Steigerungspunkte, falls verfügbar
    const steigerungspunkteInput = document.getElementById('erfahrung_Steigerungspunkte');
    if (steigerungspunkteInput) {
        advancementPoints = parseInt(steigerungspunkteInput.value) || 20;
        document.getElementById('advancement-points').textContent = advancementPoints;
    }
    
    // Lade den Charakternamen, falls verfügbar
    const nameInput = document.getElementById('name');
    if (nameInput) {
        characterName = nameInput.value.trim();
        document.getElementById('characterName').value = characterName;
    }
    
    // Lade die bestehenden magischen Elemente aus dem Charakter-Sheet
    loadMagicElementsFromCharacterSheet();
}

// Lade Magische Elemente aus dem Charakter-Sheet
function loadMagicElementsFromCharacterSheet() {
    // Sammle alle Magischen Elemente aus dem bestehenden Charakter-Sheet
    const magicElements = {};
    const magicInputs = document.querySelectorAll('.Magische_Elemente');
    
    magicInputs.forEach(input => {
        const element = input.id.replace('Magische_Elemente_', '');
        const level = parseInt(input.value) || 0;
        
        if (level > 0) {
            magicElements[element] = level;
        }
    });
    
    // Konvertiere die Elemente in das Format für characterMagic
    characterMagic = [];
    for (const [element, level] of Object.entries(magicElements)) {
        if (level > 0) {
            characterMagic.push({
                element,
                type: 'Angriff', // Standard-Typ, da das alte System keine Typen hatte
                level
            });
        }
    }
    
    // UI aktualisieren
    renderMagicList();
    updatePreview();
}

// Aktualisiere die Magischen Elemente im Charakter-Sheet
function updateCharacterSheetMagic() {
    // Zuerst alle Magischen Elemente zurücksetzen
    const magicInputs = document.querySelectorAll('.Magische_Elemente');
    magicInputs.forEach(input => {
        input.value = 0;
    });
    
    // Dann für jedes Element den höchsten Level nehmen und im Charakter-Sheet setzen
    const magicElements = {};
    characterMagic.forEach(magic => {
        if (!magicElements[magic.element] || magicElements[magic.element] < magic.level) {
            magicElements[magic.element] = magic.level;
        }
    });
    
    // Die Werte ins Charakter-Sheet übertragen
    for (const [element, level] of Object.entries(magicElements)) {
        const input = document.getElementById(`Magische_Elemente_${element}`);
        if (input) {
            input.value = level;
        }
    }
    
    // Berechnung der Charakterwerte aktualisieren
    if (typeof updateCharakterCalculation === 'function') {
        updateCharakterCalculation();
    }
}

// Initialisiere das System, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('magie-tab')) {
        initializeVanillaMagicSystem();
    }
});

// Funktion zum Initialisieren des Systems nach DOM-Manipulation
function initializeVanillaMagicSystem() {
    const magieTab = document.getElementById('magie-tab');
    if (!magieTab) return;
    
    // HTML für das Vanilla Magic System einfügen
    const vanillaMagicHTML = createVanillaMagicHTML();
    magieTab.appendChild(vanillaMagicHTML);
    
    // System initialisieren
    initVanillaMagicSystem();
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
                <button id="saveButton" class="btn">
                    <i class="fas fa-save"></i> Magie speichern
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