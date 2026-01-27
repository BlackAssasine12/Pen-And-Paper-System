// @ts-nocheck
// inputListeners.js
import { syncInputElement } from "./characterState";

function addInputChangeListeners() {
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach(input => {
        input.addEventListener('change', (event) => {
            syncInputElement(event.target);
            updateCharakterCalculation();
        });
    });

    const mainInput = document.getElementById('erfahrung_Gesteigerte');

    Object.keys(adjustments).forEach(klass => {
        document.querySelectorAll(`.${klass}`).forEach(input => {
            input.setAttribute('data-initial', parseFloat(input.value) || 0);

            input.addEventListener('input', handleInputChange);
        });
    });
}

function removeInputChangeListeners() {
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach(input => {
        input.removeEventListener('change', updateCharakterCalculation);
    });

    Object.keys(adjustments).forEach(klass => {
        document.querySelectorAll(`.${klass}`).forEach(input => {
            input.removeEventListener('input', handleInputChange);
        });
    });
}

function handleInputChange(event) {
    const input = event.target;
    const mainInput = document.getElementById('erfahrung_Gesteigerte');

    const initialValue = parseFloat(input.getAttribute('data-initial')) || 0;
    const newValue = parseFloat(input.value) || 0;
    const diff = newValue - initialValue;

    if (!isNaN(diff)) {
        const classList = input.classList;
        let adjustmentValue = 1;

        classList.forEach(cls => {
            if (adjustments[cls] !== undefined) {
                adjustmentValue = parseFloat(adjustments[cls]) || 1;
            }
        });

        const updatedValue = parseFloat(mainInput.value) + (diff * adjustmentValue);
        mainInput.value = updatedValue;
        input.setAttribute('data-initial', newValue);
        syncInputElement(input);
        syncInputElement(mainInput);
    }
}

const listenersCheckbox = document.getElementById('toggleListenersCheckbox');
if (listenersCheckbox) {
    listenersCheckbox.addEventListener('change', function () {
        if (!this.checked) {
            addInputChangeListeners();
        } else {
            removeInputChangeListeners();
        }
    });
}

const hiddenCheckbox = document.getElementById('toggleHiddenCheckbox');
if (hiddenCheckbox) {
    hiddenCheckbox.addEventListener('change', function () {
        let hiddenContainer = document.querySelector(".hidden-items")
        if (!hiddenContainer) {
            return;
        }
        if (!this.checked) {
            hiddenContainer.style.display = 'none';
        } else {
            removeInputChangeListeners();
            hiddenContainer.style.display = 'flex';
        }
    });
}

function setInputsToMinOrMax(isMin) {
    // Alle Eingabefelder mit min und max finden
    const inputs = document.querySelectorAll('input[min][max]');
    const mainInput = document.getElementById('erfahrung_Gesteigerte');
    let totalAdjustment = 0; // Variable für die Gesamtsumme der Änderungen

    inputs.forEach(input => {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const initialValue = parseFloat(input.value) || 0;

        // Setze den Wert je nach Auswahl
        const newValue = isMin ? min : max;
        input.value = newValue;
        syncInputElement(input);

        const diff = newValue - initialValue; // Differenz berechnen

        if (!isNaN(diff)) {
            // Berechne den Anpassungswert basierend auf Klassen
            let adjustmentValue = 1;
            const classList = input.classList;

            classList.forEach(cls => {
                if (adjustments[cls] !== undefined) {
                    adjustmentValue = parseFloat(adjustments[cls]) || 1;
                }
            });

            // Gesamtsumme aktualisieren
            totalAdjustment += diff * adjustmentValue;
        }
    });

    // Hauptinput "erfahrung_Gesteigerte" aktualisieren
    if (mainInput) {
        mainInput.value = parseFloat(mainInput.value) + totalAdjustment;
        syncInputElement(mainInput);
    }
    updateCharakterCalculation()
    alert(`Alle Eingaben wurden auf ${isMin ? 'Min' : 'Max'} gesetzt. Erfahrung gesteigerte wurde entsprechend angepasst.`);
}

// Event-Listener für Buttons
const setMinButton = document.getElementById('setMin');
if (setMinButton) {
    setMinButton.addEventListener('click', () => setInputsToMinOrMax(true));
}
const setMaxButton = document.getElementById('setMax');
if (setMaxButton) {
    setMaxButton.addEventListener('click', () => setInputsToMinOrMax(false));
}
