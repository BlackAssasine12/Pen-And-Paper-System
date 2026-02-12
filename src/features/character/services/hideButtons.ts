// hideButtons.js

export function bindHideButtons() {
    const hideButtons = document.querySelectorAll('.hidebutton');
    const hiddenItemsContainer = document.getElementById('hiddenItemsContainer');
    if (!hiddenItemsContainer) {
        return;
    }

    hideButtons.forEach((button) => {
        if (!(button instanceof HTMLElement)) {
            return;
        }
        button.addEventListener('click', function () {
            const flexItem = button.closest('.FlexItem, .BigFlexItem');
            if (flexItem instanceof HTMLElement) {
                const inputs = flexItem.querySelectorAll<HTMLInputElement>('input');
                const inputValues = Array.from(inputs).map(input => input.value);

                flexItem.style.display = 'none';

                const hiddenItem = document.createElement('div');
                hiddenItem.classList.add('hidden-item');
                hiddenItem.classList.add(flexItem.classList.contains('BigFlexItem') ? 'BigFlexItem' : 'FlexItem');

                const flexItemContent = flexItem.cloneNode(true) as HTMLElement;
                const xButton = flexItemContent.querySelector('.hidebutton');
                if (xButton) {
                    xButton.remove();
                }

                hiddenItem.innerHTML = flexItemContent.innerHTML;

                const hiddenInputs = hiddenItem.querySelectorAll<HTMLInputElement>('input');
                hiddenInputs.forEach((input, index) => {
                    input.value = inputValues[index] ?? "";
                });

                const restoreButton = document.createElement('button');
                restoreButton.classList.add('hidebutton');
                restoreButton.textContent = '<';

                restoreButton.addEventListener('click', function () {
                    const originalInputs = flexItem.querySelectorAll<HTMLInputElement>('input');
                    hiddenInputs.forEach((input, index) => {
                        const originalInput = originalInputs[index];
                        if (originalInput) {
                            originalInput.value = input.value;
                        }
                    });

                    flexItem.style.display = 'flex';
                    hiddenItemsContainer.removeChild(hiddenItem);
                });

                hiddenItem.appendChild(restoreButton);
                hiddenItemsContainer.appendChild(hiddenItem);
                
                // Den automatischen Tab-Wechsel entfernen (folgende Zeilen auskommentieren oder löschen):
                // document.getElementById('toggleHiddenCheckbox').checked = true;
                // const tabItems = document.querySelectorAll('.tab-item');
                // tabItems.forEach(item => {
                //     if(item.getAttribute('data-tab') === 'ausgeblendete-tab') {
                //         item.click();
                //     }
                // });
            }
        });
    });
}
