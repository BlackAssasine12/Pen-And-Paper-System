document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            initializeWallet(data);

            generateCharacterAttributes(data);
            genCharInfo(data);
            bindHideButtons();
            updateCharakterCalculation();
        };
        reader.readAsText(file);
    }
});
let attributeCost, talenteCost, dsaTalenteCost, modifier_magieCost, modifier_aspCost, modifier_lpCost, modifier_fernkampfCost, modifier_nahkampfCost, modifier_giftCost, modifier_stealthCost;

const adjustments = {
    'modifier_stealth': 10,
    'modifier_magie': 10,
    'modifier_asp': 10,
    'modifier_lp': 10,
    'modifier_fernkampf': 10,
    'modifier_nahkampf': 10,
    'modifier_gift': 10,
    'attribute': 5,
    'talente': 3,
    'dsaTalente': 3
};

function initializeWallet(data) {
    if (data.charakter && data.charakter.geld && data.charakter.geld[0]) {
        const geld = data.charakter.geld[0];
        wallet.dukaten = geld.dukaten;
        wallet.silber = geld.silber;
        wallet.heller = geld.heller;
        wallet.kreuzer = geld.kreuzer;
        updateWalletDisplay();
    }
}
function updateWalletDisplay() {
    document.getElementById('showDukaten').innerText = wallet.dukaten;
    document.getElementById('showSilber').innerText = wallet.silber;
    document.getElementById('showHeller').innerText = wallet.heller;
    document.getElementById('showKreuzer').innerText = wallet.kreuzer;
}
let wallet = {
    dukaten: 0,
    silber: 0,
    heller: 0,
    kreuzer: 0,
    wInsg: 0
};
function genCharInfo(data) {
    const character = data.charakter;
    const CharakterInfoContainer = character.charakterInfo[0];
    let showname = document.getElementById("name");
    let showalter = document.getElementById("alter");
    let showgeschlecht = document.getElementById("geschlecht");
    let showrasse = document.getElementById("rasse");
    let showgröße = document.getElementById("größe");
    let showgewicht = document.getElementById("gewicht");
    let showhaarfarbe = document.getElementById("haarfarbe");
    let showaugenfarbe = document.getElementById("augenfarbe");
    let showtitel = document.getElementById("titel");
    showname.value = CharakterInfoContainer.name;
    showalter.value = CharakterInfoContainer.alter;
    showgeschlecht.value = CharakterInfoContainer.geschlecht;
    showrasse.value = CharakterInfoContainer.rasse;
    showgröße.value = CharakterInfoContainer.größe;
    showgewicht.value = CharakterInfoContainer.gewicht;
    showhaarfarbe.value = CharakterInfoContainer.haarfarbe;
    showaugenfarbe.value = CharakterInfoContainer.augenfarbe;
    showtitel.value = CharakterInfoContainer.titel;
}
function updateCharakterInfo(characterInfo) {
    characterInfo.name = document.getElementById("name").value;
    characterInfo.alter = document.getElementById("alter").value;
    characterInfo.geschlecht = document.getElementById("geschlecht").value;
    characterInfo.rasse = document.getElementById("rasse").value;
    characterInfo.größe = document.getElementById("größe").value;
    characterInfo.gewicht = document.getElementById("gewicht").value;
    characterInfo.haarfarbe = document.getElementById("haarfarbe").value;
    characterInfo.augenfarbe = document.getElementById("augenfarbe").value;
    characterInfo.titel = document.getElementById("titel").value;
}
function addInputChangeListeners() {
    const inputElements = document.querySelectorAll('.attributeInput');
    inputElements.forEach(input => {
        input.addEventListener('change', updateCharakterCalculation);
    });
    console.log('Adding input change listeners');
    const mainInput = document.getElementById('erfahrung_Gesteigerte');

    console.log(adjustments)

    Object.keys(adjustments).forEach(klass => {
        document.querySelectorAll(`.${klass}`).forEach(input => {
            input.setAttribute('data-initial', input.value);

            input.addEventListener('input', function () {
                const initialValue = parseInt(input.getAttribute('data-initial'));
                const newValue = parseInt(input.value);
                const diff = newValue - initialValue;

                if (!isNaN(diff)) {
                    mainInput.value = parseInt(mainInput.value) + (diff * adjustments[klass]);
                    input.setAttribute('data-initial', newValue);
                }
            });
        });
    });
}
function generateCharacterAttributes(data) {
    const characterContainer = document.getElementById('characterContainer');
    characterContainer.innerHTML = ''; // Clear any existing content

    const character = data.charakter;

    // Create a container for the character attributes
    const attributeFlexContainer = document.createElement('div');
    attributeFlexContainer.classList.add('attributeFlexContainer');

    // Modifier Section
    const modifierContainer = createSection('Modifier', character.fähigkeiten[0].modifier[0], 'modifier');
    attributeFlexContainer.appendChild(modifierContainer);

    // Erfahrung Section
    const erfahrungContainer = createSection('Erfahrung', character.werte[0], 'erfahrung');
    attributeFlexContainer.appendChild(erfahrungContainer);

    // Sonderwerte Section
    const sonderwerteContainer = createSection('Sonderwerte', character.fähigkeiten[0].sonderwerte[0], 'sonderwerte');
    attributeFlexContainer.appendChild(sonderwerteContainer);

    // Attribute Section
    const attributeContainer = createSection('Attribute', character.fähigkeiten[0].attribute[0], 'attribute');
    attributeFlexContainer.appendChild(attributeContainer);

    // Talente Section
    const talenteContainer = createSection('Talente', character.fähigkeiten[0].talente[0], 'talente');
    attributeFlexContainer.appendChild(talenteContainer);

    // DSA Talente Section
    const dsaTalenteContainer = createSection('DSA Talente', character.fähigkeiten[0].dsaTalente[0], 'dsaTalente');
    attributeFlexContainer.appendChild(dsaTalenteContainer);

    const KampfBasiswerteContainer = createSection('Kampf Basiswerte', character.fähigkeiten[0].KampfBasiswerte[0], 'KampfBasiswerte');
    attributeFlexContainer.appendChild(KampfBasiswerteContainer);

    // Hidden Items Section
    const hiddenItemsContainer = document.createElement('div');
    hiddenItemsContainer.classList.add('FlexItemContainer', 'hidden-items');
    hiddenItemsContainer.innerHTML = `<h6>Ausgeblendete Items</h6><div id="hiddenItemsContainer"></div>`;
    attributeFlexContainer.appendChild(hiddenItemsContainer);

    characterContainer.appendChild(attributeFlexContainer);

    document.getElementById('saveButton').addEventListener('click', function () {
        saveChanges(data);
    });

    // Hinzufügen der Änderungslistener
    addInputChangeListeners(); // Aufruf hier hinzugefügt
}
function createSection(title, attributes, sectionId) {
    const container = document.createElement('div');
    container.classList.add('FlexItemContainer');
    container.innerHTML = `<h6>${title}</h6>`;

    for (let key in attributes) {
        const flexItem = document.createElement('div');
        flexItem.classList.add('FlexItem');
        flexItem.innerHTML = `
            ${key.charAt(0).toUpperCase() + key.slice(1)}
            <input class="attributeInput ${sectionId} ${sectionId}_${key}" type="number" value="${attributes[key]}" id="${sectionId}_${key}">
            <button class="hidebutton">X</button>`;
        container.appendChild(flexItem);
    }
    return container;
}
function updateSectionValues(section, sectionId) {
    for (let key in section) {
        const input = document.getElementById(`${sectionId}_${key}`);
        if (input) {
            section[key] = input.value;
        }
    }
}
function bindHideButtons() {
    const hideButtons = document.querySelectorAll('.hidebutton');
    const hiddenItemsContainer = document.getElementById('hiddenItemsContainer');

    hideButtons.forEach(button => {
        button.addEventListener('click', function () {
            const flexItem = button.closest('.FlexItem, .BigFlexItem');
            if (flexItem) {
                const inputs = flexItem.querySelectorAll('input');
                const inputValues = Array.from(inputs).map(input => input.value);

                flexItem.style.display = 'none';

                const hiddenItem = document.createElement('div');
                hiddenItem.classList.add('hidden-item');
                hiddenItem.classList.add(flexItem.classList.contains('BigFlexItem') ? 'BigFlexItem' : 'FlexItem');

                // Kopiere den Inhalt des flexItems ohne das x-Button
                const flexItemContent = flexItem.cloneNode(true);

                // Entferne den "x"-Button aus dem geklonten Inhalt
                const xButton = flexItemContent.querySelector('.hidebutton');
                if (xButton) {
                    xButton.remove();
                }

                hiddenItem.innerHTML = flexItemContent.innerHTML;

                // Restore values to the cloned inputs
                const hiddenInputs = hiddenItem.querySelectorAll('input');
                hiddenInputs.forEach((input, index) => {
                    input.value = inputValues[index];
                });

                const restoreButton = document.createElement('button');
                restoreButton.classList.add('hidebutton');
                restoreButton.textContent = '<';

                restoreButton.addEventListener('click', function () {
                    const originalInputs = flexItem.querySelectorAll('input');
                    hiddenInputs.forEach((input, index) => {
                        originalInputs[index].value = input.value;
                    });

                    flexItem.style.display = 'flex';
                    hiddenItemsContainer.removeChild(hiddenItem);
                });

                hiddenItem.appendChild(restoreButton);
                hiddenItemsContainer.appendChild(hiddenItem);
            }
        });
    });
}
function setKlassenVariable(selectedClass, klassen) {
    let variable;
    if (klassen["Magische Klassen"].includes(selectedClass)) {
        adjustments.modifier_magie = 3;
        adjustments.modifier_asp = 5;
    } else if (klassen["Nahkampf Basierte Klassen"].includes(selectedClass)) {
        adjustments.modifier_nahkampf = 3;
        adjustments.modifier_lp = 5;
    } else if (klassen["Fernkampf Basierte Klassen"].includes(selectedClass)) {
        adjustments.modifier_fernkampf = 3;
        adjustments.modifier_stealth = 5;
    } else if (klassen["Wissenschaftliche Klassen"].includes(selectedClass)) {
        variable = 3;
    } else if (klassen["Arbeiterklassen"].includes(selectedClass)) {
        adjustments.attribute = 2;
        adjustments.modifier_gift = 8;
    } else if (klassen["Halbmagische Klassen"].includes(selectedClass)) {
        adjustments.modifier_magie = 8;
        adjustments.modifier_asp = 8;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_lp = 8;
    } else if (klassen["Stealth Klassen"].includes(selectedClass)) {
        adjustments.modifier_stealth = 3;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_gift = 8;
    } else if (klassen["Spezialklassen"].includes(selectedClass)) {
        variable = 7;
    } else {
        variable = 0; // Standardwert falls die Klasse nicht gefunden wird
    }
    addInputChangeListeners()
    return variable;
}
function updateCharakterCalculation() {
    let KO, KK, GE, KL, IN, FF, CH, GESCH, Tarnung, WIL, LP, AUSD, maxASP, MB, MR, level, xp, magicModifier, aspModifier, lpModifier, fernModifier, nahModifier, schuss, wurf, Attacke, Parade, Giftresistenz, giftModifier, Sin, Steigerungspunkte, Gesteigerte;


    //NOTE - Modifier
    lpModifier = parseInt(document.getElementById("modifier_lp").value);
    aspModifier = parseInt(document.getElementById("modifier_asp").value);
    magicModifier = parseInt(document.getElementById("modifier_magie").value);
    fernModifier = parseInt(document.getElementById("modifier_fernkampf").value);
    nahModifier = parseInt(document.getElementById("modifier_nahkampf").value);
    giftModifier = parseInt(document.getElementById("modifier_gift").value);

    //NOTE - Variabel  Charisma
    xp = parseInt(document.getElementById("erfahrung_xp").value);
    KK = parseInt(document.getElementById("attribute_körperkraft").value);
    GE = parseInt(document.getElementById("attribute_gewandheit").value);
    KL = parseInt(document.getElementById("attribute_klugheit").value);
    IN = parseInt(document.getElementById("attribute_intuition").value);
    FF = parseInt(document.getElementById("attribute_fingerfertigkeit").value);
    CH = parseInt(document.getElementById("attribute_charisma").value);
    GESCH = parseInt(document.getElementById("attribute_geschicklichkeit").value);
    Tarnung = parseInt(document.getElementById("attribute_tarnung").value);
    Sin = parseInt(document.getElementById("attribute_sinnesschärfe").value);
    WIL = parseInt(document.getElementById("attribute_willenskraft").value);
    KO = parseInt(document.getElementById("attribute_konstitution").value);
    Gesteigerte = parseInt(document.getElementById("erfahrung_Gesteigerte").value);

    //NOTE - Rechenbar
    if (xp <= 900) { //level 0 bis 6
        level = Math.floor(xp / 150);
    } else if (xp <= 4200) { //level 7 bis 14
        level = Math.floor(xp / 600 + 7);
    } else { //level 15 bis ´´
        level = Math.floor(xp / 1200 + 10.5);
    }

    document.getElementById("erfahrung_level").value = level;

    LP = KK + lpModifier + level * 6;
    document.getElementById("sonderwerte_MaximaleLP").value = LP;

    AUSD = LP + KO;
    document.getElementById("sonderwerte_MaximaleAusdauer").value = AUSD;

    maxASP = level * 6 + aspModifier;
    document.getElementById("sonderwerte_MaximaleAstralenergie").value = maxASP;

    MB = Math.round((maxASP / 8) + magicModifier);
    document.getElementById("sonderwerte_Magiebegabung").value = MB;

    MR = Math.round((MB + level + KL) / 3);
    document.getElementById("sonderwerte_Magieresistenz").value = MR;

    Giftresistenz = Math.round((AUSD) / 10 + giftModifier);
    document.getElementById("sonderwerte_Giftresistenz").value = Giftresistenz;

    wurf = Math.round((IN + FF + KK) / 4);
    document.getElementById("KampfBasiswerte_Wurfwaffen Basiswert").value = wurf;

    schuss = Math.round((IN + FF + KK) / 4);
    document.getElementById("KampfBasiswerte_Schusswaffen Basiswert").value = schuss;

    Attacke = Math.round((KO + GE + KK) / 5);
    document.getElementById("KampfBasiswerte_Attacke Basiswert").value = Attacke;

    Parade = Math.round((IN + GE + KK) / 5);
    document.getElementById("KampfBasiswerte_Parade Basiswert").value = Parade;

    Steigerungspunkte = level * 30 - Gesteigerte;
    document.getElementById("erfahrung_Steigerungspunkte").value = Steigerungspunkte;

}
function TheChoosenOne() {
    let CurrencyField = document.getElementById("CurrencyField");
    let wCurrencyField = CurrencyField.options[CurrencyField.selectedIndex].value;
    let wNumberInput = parseFloat(document.getElementById("NumberInput").value);
    let NumberInput = document.getElementById("NumberInput").value;

    if (wCurrencyField === "dukaten") {
        wallet.wInsg += wNumberInput * 1000;
        wallet.dukaten += wNumberInput;
    } else if (wCurrencyField === "silber") {
        wallet.wInsg += wNumberInput * 100;
        wallet.silber += wNumberInput;
    } else if (wCurrencyField === "heller") {
        wallet.wInsg += wNumberInput * 10;
        wallet.heller += wNumberInput;
    } else if (wCurrencyField === "kreuzer") {
        wallet.wInsg += wNumberInput;
        wallet.kreuzer += wNumberInput;
    } else {
        alert("Please enter a valid Currency");
    }
    updateWalletDisplay();
}
function convert() {
    wallet.wInsg = wallet.kreuzer + wallet.heller * 10 + wallet.silber * 100 + wallet.dukaten * 1000;

    wallet.dukaten = Math.floor(wallet.wInsg / 1000);
    wallet.wInsg %= 1000;

    wallet.silber = Math.floor(wallet.wInsg / 100);
    wallet.wInsg %= 100;

    wallet.heller = Math.floor(wallet.wInsg / 10);
    wallet.wInsg %= 10;

    wallet.kreuzer = Math.floor(wallet.wInsg);
    wallet.wInsg %= 1;

    updateWalletDisplay();
}
function wReset() {
    let wrReset = prompt("Please write 'reset' to reset your wallet");
    if (wrReset === "reset") {
        wallet.wInsg = 0;
        wallet.dukaten = 0;
        wallet.silber = 0;
        wallet.heller = 0;
        wallet.kreuzer = 0;
        updateWalletDisplay();
    } else {
        alert("Wrong Input");
    }
}
function saveChanges(data) {
    const character = data.charakter;
console.log("ausgeführt")
    // Update values from the inputs
    if (character.fähigkeiten && character.fähigkeiten[0]) {
        if (character.fähigkeiten[0].modifier && character.fähigkeiten[0].modifier[0]) {
            updateSectionValues(character.fähigkeiten[0].modifier[0], 'modifier');
        }
        if (character.werte && character.werte[0]) {
            updateSectionValues(character.werte[0], 'erfahrung');
        }
        if (character.fähigkeiten[0].sonderwerte && character.fähigkeiten[0].sonderwerte[0]) {
            updateSectionValues(character.fähigkeiten[0].sonderwerte[0], 'sonderwerte');
        }
        if (character.fähigkeiten[0].attribute && character.fähigkeiten[0].attribute[0]) {
            updateSectionValues(character.fähigkeiten[0].attribute[0], 'attribute');
        }
        if (character.fähigkeiten[0].talente && character.fähigkeiten[0].talente[0]) {
            updateSectionValues(character.fähigkeiten[0].talente[0], 'talente');
        }
        if (character.fähigkeiten[0].dsaTalente && character.fähigkeiten[0].dsaTalente[0]) {
            updateSectionValues(character.fähigkeiten[0].dsaTalente[0], 'dsaTalente');
        }
        if (character.fähigkeiten[0].KampfBasiswerte && character.fähigkeiten[0].KampfBasiswerte[0]) {
            updateSectionValues(character.fähigkeiten[0].KampfBasiswerte[0], 'KampfBasiswerte');
        }
    }

    // Update CharakterInfo values
    if (character.charakterInfo && character.charakterInfo[0]) {
        updateCharakterInfo(character.charakterInfo[0]);
    }

    // Update Wallet values
    if (character.geld && character.geld[0]) {
        character.geld[0] = { ...wallet };
    }

    // Aktualisieren der Charakterberechnung
    updateCharakterCalculation();

    // Convert JSON to string and create a blob
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'charakter.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
document.getElementById('saveButton').addEventListener('click', function () {
    const data = { charakter: { geld: [wallet] } }; // Add other necessary data
    saveChanges(data);
});

