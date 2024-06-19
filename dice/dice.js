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

    const container = document.getElementById("container");
    const showDice = document.getElementById("showDice");

    // Toggle the container visibility if DiceCount is 666
    if (DiceCount === 666) {
        if (container.style.display === "none") {
            container.style.display = "grid";
        } else {
            container.style.display = "none";
        }
        return;  // Exit the function early since we only want to toggle visibility in this case
    }

    // Clear the showDice container before adding new results
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

    // Optionally, display the total results somewhere
    // console.log("Total Results:", resultTotal);
}

function Roll() {
    let DiceCount = parseInt(document.getElementById("DiceCount").value);
    let DiceSide = parseInt(document.getElementById("DiceSides").value);
    let resultTotal = "";

    const container = document.getElementById("container");
    const showDice = document.getElementById("showDice");

    // Toggle the container visibility if DiceCount is 666
    if (DiceCount === 666) {
        if (container.style.display === "none") {
            container.style.display = "grid";
        } else {
            container.style.display = "none";
        }
        return;  // Exit the function early since we only want to toggle visibility in this case
    }

    // Clear the showDice container before adding new results
    showDice.innerHTML = "";

    for (let i = 0; i < DiceCount; i++) {
        let result = Math.floor(Math.random() * DiceSide) + 1;
        const resultContainer = createOctagon(result, DiceSide);

        resultTotal += `[${result}]` + ", ";
        showDice.appendChild(resultContainer);
    }
    
    // Optionally, display the total results somewhere
    // console.log("Total Results:", resultTotal);
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

    if (cDicer === "d100") {
        parseInt(document.getElementById("DiceSides").value = 100);
        divDS.style.display = "none"
    } else {
        if (cDicer === "d20") {
            parseInt(document.getElementById("DiceSides").value = 20);
            divDS.style.display = "none"
        } else {
            if (cDicer === "d10") {
                parseInt(document.getElementById("DiceSides").value = 10);
                divDS.style.display = "none"
            } else {
                if (cDicer === "d6") {
                    parseInt(document.getElementById("DiceSides").value = 6);
                    divDS.style.display = "none"
                } else {
                    if (cDicer === "custom") {
                        divDS.style.display = "block"
                    }
                }
            }
        }
    }
}
