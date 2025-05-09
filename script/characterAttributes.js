// characterAttributes.js
let kampfArr = []
function generateCharakterAttributes(data) {
    const walletContainer = document.getElementById('WalletContainer');
    const charakterContainer = document.getElementById('charakterContainer');
    charakterContainer.innerHTML = '';

    const charakter = data.charakter;

    const attributeFlexContainer = document.createElement('div');
    attributeFlexContainer.classList.add('attributeFlexContainer');

    // Alle vordefinierten Container auf dem Charakter-Tab identifizieren
    const modifierContainer = document.getElementById('modifierContainer');
    const sonderwerteContainer = document.getElementById('sonderwerteContainer');
    const attributeContainer = document.getElementById('attributeContainer');
    const magieContainer = document.getElementById('magischeElementeContainer');

    // Nur dynamisch erzeugte Container erstellen
    const Assassinen_TalenteContainer = createSection('Assassinen Talente', charakter.fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
    attributeFlexContainer.appendChild(Assassinen_TalenteContainer);

    const Talente_1Container = createSection('Talente 1', charakter.fähigkeiten.Talente_1, 'Talente_1');
    attributeFlexContainer.appendChild(Talente_1Container);

    const Talente_2Container = createSection('Talente 2', charakter.fähigkeiten.Talente_2, 'Talente_2');
    attributeFlexContainer.appendChild(Talente_2Container);

    const HandwerkstalenteContainer = createSection('Handwerkstalente', charakter.fähigkeiten.Handwerkstalente, 'Handwerkstalente');
    attributeFlexContainer.appendChild(HandwerkstalenteContainer);

    // Kampf_Talente direkt im kampfTalenteContainer (bereits im HTML definiert) anzeigen
    const kampfTalenteGridContainer = document.getElementById('kampfTalenteGridContainer');
    if (kampfTalenteGridContainer) {
        kampfTalenteGridContainer.innerHTML = '';  // Container leeren
        for (let key in charakter.fähigkeiten.Kampf_Talente) {
            const sanitizedKey = key.replace(/\s+/g, '_');
            const flexItem = document.createElement('div');
            flexItem.classList.add('BigFlexItem', 'ArrayContainer');

            flexItem.innerHTML = `<label>${key.charAt(0).toUpperCase() + key.slice(1)}:</label>`;

            // Hier werden die Eingabefelder generiert
            charakter.fähigkeiten.Kampf_Talente[key].forEach((value, index) => {
                const inputId = `Kampf_Talente_${sanitizedKey}_${index}`;
                const inputClass = `Kampf_Talente_${index}`;

                flexItem.innerHTML += `
                    <input 
                        class="stg ArrAttributeInput Kampf_Talente ${inputClass}" 
                        type="number" 
                        value="${value}" 
                        id="${inputId}">
                `;
                kampfArr.push(`Kampf_Talente_${sanitizedKey}_${index}`)
            });
            kampfTalenteGridContainer.appendChild(flexItem);
        }
    }

    // Füllen der bereits vordefinierten Container
    fillExistingContainer(modifierContainer, charakter.fähigkeiten.modifier, 'modifier');
    fillExistingContainer(sonderwerteContainer, charakter.fähigkeiten.sonderwerte, 'sonderwerte');
    fillExistingContainer(attributeContainer, charakter.fähigkeiten.attribute, 'attribute');
    
    // Magische Elemente im Magie-Tab anzeigen
    fillExistingContainer(magieContainer, charakter.Magische_Elemente, 'Magische_Elemente');

    // Restliche dynamisch erzeugte Container im charakterContainer anzeigen
    charakterContainer.appendChild(attributeFlexContainer);

    document.getElementById('saveButton').addEventListener('click', function () {
        saveChanges(data);
    });

    addInputChangeListeners();
    addToolTip();
}

function fillExistingContainer(container, attributes, sectionId) {
    if (!container || !attributes) return;
    
    // Container-Inhalt leeren, aber den Titel (h6) beibehalten
    const title = container.querySelector('h6');
    container.innerHTML = '';
    if (title) container.appendChild(title);
    
    // Für magische Elemente oder andere Objekte
    if (typeof attributes === 'object' && !Array.isArray(attributes)) {
        const grid = document.createElement('div');
        grid.classList.add(`${sectionId}-grid`);
        
        for (let key in attributes) {
            const sanitizedKey = key.replace(/\s+/g, '_');
            const flexItem = document.createElement('div');
            flexItem.classList.add('FlexItem');
            flexItem.id = `${sectionId}_${sanitizedKey}_Tooltip`;

            let attributeString = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;
            flexItem.innerHTML = `
                <label>${attributeString}</label>
                <input 
                    class="stg attributeInput ${sectionId} ${sectionId}_${sanitizedKey}" 
                    type="number" 
                    value="${attributes[key]}" 
                    id="${sectionId}_${sanitizedKey}">
                <button class="hidebutton">X</button>
            `;
            grid.appendChild(flexItem);
        }
        
        container.appendChild(grid);
    }
}

function createSection(title, attributes, sectionId) {
    const container = document.createElement('div');
    container.classList.add("FlexItemContainer");
    container.innerHTML = `<h6>${title}</h6>`;

    if (Array.isArray(attributes)) {
        const grid = document.createElement('div');
        grid.classList.add(`${sectionId.toLowerCase()}-grid`);
        
        attributes.forEach((attribute) => {
            const sanitizedName = attribute.Name.replace(/\s+/g, '_');
            const flexItem = document.createElement('div');
            flexItem.classList.add('FlexItem');

            let attributeString = `${attribute.Name} (${attribute.Attribute}): `;
            flexItem.innerHTML = `
                <label>${attributeString}</label>
                <input 
                    class="stg attributeInput ${sectionId}" 
                    type="number" 
                    value="${attribute.Wert}" 
                    id="${sectionId}_${sanitizedName}">
                <button class="hidebutton">X</button>
            `;
            grid.appendChild(flexItem);
        });
        
        container.appendChild(grid);
    }
    
    return container;
}


function addToolTip() {
    const ids = ['Magische_Elemente_Schatten_Tooltip', 'Magische_Elemente_Licht_Tooltip', 'Magische_Elemente_Holz_Tooltip', 'Magische_Elemente_Metall_Tooltip', 'Magische_Elemente_Eis_Tooltip', 'Magische_Elemente_Leben_Tooltip', 'Magische_Elemente_Nekromantie_Tooltip', 'Magische_Elemente_Blitz_Tooltip', 'Magische_Elemente_Gravitation_Tooltip', 'Magische_Elemente_Erschaffung_Tooltip', 'Magische_Elemente_Raumzeit_Tooltip', "Magische_Elemente_Gift_Tooltip","Magische_Elemente_Blut_Tooltip"];
    const tooltips = ["Benötigt: Luft Dunkle", "Benötigt: Helle Feuer", "Benötigt: Erde Wasser", "Benötigt: Erde Feuer", "Benötigt: Luft Wasser", "Benötigt: Heilung Natur", "Benötigt: Dunkle Leben", "Benötigt: Licht Luft", "Benötigt: Erde Luft", "Benötigt: Feuer Wasser Erde Luft Natur Dunkle Helle", "Benötigt: Alle Elemente", "Benötigt: Natur Wasser","Benötigt: Leben Wasser"];
    
    ids.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[index];
        }
    });
}

function MaxValue(level, MB) {
    let MaxValue = document.querySelectorAll(".Assassinen_Talente, .Talente_1, .Talente_2, .Handwerkstalente, .Kampf_Talente_2")
    MaxValue.forEach((attribute) => {
        attribute.max = level + 10
        attribute.min = -3
        if (attribute.max >= 21) {
            attribute.max = 21
        }
    })
    let maxAttribute = document.querySelectorAll(".attribute")
    maxAttribute.forEach((attribute) => {
        attribute.max = level + 12
        attribute.min = 7
        if (attribute.max >= 21) {
            attribute.max = 21
        }
    })
    let maxMagic = document.querySelectorAll(".Magische_Elemente")
    maxMagic.forEach((attribute) => {
        attribute.max = MB / 2
        attribute.min = 0
        if (attribute.max >= 21) {
            attribute.max = 21
        }
    })
    let modifier = document.querySelectorAll(".modifier")
    modifier.forEach((attribute) => {
        attribute.max = level + 2
        attribute.min = 0
    })
    let xp = document.querySelector("#erfahrung_xp")
    xp.setAttribute('step', '100');
}