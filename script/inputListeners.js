// inputListeners.js

function addInputChangeListeners() {
    const inputElements = document.querySelectorAll('.stg');
    inputElements.forEach(input => {
        input.addEventListener('change', updateCharakterCalculation);
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

        mainInput.value = parseFloat(mainInput.value) + (diff * adjustmentValue);
        input.setAttribute('data-initial', newValue);
    }
}

document.getElementById('toggleListenersCheckbox').addEventListener('change', function () {
    if (!this.checked) {
        addInputChangeListeners();
    } else {
        removeInputChangeListeners();
    }
});

document.getElementById('toggleHiddenCheckbox').addEventListener('change', function () {
    let hiddenContainer = document.querySelector(".hidden-items")
    if (!this.checked) {
        hiddenContainer.style.display = 'none';
    } else {
        removeInputChangeListeners();
        hiddenContainer.style.display = 'flex';
    }
});

function setInputsToMinOrMax(isMin) {
    // Alle Eingabefelder mit min und max finden
    const inputs = document.querySelectorAll('input[min][max]');
    
    inputs.forEach(input => {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      // Setze den Wert je nach Auswahl
      input.value = isMin ? min : max;
    });

    alert(`Alle Eingaben wurden auf ${isMin ? 'Min' : 'Max'} gesetzt.`);
  }

  // Event-Listener für Buttons
  document.getElementById('setMin').addEventListener('click', () => setInputsToMinOrMax(true));
  document.getElementById('setMax').addEventListener('click', () => setInputsToMinOrMax(false));