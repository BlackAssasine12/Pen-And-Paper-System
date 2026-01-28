//dice.js
"use strict";

const getInputElement = (id: string) => {
    const element = document.getElementById(id);
    return element instanceof HTMLInputElement ? element : null;
};

const getElement = (id: string) => document.getElementById(id);

function toggleDiv() {
    const div = getElement("divDice");
    if (!div) {
        return;
    }
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}
function Roll() {
    const diceCountInput = getInputElement("DiceCount");
    const diceSidesInput = getInputElement("DiceSides");
    const showDice = getElement("showDice");
    if (!diceCountInput || !diceSidesInput || !showDice) {
        return;
    }
    const DiceCount = parseInt(diceCountInput.value, 10);
    const DiceSide = parseInt(diceSidesInput.value, 10);
    let resultTotal = "";

    showDice.innerHTML = "";
    for (let i = 0; i < DiceCount; i++) {
        let result = Math.floor(Math.random() * DiceSide) + 1;
        const resultContainer = createOctagon(result, DiceSide);

        resultTotal += `[${result}]` + ", ";
        showDice.appendChild(resultContainer);
    }
    zuTaschenrechner();
}

function zuTaschenrechner() {
    const diceCountInput = getInputElement("DiceCount");
    const diceSidesInput = getInputElement("DiceSides");
    if (!diceCountInput || !diceSidesInput) {
        return;
    }
    const DiceCount = parseInt(diceCountInput.value, 10);
    const DiceSide = parseInt(diceSidesInput.value, 10);
    let resultTotal = "";

    const container = getElement("container");
    const showDice = getElement("showDice");

    if (DiceCount === 666 && container) {
        if (container.style.display === "none") {
            container.style.display = "grid";
        } else {
            container.style.display = "none";
        }
        return;
    }

    if (!showDice) {
        return;
    }
    showDice.innerHTML = "";

    for (let i = 0; i < DiceCount; i++) {
        let result = Math.floor(Math.random() * DiceSide) + 1;
        const resultContainer = createOctagon(result, DiceSide);

        switch (result) {
            case DiceSide:
                resultContainer.classList.add('diceOutputMax');
                break;
            case 1:
                resultContainer.classList.add('diceOutputMin');
                break;
            default:
                resultContainer.classList.add('diceOutput');
                break;
        }

        resultTotal += `[${result}]` + ", ";
        showDice.appendChild(resultContainer);
    }
}

function createOctagon(result: number, DiceSide: number) {
    const size = 40; // Size of the octagon
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", `0 0 100 100`);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "50");
    text.setAttribute("y", "50");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "40");
    text.setAttribute("font-weight", "bold");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("points", "30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30");
    polygon.setAttribute("stroke", "black");
    polygon.setAttribute("stroke-width", "5");
    polygon.setAttribute("fill", "white");

    svg.appendChild(polygon);
    svg.appendChild(text);

    switch (result) {
        case DiceSide:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "#ff4122");
            text.textContent = String(result);
            break;
        case 1:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "#1b7d4f");
            text.textContent = String(result);
            break;
        default:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "white");
            text.textContent = String(result);
            break;
    }

    return svg;
}

function DiceChooser() {
    const Dicer = document.getElementById("Dicer");
    if (!(Dicer instanceof HTMLSelectElement)) {
        return;
    }
    const cDicer = Dicer.options[Dicer.selectedIndex]?.value ?? "";
    const divDS = getElement("DiceSides");
    const diceSidesInput = getInputElement("DiceSides");
    if (!divDS || !diceSidesInput) {
        return;
    }

    switch (cDicer) {
        case "d100":
            diceSidesInput.value = "100";
            divDS.style.display = "none";
            break;
        case "d20":
            diceSidesInput.value = "20";
            divDS.style.display = "none";
            break;
        case "d10":
            diceSidesInput.value = "10";
            divDS.style.display = "none";
            break;
        case "d6":
            diceSidesInput.value = "6";
            divDS.style.display = "none";
            break;
        case "custom":
            divDS.style.display = "block";
            break;
        default:
            console.error("Unbekannte Auswahl: " + cDicer);
    }
}
DiceChooser()

export {};
