//NOTE - Filereader
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            initializeWallet(data);

            generateCharakterAttributes(data);
            genCharInfo(data);
            bindHideButtons();
            updateCharakterCalculation();
        };
        reader.readAsText(file);
    }
});
//NOTE -  Objekt für Steigerungswerte
const adjustments = {
    'modifier_stealth': 10,
    'modifier_magie': 10,
    'modifier_asp': 10,
    'modifier_lp': 10,
    'modifier_fernkampf': 10,
    'modifier_nahkampf': 10,
    'modifier_gift': 10,
    'attribute': 5,
    'Kampf_Talente_2': 5,
    'Assassinen_Talente': 3,
    'Normale_Talente': 3,
    'Handwerkstalente': 3,
    'attribute_Klugheit': 5,
    'Tarnung': 5,
    'Fingerfertigkeit': 5,
    'Magische_Elemente': 25,
    'Magische_Elemente_Raumzeit': 80,
    'Talente_1': 3,
    'Talente_2': 3,
    'attribute_Körperkraft':5,
    'Wissenschaftliche_Talente': 3,
};
//NOTE - Anpassung der Steigerungswerte nach Klassen
function setKlassenVariable(selectedClass, klassen) {
    if (klassen["Magische Klassen"].includes(selectedClass)) {
        adjustments.modifier_magie = 3;
        adjustments.modifier_asp = 5;
        adjustments.Magische_Elemente = 20;
    } else if (klassen["Nahkampf Basierte Klassen"].includes(selectedClass)) {
        adjustments.modifier_nahkampf = 3;
        adjustments.modifier_lp = 5;
        adjustments.attribute_Körperkraft = 3;
    } else if (klassen["Fernkampf Basierte Klassen"].includes(selectedClass)) {
        adjustments.modifier_fernkampf = 3;
        adjustments.modifier_stealth = 5;
    } else if (klassen["Wissenschaftliche Klassen"].includes(selectedClass)) {
        adjustments.attribute_Klugheit = 3
        adjustments.Wissenschaftliche_Talente = 2;

    } else if (klassen["Arbeiterklassen"].includes(selectedClass)) {
        adjustments.Handwerkstalente = 2;
        adjustments.attribute = 4;
    } else if (klassen["Halbmagische Klassen"].includes(selectedClass)) {
        adjustments.modifier_magie = 8;
        adjustments.modifier_asp = 8;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_lp = 8;
        adjustments.Magische_Elemente = 23;

    } else if (klassen["Stealth Klassen"].includes(selectedClass)) {
        adjustments.modifier_stealth = 3;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_gift = 8;
        adjustments.Assassinen_Talente = 1;
    } else if (klassen["Spezialklassen"].includes(selectedClass)) {
        adjustments.modifier_magie = 8;
        adjustments.modifier_asp = 8;
        adjustments.modifier_nahkampf = 8;
        adjustments.modifier_fernkampf = 8;
        adjustments.modifier_lp = 8;
        adjustments.Magische_Elemente = 23;
    } else {
       console.log("Klasse nicht gefunden")
    }
    addInputChangeListeners()
}
//NOTE - Übertragung und aktuallisierung von CharakterInfos
function genCharInfo(data) {
    const charakter = data.charakter;
    const CharakterInfoContainer = charakter.charakterInfo;
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
function updateCharakterInfo(charakterInfo) {
    charakterInfo.name = document.getElementById("name").value;
    charakterInfo.alter = document.getElementById("alter").value;
    charakterInfo.geschlecht = document.getElementById("geschlecht").value;
    charakterInfo.rasse = document.getElementById("rasse").value;
    charakterInfo.größe = document.getElementById("größe").value;
    charakterInfo.gewicht = document.getElementById("gewicht").value;
    charakterInfo.haarfarbe = document.getElementById("haarfarbe").value;
    charakterInfo.augenfarbe = document.getElementById("augenfarbe").value;
    charakterInfo.titel = document.getElementById("titel").value;
}
//NOTE - Inupt EventListener + Updaten von Steigerungspunkten
function addInputChangeListeners() {
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach(input => {
        input.addEventListener('change', updateCharakterCalculation);
    });
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
//NOTE - Nimmt die daten vom Filereader und erstellt den Charakterbogen mithilfe von createSection()
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

    const Assassinen_TalenteContainer = createSection('Assassinen_Talente', charakter.fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
    attributeFlexContainer.appendChild(Assassinen_TalenteContainer);

    const Talente_1Container = createSection('Talente_1', charakter.fähigkeiten.Talente_1, 'Talente_1');
    attributeFlexContainer.appendChild(Talente_1Container);

    const Talente_2Container = createSection('Talente_2', charakter.fähigkeiten.Talente_2, 'Talente_2');
    attributeFlexContainer.appendChild(Talente_2Container);

    const HandwerkstalenteContainer = createSection('Handwerkstalente', charakter.fähigkeiten.Handwerkstalente, 'Handwerkstalente');
    attributeFlexContainer.appendChild(HandwerkstalenteContainer);



    const Kampf_TalenteContainer = createSection('Kampf_Talente (AT/PA/Skillwert)', charakter.fähigkeiten.Kampf_Talente, 'Kampf_Talente');
    walletContainer.insertAdjacentElement('afterend', Kampf_TalenteContainer);

    const KampfBasiswerteContainer = createSection('Kampf Basiswerte', charakter.fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
    walletContainer.insertAdjacentElement('afterend', KampfBasiswerteContainer);

    const erfahrungContainer = createSection('Erfahrung', charakter.werte, 'erfahrung');
    walletContainer.insertAdjacentElement('afterend', erfahrungContainer);

    const hiddenItemsContainer = document.createElement('div');
    hiddenItemsContainer.classList.add('FlexItemContainer', 'hidden-items');
    hiddenItemsContainer.innerHTML = `<h6>Ausgeblendete Items</h6><div id="hiddenItemsContainer"></div>`;
    attributeFlexContainer.appendChild(hiddenItemsContainer);

    charakterContainer.appendChild(attributeFlexContainer);

    const Magische_ElementeContainer = createSection('Magische_Elemente', charakter.Magische_Elemente, 'Magische_Elemente');
    attributeFlexContainer.appendChild(Magische_ElementeContainer);
    
    document.getElementById('saveButton').addEventListener('click', function () {
        saveChanges(data);
    });

    addInputChangeListeners();
}
//NOTE - Erstellung Sectionen und Klassen-/ID zuweisung
function createSection(title, attributes, sectionId) {
    const container = document.createElement('div');
    container.innerHTML = `<h6>${title}</h6>`;

    for (let key in attributes) {
        const flexItem = document.createElement('div');

        // Überprüfen, ob der Wert ein Array ist
        if (sectionId === 'Kampf_Talente') {
            container.classList.add('BigFlexItemContainer');
            flexItem.classList.add('BigFlexItem');

            flexItem.innerHTML = `<label>${key.charAt(0).toUpperCase() + key.slice(1)}:</label>`;
            flexItem.classList.add('ArrayContainer');
            attributes[key].forEach((value, index) => {
                flexItem.innerHTML += `
                    <input class="stg ArrAttributeInput ${sectionId}_${index} ${sectionId}_${key}_${index}" type="number" value="${value}" id="${sectionId}_${key}_${index}">`;
            });
        } else {
            container.classList.add('FlexItemContainer');
            flexItem.classList.add('FlexItem');

            flexItem.innerHTML = `
                <label for="${sectionId}_${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input class="stg attributeInput ${sectionId} ${sectionId}_${key}" type="number" value="${attributes[key]}" id="${sectionId}_${key}">
                <button class="hidebutton">X</button>`;
        }
        container.appendChild(flexItem);
    }
    return container;
}
//NOTE - Funktion und erstellung des HideButt
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
//NOTE - Rechnungend er Sonderwerte
function updateCharakterCalculation() {
    let KO, KK, GE, KL, IN, FF, CH, GESCH, Tarnung, WIL, LP, AUSD, maxASP, MB, MR, level, xp, magicModifier, aspModifier, lpModifier, fernModifier, nahModifier, schuss, wurf, Attacke, Parade, Giftresistenz, giftModifier, Sin, Steigerungspunkte, Gesteigerte, Schnelligkeit;

    const magischeElementeInputs = document.querySelectorAll('.Magische_Elemente');
    let totalSum = 0;
    magischeElementeInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (!isNaN(value)) {
            totalSum += value;
        }
    });

    lpModifier = parseInt(document.getElementById("modifier_lp").value);
    aspModifier = parseInt(document.getElementById("modifier_asp").value);
    magicModifier = parseInt(document.getElementById("modifier_magie").value);
    fernModifier = parseInt(document.getElementById("modifier_fernkampf").value);
    nahModifier = parseInt(document.getElementById("modifier_nahkampf").value);
    giftModifier = parseInt(document.getElementById("modifier_gift").value);

    xp = parseInt(document.getElementById("erfahrung_xp").value);
    KK = parseInt(document.getElementById("attribute_Körperkraft").value);
    GE = parseInt(document.getElementById("attribute_Gewandheit").value);
    KL = parseInt(document.getElementById("attribute_Klugheit").value);
    IN = parseInt(document.getElementById("attribute_Intuition").value);
    FF = parseInt(document.getElementById("attribute_Fingerfertigkeit").value);
    CH = parseInt(document.getElementById("attribute_Charisma").value);
    GESCH = parseInt(document.getElementById("attribute_Geschicklichkeit").value);
    Tarnung = parseInt(document.getElementById("attribute_Tarnung").value);
    Sin = parseInt(document.getElementById("attribute_Sinnesschärfe").value);
    WIL = parseInt(document.getElementById("attribute_Willenskraft").value);
    KO = parseInt(document.getElementById("attribute_Konstitution").value);
    Gesteigerte = parseInt(document.getElementById("erfahrung_Gesteigerte").value);

    if (xp <= 900) { //level 0 bis 6
        level = Math.floor(xp / 150);
    } else if (xp <= 4200) { //level 7 bis 14
        level = Math.floor(xp / 600 + 7);
    } else { //level 15 bis ´´
        level = Math.floor(xp / 1200 + 10.5);
    }

    document.getElementById("erfahrung_level").value = level;

    LP = lpModifier + level * 6+20;
    document.getElementById("sonderwerte_Maximale LP").value = LP;

    AUSD = LP + KO;
    document.getElementById("sonderwerte_Maximale Ausdauer").value = AUSD;

    maxASP = level * 6 + aspModifier;
    document.getElementById("sonderwerte_Maximale Astralenergie").value = maxASP;

    MB = totalSum + magicModifier;
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

    Steigerungspunkte = level * 30 - Gesteigerte + 100;
    document.getElementById("erfahrung_Steigerungspunkte").value = Steigerungspunkte;

    Schnelligkeit = Math.round((KK + GE + Sin)/ 4)
    document.getElementById("sonderwerte_Schnelligkeit").value = Schnelligkeit;


}
//NOTE - Wallet Funktionen
let wallet = {
    dukaten: 0,
    silber: 0,
    heller: 0,
    kreuzer: 0,
    wInsg: 0
};
function initializeWallet(data) {
    if (data.charakter && data.charakter.geld && data.charakter.geld) {
        const geld = data.charakter.geld;
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
function TheChoosenOne() {
    let CurrencyField = document.getElementById("CurrencyField");
    let wCurrencyField = CurrencyField.options[CurrencyField.selectedIndex].value;
    let wNumberInput = parseFloat(document.getElementById("NumberInput").value);

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
function wConvert() {
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
//NOTE - Speicherung
function updateSectionValues(section, sectionId) {
    for (let key in section) {
        if (Array.isArray(section[key])) {
            section[key] = [];
            let index = 0;
            let input;
            while ((input = document.getElementById(`${sectionId}_${key}_${index}`)) !== null) {
                section[key].push(parseFloat(input.value));
                index++;
            }
        } else {
            const input = document.getElementById(`${sectionId}_${key}`);
            if (input) {
                section[key] = input.value;
            }
        }
    }
}
function saveChanges(data) {
    const charakter = data.charakter;
    console.log("ausgeführt")
    // Update values from the inputs
    if (charakter.fähigkeiten && charakter.fähigkeiten) {
        if (charakter.fähigkeiten.modifier && charakter.fähigkeiten.modifier) {
            updateSectionValues(charakter.fähigkeiten.modifier, 'modifier');
        }
        if (charakter.werte && charakter.werte) {
            updateSectionValues(charakter.werte, 'erfahrung');
        }
        if (charakter.fähigkeiten.sonderwerte && charakter.fähigkeiten.sonderwerte) {
            updateSectionValues(charakter.fähigkeiten.sonderwerte, 'sonderwerte');
        }
        if (charakter.fähigkeiten.attribute && charakter.fähigkeiten.attribute) {
            updateSectionValues(charakter.fähigkeiten.attribute, 'attribute');
        }
        if (charakter.fähigkeiten.Assassinen_Talente && charakter.fähigkeiten.Assassinen_Talente) {
            updateSectionValues(charakter.fähigkeiten.Assassinen_Talente, 'Assassinen_Talente');
        }
        if (charakter.fähigkeiten.Talente_1 && charakter.fähigkeiten.Talente_1) {
            updateSectionValues(charakter.fähigkeiten.Talente_1, 'Talente_1');
        }
        if (charakter.fähigkeiten.Talente_2 && charakter.fähigkeiten.Talente_2) {
            updateSectionValues(charakter.fähigkeiten.Talente_2, 'Talente_2');
        }
        if (charakter.fähigkeiten.KampfBasiswerte && charakter.fähigkeiten.KampfBasiswerte) {
            updateSectionValues(charakter.fähigkeiten.KampfBasiswerte, 'KampfBasiswerte');
        }
        if (charakter.fähigkeiten.Kampf_Talente && charakter.fähigkeiten.Kampf_Talente) {
            updateSectionValues(charakter.fähigkeiten.Kampf_Talente, 'Kampf_Talente');
        }
        if (charakter.fähigkeiten.Handwerkstalente && charakter.fähigkeiten.Handwerkstalente) {
            updateSectionValues(charakter.fähigkeiten.Handwerkstalente, 'Handwerkstalente');
        }
        if (charakter.fähigkeiten.Gespeicherte_Kampftalente && charakter.fähigkeiten.Gespeicherte_Kampftalente) {
            updateSectionValues(charakter.fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        }
    }

    // Update CharakterInfo values
    if (charakter.charakterInfo && charakter.charakterInfo) {
        updateCharakterInfo(charakter.charakterInfo);
    }

    // Update Wallet values
    if (charakter.geld && charakter.geld) {
        charakter.geld = { ...wallet };
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