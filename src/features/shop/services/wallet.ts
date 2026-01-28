// wallet.js
import type { CharacterData, WalletState } from "../../../types/character";

export const wallet: WalletState = {
    dukaten: 0,
    silber: 0,
    heller: 0,
    kreuzer: 0,
    wInsg: 0
};

export function initializeWallet(data: CharacterData) {
    if (data.charakter && data.charakter.geld && data.charakter.geld) {
        const geld = data.charakter.geld;
        wallet.dukaten = geld.dukaten;
        wallet.silber = geld.silber;
        wallet.heller = geld.heller;
        wallet.kreuzer = geld.kreuzer;
        updateWalletDisplay();
    }
}

export function updateWalletDisplay() {
    const dukaten = document.getElementById('showDukaten');
    const silber = document.getElementById('showSilber');
    const heller = document.getElementById('showHeller');
    const kreuzer = document.getElementById('showKreuzer');
    if (dukaten) dukaten.innerText = String(wallet.dukaten);
    if (silber) silber.innerText = String(wallet.silber);
    if (heller) heller.innerText = String(wallet.heller);
    if (kreuzer) kreuzer.innerText = String(wallet.kreuzer);
}

function TheChoosenOne() {
    const CurrencyField = document.getElementById("CurrencyField");
    if (!(CurrencyField instanceof HTMLSelectElement)) {
        return;
    }
    const wCurrencyField = CurrencyField.options[CurrencyField.selectedIndex]?.value ?? "";
    const numberInput = document.getElementById("NumberInput");
    if (!(numberInput instanceof HTMLInputElement)) {
        return;
    }
    const wNumberInput = parseFloat(numberInput.value);

    if (wCurrencyField === "dukaten") {
        wallet.wInsg += wNumberInput * 1000;
        wallet.dukaten += wNumberInput;
    } else if (wCurrencyField === "silber") {
        wallet.wInsg += wNumberInput * 100;
        wallet.silber += wNumberInput;
    } else if (wCurrencyField === "heller") {
        wallet.wInsg += wNumberInput * 10;
        wallet.heller += wNumberInput;
    } else if (wCurrencyField === "kreuzer") {
        wallet.wInsg += wNumberInput;
        wallet.kreuzer += wNumberInput;
    } else {
        alert("Bitte eine gültige Währung auswählen");
    }
    updateWalletDisplay();
}

function wConvert() {
    wallet.wInsg = wallet.kreuzer + wallet.heller * 10 + wallet.silber * 100 + wallet.dukaten * 1000;

    wallet.dukaten = Math.floor(wallet.wInsg / 1000);
    wallet.wInsg %= 1000;

    wallet.silber = Math.floor(wallet.wInsg / 100);
    wallet.wInsg %= 100;

    wallet.heller = Math.floor(wallet.wInsg / 10);
    wallet.wInsg %= 10;

    wallet.kreuzer = Math.floor(wallet.wInsg);
    wallet.wInsg %= 1;

    updateWalletDisplay();
}

function wReset() {
    let wrReset = prompt("Bitte 'reset' eingeben, um dein Geld zurückzusetzen");
    if (wrReset === "reset") {
        wallet.wInsg = 0;
        wallet.dukaten = 0;
        wallet.silber = 0;
        wallet.heller = 0;
        wallet.kreuzer = 0;
        updateWalletDisplay();
    } else {
        alert("Falsche Eingabe");
    }
}
