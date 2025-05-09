// hideButtons.js

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

                const flexItemContent = flexItem.cloneNode(true);
                const xButton = flexItemContent.querySelector('.hidebutton');
                if (xButton) {
                    xButton.remove();
                }

                hiddenItem.innerHTML = flexItemContent.innerHTML;

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