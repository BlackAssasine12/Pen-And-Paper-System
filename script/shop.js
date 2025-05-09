// Komplette shop.js Datei
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
        if (existingItem.quantity > count) {
            existingItem.quantity -= count;
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

// Währungswerte in Kreuzer
const currencyValues = {
    "Dukaten": 1000,
    "Silber": 100,
    "Heller": 10,
    "Kreuzer": 1
};

// Neue Funktion für den Kauf mit automatischer Umrechnung
function addToInventory(itemName, itemPreis, itemWährung) {
    // Preis in Kreuzer umrechnen (kleinste Einheit)
    let preisInKreuzer = 0;
    if (itemWährung && itemPreis) {
        preisInKreuzer = Math.round(itemPreis * currencyValues[itemWährung]);
    }
    
    // Gesamtes Geld im Wallet in Kreuzer berechnen
    let totalKreuzer = wallet.dukaten * 1000 + wallet.silber * 100 + wallet.heller * 10 + wallet.kreuzer;
    
    // Prüfen, ob genug Geld vorhanden ist
    if (totalKreuzer < preisInKreuzer) {
        alert("Nicht genug Geld! Der Kauf wurde abgebrochen.");
        return;
    }
    
    // Geld abziehen
    totalKreuzer -= preisInKreuzer;
    
    // Neues Geld zurück in die Währungen umrechnen
    wallet.dukaten = Math.floor(totalKreuzer / 1000);
    totalKreuzer %= 1000;
    
    wallet.silber = Math.floor(totalKreuzer / 100);
    totalKreuzer %= 100;
    
    wallet.heller = Math.floor(totalKreuzer / 10);
    totalKreuzer %= 10;
    
    wallet.kreuzer = Math.floor(totalKreuzer);
    
    // Wallet-Gesamtwert aktualisieren
    wallet.wInsg = wallet.dukaten * 1000 + wallet.silber * 100 + wallet.heller * 10 + wallet.kreuzer;
    
    // Artikel ins Inventar hinzufügen
    const existingItem = inventory.find(entry => entry.name === itemName);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
        inventory.push({ name: itemName, quantity: 1 });
    }
    
    renderInventory();
    // alert(`${itemName} wurde gekauft!`);
}

// Funktion zum Anzeigen des Inventars
function renderInventory() {
    const inventoryList = document.getElementById("inventory");
    inventoryList.innerHTML = "";
    inventory.forEach(entry => {
        const quantity = entry.quantity || entry.count || 0;
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name} - ${quantity}x`;
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