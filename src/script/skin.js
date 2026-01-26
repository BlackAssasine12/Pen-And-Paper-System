function changeFont() {
    const font = document.getElementById("fontInput").value;
    if (font) {
        document.body.style.fontFamily = font;
    } else {
        alert("Bitte eine gültige Schriftart eingeben.");
    }
}

function changeColor() {
    const colorInput = document.getElementById("colorInput").value;

    if (colorInput) {
        document.body.style.color = colorInput;

        // Labels ändern
        const labels = document.querySelectorAll("label");
        labels.forEach(label => {
            label.style.color = colorInput;
        });

        // Select-Elemente ändern
        const selects = document.querySelectorAll("select");
        selects.forEach(select => {
            select.style.color = colorInput;
        });

        // Input-Felder ändern
        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => {
            input.style.color = colorInput;
        });
    } else {
        alert("Bitte eine gültige Farbe eingeben.");
    }
}

