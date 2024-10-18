// saveChanges.js

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
}

function updateSpecialSection(section, sectionId) {
    section.forEach((item, index) => {
        const key = item.Name;
        const input = document.getElementById(`${sectionId}_${key}`);
        if (input) {
            item.Wert = parseFloat(input.value);
        }
    });
}

function saveChanges(data) {
    const charakter = data.charakter;

    if (!charakter.charakterInfo) {
        console.error('charakterInfo-Objekt nicht gefunden.');
        return;
    }

    updateCharakterInfo(charakter.charakterInfo);

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
        if (charakter.Magische_Elemente && charakter.Magische_Elemente) {
            updateSectionValues(charakter.Magische_Elemente, 'Magische_Elemente');
        }
        if (charakter.fähigkeiten.Gespeicherte_Kampftalente && charakter.fähigkeiten.Gespeicherte_Kampftalente) {
            updateSectionValues(charakter.fähigkeiten.Gespeicherte_Kampftalente, 'Gespeicherte_Kampftalente');
        }
    }

    if (charakter.charakterInfo && charakter.charakterInfo) {
        updateCharakterInfo(charakter.charakterInfo);
    }

    if (charakter.geld && charakter.geld) {
        charakter.geld = { ...wallet };
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'charakter.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
