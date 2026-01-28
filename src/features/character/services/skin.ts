function changeFont() {
    const fontInput = document.getElementById("fontInput");
    if (!(fontInput instanceof HTMLInputElement)) {
        return;
    }
    const font = fontInput.value;
    if (font) {
        document.body.style.fontFamily = font;
    } else {
        alert("Bitte eine gültige Schriftart eingeben.");
    }
}

function changeColor() {
    const colorInputElement = document.getElementById("colorInput");
    if (!(colorInputElement instanceof HTMLInputElement)) {
        return;
    }
    const colorInput = colorInputElement.value;

    if (colorInput) {
        document.body.style.color = colorInput;

        // Labels ändern
        const labels = document.querySelectorAll<HTMLLabelElement>("label");
        labels.forEach(label => {
            label.style.color = colorInput;
        });

        // Select-Elemente ändern
        const selects = document.querySelectorAll<HTMLSelectElement>("select");
        selects.forEach(select => {
            select.style.color = colorInput;
        });

        // Input-Felder ändern
        const inputs = document.querySelectorAll<HTMLInputElement>("input");
        inputs.forEach(input => {
            input.style.color = colorInput;
        });
    } else {
        alert("Bitte eine gültige Farbe eingeben.");
    }
}

export {};
