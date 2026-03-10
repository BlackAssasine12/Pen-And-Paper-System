// inputListeners.ts
import { syncInputElement } from "./characterState";
import { adjustments } from "./adjustments";
import { updateCharakterCalculation } from "./calculations";

const toInputElement = (target: EventTarget | null) =>
    target instanceof HTMLInputElement ? target : null;

const setInputValueAndDispatch = (input: HTMLInputElement, nextValue: number) => {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (valueSetter) {
        valueSetter.call(input, String(nextValue));
    } else {
        input.value = String(nextValue);
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
};

export function addInputChangeListeners() {
    removeInputChangeListeners();
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach((input) => {
        input.addEventListener('change', (event: Event) => {
            const target = toInputElement(event.target);
            if (!target) {
                return;
            }
            syncInputElement(target);
            updateCharakterCalculation();
        });
    });

    Object.keys(adjustments).forEach(klass => {
        document.querySelectorAll(`.${klass}`).forEach(input => {
            if (!(input instanceof HTMLInputElement)) {
                return;
            }
            input.setAttribute('data-initial', String(parseFloat(input.value) || 0));

            input.addEventListener('input', handleInputChange);
        });
    });
}

function removeInputChangeListeners() {
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach(input => {
        input.removeEventListener('change', updateCharakterCalculation as EventListener);
    });

    Object.keys(adjustments).forEach(klass => {
        document.querySelectorAll(`.${klass}`).forEach(input => {
            input.removeEventListener('input', handleInputChange);
        });
    });
}

function handleInputChange(event: Event) {
    const input = toInputElement(event.target);
    const mainInput = document.getElementById('erfahrung_Steigerungspunkte');
    
    // Typprüfung für TypeScript
    if (!input || !(mainInput instanceof HTMLInputElement)) {
        return;
    }

    const initialValue = parseFloat(input.getAttribute('data-initial') ?? "0") || 0;
    const newValue = parseFloat(input.value) || 0;
    const diff = newValue - initialValue;

    if (!isNaN(diff)) {
        let adjustmentValue = 1; 
        
        const classes = Array.from(input.classList);
        for (const cls of classes) {
            if (adjustments[cls as keyof typeof adjustments] !== undefined) {
                adjustmentValue = adjustments[cls as keyof typeof adjustments]!;
                break; // Sobald eine spezifische Kosten-Klasse gefunden wurde, nutzen wir diese
            }
        }

        const currentPoints = parseFloat(mainInput.value) || 0;
        const updatedValue = currentPoints - (diff * adjustmentValue);

        setInputValueAndDispatch(mainInput, updatedValue);
        input.setAttribute('data-initial', String(newValue));
        syncInputElement(input);
        syncInputElement(mainInput);
    }
}

const listenersCheckbox = document.getElementById('toggleListenersCheckbox');
if (listenersCheckbox) {
    listenersCheckbox.addEventListener('change', function (event) {
        const target = event.target as HTMLInputElement | null;
        if (!target?.checked) {
            addInputChangeListeners();
        } else {
            removeInputChangeListeners();
        }
    });
}

const hiddenCheckbox = document.getElementById('toggleHiddenCheckbox');
if (hiddenCheckbox) {
    hiddenCheckbox.addEventListener('change', function (event) {
        const target = event.target as HTMLInputElement | null;
        let hiddenContainer = document.querySelector<HTMLElement>(".hidden-items");
        if (!hiddenContainer) {
            return;
        }
        if (!target?.checked) {
            hiddenContainer.style.display = 'none';
        } else {
            removeInputChangeListeners();
            hiddenContainer.style.display = 'flex';
        }
    });
}

function setInputsToMinOrMax(isMin: boolean) {
    // Alle Eingabefelder mit min und max finden
    const inputs = document.querySelectorAll('input[min][max]');
    const mainInput = document.getElementById('erfahrung_Steigerungspunkte');
    let totalAdjustment = 0; // Variable für die Gesamtsumme der Änderungen

    inputs.forEach((input) => {
        if (!(input instanceof HTMLInputElement)) {
            return;
        }
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const initialValue = parseFloat(input.value) || 0;

        // Setze den Wert je nach Auswahl
        const newValue = isMin ? min : max;
        input.value = String(newValue);
        syncInputElement(input);

        const diff = newValue - initialValue; // Differenz berechnen

        if (!isNaN(diff)) {
            // Berechne den Anpassungswert basierend auf Klassen
            let adjustmentValue = 1;
            const classList = input.classList;

            classList.forEach(cls => {
                if (adjustments[cls] !== undefined) {
                    adjustmentValue = adjustments[cls] ?? 1;
                }
            });

            // Gesamtsumme aktualisieren
            totalAdjustment += diff * adjustmentValue;
        }
    });

    // Hauptinput "erfahrung_Steigerungspunkte" aktualisieren
    if (mainInput instanceof HTMLInputElement) {
        setInputValueAndDispatch(mainInput, parseFloat(mainInput.value) - totalAdjustment);
        syncInputElement(mainInput);
    }
    updateCharakterCalculation()
    alert(`Alle Eingaben wurden auf ${isMin ? 'Min' : 'Max'} gesetzt. Steigerungspunkte wurden entsprechend angepasst.`);
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
