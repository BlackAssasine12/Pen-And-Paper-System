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

// Artikel zum Inventar hinzufügen
function addToInventory(itemName, itemPreis, itemWärung) {
    let preis = Math.round(itemPreis * 100) / 100;
    console.log(itemName, itemPreis, itemWärung)
    console.log(itemPreis)
    switch (itemWärung) {
        case "Dukaten":
            wallet.dukaten -= preis
            console.log(itemWärung, wallet)
            break;
        case "Silberlinge":
            wallet.silber -= preis
            console.log(itemWärung, wallet)
            break;
        case "Heller":
            wallet.heller -= preis
            console.log(itemWärung, wallet)
            break;
        case "Kreuzer":
            wallet.kreuzer -= preis
            console.log(itemWärung, wallet)
            break;
        default:
            console.log("falsche wärung")
            break;
    }
    // Prüfen, ob der Artikel schon existiert
    const existingItem = inventory.find(entry => entry.name === itemName);
    if (existingItem) {
        existingItem.count++;
    } else {
        inventory.push({ name: itemName, count: 1 });
    }
    renderInventory();
}

// Inventar anzeigen
function renderInventory() {
    const inventoryList = document.getElementById("inventory");
    inventoryList.innerHTML = "";
    inventory.forEach(entry => {
        const listItem = document.createElement("li");
        listItem.textContent = `${entry.name} - ${entry.count}x`;
        inventoryList.appendChild(listItem);
        updateWalletDisplay()
    });
}

loadShopData();