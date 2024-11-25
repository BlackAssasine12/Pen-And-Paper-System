// saveChanges.js

// Hilfsfunktion zur Ersetzung von Leerzeichen durch Unterstriche
function sanitizeKey(key) {
    return key.replace(/\s+/g, '_');
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
        if (charakter.Magische_Elemente) {
            updateSectionValues(charakter.Magische_Elemente, 'Magische_Elemente');
        }
        if (fähigkeiten.Gespeicherte_Kampftalente) {
            updateSectionValues(fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        }
    }

    if (charakter.geld) {
        charakter.geld = { ...wallet }; // Beispiel: Aktualisierung des Geld-Objekts
    }

    data.inventory = saveInventory(); // Inventar speichern

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}`;
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
        inventory.push({ name, quantity: parseInt(quantity.replace('x', '')) });
    });
    return inventory;
}