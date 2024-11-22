let inventory = [];
let shopData = {};

// Funktion, um Shop-Daten zu laden
async function loadShopData() {
    try {
        const response = await fetch("shopData.json");
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Shop-Daten: ${response.statusText}`);
        }
        shopData = await response.json();
        console.log(shopData)
        renderShop();
    } catch (error) {
        console.error("Fehler beim Laden der Shop-Daten:", error);
    }
}

// Shop anzeigen
function renderShop() {
    const shopDiv = document.getElementById("shop");
    shopDiv.innerHTML = "";

    for (const category in shopData) {
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<h2 class="ShopHeader">${category}</h2>`;
        shopData[category].forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.innerHTML = `
                <p>${item.Item} - ${item.Preis} ${item.Währung}</p>
                <button onclick="addToInventory('${item.Item}','${item.Preis}','${item.Währung}')">Kaufen</button>
            `;
            categoryDiv.appendChild(itemDiv);
        });
        shopDiv.appendChild(categoryDiv);
    }
}

function removeFromInventory(itemName, count = 1) {
    const existingItem = inventory.find(entry => entry.name === itemName);
    if (existingItem) {
        if (existingItem.count > count) {
            existingItem.count -= count;
        } else {
            inventory = inventory.filter(entry => entry.name !== itemName);
        }
        renderInventory();
    } else {
        alert("Artikel nicht im Inventar gefunden.");
    }
}

// Funktionen für Benutzeraktionen im HTML
function addToInventoryFromInput() {
    const itemName = document.getElementById("itemNameInput").value.trim();
    if (itemName) {
        addToInventory(itemName, 0, ""); // Preis und Währung hier nicht relevant
    } else {
        alert("Bitte einen gültigen Artikelnamen eingeben.");
    }
}

function removeFromInventoryFromInput() {
    const itemName = document.getElementById("itemNameInput").value.trim();
    if (itemName) {
        removeFromInventory(itemName);
    } else {
        alert("Bitte einen gültigen Artikelnamen eingeben.");
    }
}

// Bestehende Funktion für das Hinzufügen angepasst
function addToInventory(itemName, itemPreis, itemWärung) {
    let preis = Math.round(itemPreis * 100) / 100;
    switch (itemWärung) {
        case "Dukaten":
            wallet.dukaten -= preis;
            break;
        case "Silberlinge":
            wallet.silber -= preis;
            break;
        case "Heller":
            wallet.heller -= preis;
            break;
        case "Kreuzer":
            wallet.kreuzer -= preis;
            break;
    }
    const existingItem = inventory.find(entry => entry.name === itemName);
    if (existingItem) {
        existingItem.count++;
    } else {
        inventory.push({ name: itemName, count: 1 });
    }
    renderInventory();
}

// Funktion zum Anzeigen des Inventars
function renderInventory() {
    const inventoryList = document.getElementById("inventory");
    inventoryList.innerHTML = "";
    inventory.forEach(entry => {
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name} - ${entry.count}x`;
        inventoryList.appendChild(listItem);
    });
    updateWalletDisplay();
}

loadShopData();

let shopButton = document.getElementById("ShopButton")
let shopContainer = document.getElementById("shop")

shopButton.addEventListener('click', () => {
    shopContainer.classList.toggle("disNone");
    shopButton.textContent = shopButton.innerHTML === '-' ? '+' : '-';
});