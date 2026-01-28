// Komplette shop.js Datei
import { updateWalletDisplay, wallet } from "./wallet";
import type { InventoryItem, ShopData } from "../../../types/character";

let inventory: InventoryItem[] = [];
let shopData: ShopData = {};

const syncInventoryToWindow = () => {
    window.inventory = inventory;
};

// Funktion, um Shop-Daten zu laden
async function loadShopData() {
    try {
        const baseUrl = import.meta.env.BASE_URL ?? "/";
        const response = await fetch(`${baseUrl}shopData.json`);
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
    if (!shopDiv) {
        return;
    }
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

function removeFromInventory(itemName: string, count = 1) {
    const existingItem = inventory.find(entry => entry.name === itemName);
    if (existingItem) {
        if ((existingItem.quantity ?? 0) > count) {
            existingItem.quantity = (existingItem.quantity ?? 0) - count;
        } else {
            inventory = inventory.filter(entry => entry.name !== itemName);
        }
        syncInventoryToWindow();
        renderInventory();
    } else {
        alert("Artikel nicht im Inventar gefunden.");
    }
}

// Funktionen für Benutzeraktionen im HTML
function addToInventoryFromInput() {
    const itemInput = document.getElementById("itemNameInput");
    if (!(itemInput instanceof HTMLInputElement)) {
        return;
    }
    const itemName = itemInput.value.trim();
    if (itemName) {
        addToInventory(itemName, 0, ""); // Preis und Währung hier nicht relevant
    } else {
        alert("Bitte einen gültigen Artikelnamen eingeben.");
    }
}

function removeFromInventoryFromInput() {
    const itemInput = document.getElementById("itemNameInput");
    if (!(itemInput instanceof HTMLInputElement)) {
        return;
    }
    const itemName = itemInput.value.trim();
    if (itemName) {
        removeFromInventory(itemName);
    } else {
        alert("Bitte einen gültigen Artikelnamen eingeben.");
    }
}

// Währungswerte in Kreuzer
const currencyValues: Record<string, number> = {
    "Dukaten": 1000,
    "Silber": 100,
    "Heller": 10,
    "Kreuzer": 1
};

// Neue Funktion für den Kauf mit automatischer Umrechnung
function addToInventory(itemName: string, itemPreis: number | string, itemWährung: string) {
    // Preis in Kreuzer umrechnen (kleinste Einheit)
    let preisInKreuzer = 0;
    if (itemWährung && itemPreis) {
        const parsedPreis = typeof itemPreis === "string" ? parseFloat(itemPreis) : itemPreis;
        preisInKreuzer = Math.round(parsedPreis * currencyValues[itemWährung]);
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

    syncInventoryToWindow();
    renderInventory();
    // alert(`${itemName} wurde gekauft!`);
}

// Funktion zum Anzeigen des Inventars
export function renderInventory() {
    if (window.inventory) {
        inventory = window.inventory;
    }
    const inventoryList = document.getElementById("inventory");
    if (!inventoryList) {
        return;
    }
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

const shopButton = document.getElementById("ShopButton");
const shopContainer = document.getElementById("shop");

if (shopButton && shopContainer) {
    shopButton.addEventListener('click', () => {
        shopContainer.classList.toggle("disNone");
        shopButton.textContent = shopButton.innerHTML === '-' ? '+' : '-';
    });
}
