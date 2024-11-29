// fileReader.js

let myData;
let fileName;
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = JSON.parse(e.target.result);
            myData = data;
            fileName = file.name
            initializeWallet(data);
            generateCharakterAttributes(data);
            genCharInfo(data);
            bindHideButtons();
            updateCharakterCalculation();

            // Inventar laden
            if (data.inventory) {
                inventory = data.inventory; // Inventory-Objekt aktualisieren
                loadInventory(data.inventory);
            }
        };
        reader.readAsText(file);
    }
});

function loadInventory(inventory) {
    const ul = document.getElementById('inventory');
    // console.log(inventory)
    ul.innerHTML = ''; // Bestehende Inhalte entfernen
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.quantity}x`;
        // console.log(item.quantity)

        ul.appendChild(li);
    });
}