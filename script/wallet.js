// wallet.js

let wallet = {
    dukaten: 0,
    silber: 0,
    heller: 0,
    kreuzer: 0,
    wInsg: 0
};

function initializeWallet(data) {
    if (data.charakter && data.charakter.geld && data.charakter.geld) {
        const geld = data.charakter.geld;
        wallet.dukaten = geld.dukaten;
        wallet.silber = geld.silber;
        wallet.heller = geld.heller;
        wallet.kreuzer = geld.kreuzer;
        updateWalletDisplay();
    }
}

function updateWalletDisplay() {
    document.getElementById('showDukaten').innerText = wallet.dukaten;
    document.getElementById('showSilber').innerText = wallet.silber;
    document.getElementById('showHeller').innerText = wallet.heller;
    document.getElementById('showKreuzer').innerText = wallet.kreuzer;
}

function TheChoosenOne() {
    let CurrencyField = document.getElementById("CurrencyField");
    let wCurrencyField = CurrencyField.options[CurrencyField.selectedIndex].value;
    let wNumberInput = parseFloat(document.getElementById("NumberInput").value);

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
