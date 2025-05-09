"use strict";

function InToHTML(operation) {
    document.getElementById("eqField").innerHTML += operation;
    document.getElementById("evField").innerText = " ";
}

function clearEqField() {
    document.getElementById("eqField").innerText = " ";
    document.getElementById("evField").innerText = " ";
}

function calculate() {
    let calculate = (document.getElementById("eqField").innerText);
    let result = eval(calculate);

    document.getElementById("evField").innerText = result;
    console.log(calculate +"="+result);
}