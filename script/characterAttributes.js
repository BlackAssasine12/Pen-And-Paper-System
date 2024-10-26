// characterAttributes.js

function generateCharakterAttributes(data) {
    const walletContainer = document.getElementById('WalletContainer');
    const charakterContainer = document.getElementById('charakterContainer');
    charakterContainer.innerHTML = '';

    const charakter = data.charakter;

    const attributeFlexContainer = document.createElement('div');
    attributeFlexContainer.classList.add('attributeFlexContainer');

    const modifierContainer = createSection('Modifier', charakter.fähigkeiten.modifier, 'modifier');
    attributeFlexContainer.appendChild(modifierContainer);

    const sonderwerteContainer = createSection('Sonderwerte', charakter.fähigkeiten.sonderwerte, 'sonderwerte');
    attributeFlexContainer.appendChild(sonderwerteContainer);

    const attributeContainer = createSection('Attribute', charakter.fähigkeiten.attribute, 'attribute');
    attributeFlexContainer.appendChild(attributeContainer);

    const Assassinen_TalenteContainer = createSection('Assassinen Talente', charakter.fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
    attributeFlexContainer.appendChild(Assassinen_TalenteContainer);

    const Talente_1Container = createSection('Talente 1', charakter.fähigkeiten.Talente_1, 'Talente_1');
    attributeFlexContainer.appendChild(Talente_1Container);

    const Talente_2Container = createSection('Talente 2', charakter.fähigkeiten.Talente_2, 'Talente_2');
    attributeFlexContainer.appendChild(Talente_2Container);

    const HandwerkstalenteContainer = createSection('Handwerkstalente', charakter.fähigkeiten.Handwerkstalente, 'Handwerkstalente');
    attributeFlexContainer.appendChild(HandwerkstalenteContainer);

    const Kampf_TalenteContainer = createSection('Kampf Talente (AT/PA/Skillwert)', charakter.fähigkeiten.Kampf_Talente, 'Kampf_Talente');
    walletContainer.insertAdjacentElement('afterend', Kampf_TalenteContainer);

    const KampfBasiswerteContainer = createSection('Kampf Basiswerte', charakter.fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
    walletContainer.insertAdjacentElement('afterend', KampfBasiswerteContainer);

    const erfahrungContainer = createSection('Erfahrung', charakter.werte, 'erfahrung');
    walletContainer.insertAdjacentElement('afterend', erfahrungContainer);

    const Magische_ElementeContainer = createSection('Magische Elemente', charakter.Magische_Elemente, 'Magische_Elemente');
    attributeFlexContainer.appendChild(Magische_ElementeContainer);

    const hiddenItemsContainer = document.createElement('div');
    hiddenItemsContainer.classList.add('FlexItemContainer', 'hidden-items');
    hiddenItemsContainer.innerHTML = `<h6>Ausgeblendete Items</h6><div id="hiddenItemsContainer"></div>`;
    attributeFlexContainer.appendChild(hiddenItemsContainer);

    charakterContainer.appendChild(attributeFlexContainer);

    document.getElementById('saveButton').addEventListener('click', function () {
        saveChanges(data);
    });

    addInputChangeListeners();
    addToolTip();
}

function createSection(title, attributes, sectionId) {
    const container = document.createElement('div');
    container.classList.add("FlexItemContainer");
    container.innerHTML = `<h6>${title}</h6>`;

    if (sectionId === 'Kampf_Talente') {
        container.classList.add('BigFlexItemContainer');

        for (let key in attributes) {
            const flexItem = document.createElement('div');
            flexItem.classList.add('BigFlexItem');

            flexItem.innerHTML = `<label>${key.charAt(0).toUpperCase() + key.slice(1)}:</label>`;
            flexItem.classList.add('ArrayContainer');

            attributes[key].forEach((value, index) => {
                flexItem.innerHTML += `
                    <input class="stg ArrAttributeInput ${sectionId} ${sectionId}_${index}" type="number" value="${value}" id="${sectionId}_${key}_${index}">`;
            });

            container.appendChild(flexItem);
        }
    } else if (Array.isArray(attributes)) {
        attributes.forEach((attribute) => {
            const flexItem = document.createElement('div');
            flexItem.classList.add('FlexItem');

            let attributeString = `${attribute.Name} (${attribute.Attribute}): `;
            flexItem.innerHTML = `
                <label>${attributeString}</label>
                <input class="stg attributeInput ${sectionId}" type="number" value="${attribute.Wert}" id="${sectionId}_${attribute.Name}">
                <button class="hidebutton">X</button>
            `;
            container.appendChild(flexItem);
        });
    } else {
        for (let key in attributes) {
            const flexItem = document.createElement('div');
            flexItem.classList.add('FlexItem');
            flexItem.id = `${sectionId}_${key}_Tooltip`;

            let attributeString = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;
            flexItem.innerHTML = `
                <label>${attributeString}</label>
                <input class="stg attributeInput ${sectionId} ${sectionId}_${key}" type="number" value="${attributes[key]}" id="${sectionId}_${key}">
                <button class="hidebutton">X</button>
            `;
            container.appendChild(flexItem);
        }
    }
    return container;
}

function addToolTip() {
    const ids = ['Magische_Elemente_Schatten_Tooltip', 'Magische_Elemente_Licht_Tooltip', 'Magische_Elemente_Holz_Tooltip', 'Magische_Elemente_Metall_Tooltip', 'Magische_Elemente_Eis_Tooltip', 'Magische_Elemente_Leben_Tooltip', 'Magische_Elemente_Nekromantie_Tooltip', 'Magische_Elemente_Blitz_Tooltip', 'Magische_Elemente_Gravitation_Tooltip', 'Magische_Elemente_Erschaffung_Tooltip', 'Magische_Elemente_Raumzeit_Tooltip', "Magische_Elemente_Gift_Tooltip"];
    const tooltips = ["Benötigt: Luft Dunkle", "Benötigt: Helle Feuer", "Benötigt: Erde Wasser", "Benötigt: Erde Feuer", "Benötigt: Luft Wasser", "Benötigt: Heilung Natur", "Benötigt: Dunkle Leben", "Benötigt: Licht Luft", "Benötigt: Erde Luft", "Benötigt: Feuer Wasser Erde Luft Natur Dunkle Helle", "Benötigt: Alle Elemente", "Benötigt: Natur Wasser"];

    ids.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[index];
        }
    });
}

function MaxValue(level, MB) {

    let MaxValue = document.querySelectorAll(".Assassinen_Talente, .Talente_1, .Talente_2, .Handwerkstalente")
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
}