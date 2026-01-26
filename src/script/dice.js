//dice.js
"use strict";

function toggleDiv() {
    let div = document.getElementById("divDice");
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}
function Roll() {
    let DiceCount = parseInt(document.getElementById("DiceCount").value);
    let DiceSide = parseInt(document.getElementById("DiceSides").value);
    let resultTotal = "";
    const showDice = document.getElementById("showDice");

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
    let DiceCount = parseInt(document.getElementById("DiceCount").value);
    let DiceSide = parseInt(document.getElementById("DiceSides").value);
    let resultTotal = "";

    const container = document.getElementById("container");
    const showDice = document.getElementById("showDice");

    if (DiceCount === 666) {
        if (container.style.display === "none") {
            container.style.display = "grid";
        } else {
            container.style.display = "none";
        }
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

function createOctagon(result, DiceSide) {
    const size = 40; // Size of the octagon
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
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
            text.textContent = result;
            break;
        case 1:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "#1b7d4f");
            text.textContent = result;
            break;
        default:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "white");
            text.textContent = result;
            break;
    }

    return svg;
}

function DiceChooser() {
    let Dicer = document.getElementById("Dicer");
    let cDicer = Dicer.options[Dicer.selectedIndex].value;
    let divDS = document.getElementById("DiceSides");
    let diceSidesInput = document.getElementById("DiceSides");

    switch (cDicer) {
        case "d100":
            diceSidesInput.value = 100;
            divDS.style.display = "none";
            break;
        case "d20":
            diceSidesInput.value = 20;
            divDS.style.display = "none";
            break;
        case "d10":
            diceSidesInput.value = 10;
            divDS.style.display = "none";
            break;
        case "d6":
            diceSidesInput.value = 6;
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
