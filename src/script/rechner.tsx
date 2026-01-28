"use strict";

function InToHTML(operation: string) {
    const eqField = document.getElementById("eqField");
    const evField = document.getElementById("evField");
    if (!eqField || !evField) {
        return;
    }
    eqField.innerHTML += operation;
    evField.innerText = " ";
}

function clearEqField() {
    const eqField = document.getElementById("eqField");
    const evField = document.getElementById("evField");
    if (!eqField || !evField) {
        return;
    }
    eqField.innerText = " ";
    evField.innerText = " ";
}

function calculate() {
    const eqField = document.getElementById("eqField");
    const evField = document.getElementById("evField");
    if (!eqField || !evField) {
        return;
    }
    const calculation = eqField.innerText;
    const result = eval(calculation) as unknown;

    evField.innerText = String(result);
    console.log(calculation + "=" + result);
}

export {};
