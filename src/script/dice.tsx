const getElement = <T extends HTMLElement>(id: string): T | null =>
    document.getElementById(id) as T | null;

const getNumberInputValue = (id: string): number => {
    const input = getElement<HTMLInputElement>(id);
    if (!input) {
        return 0;
    }
    const parsed = Number.parseInt(input.value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const rollOnce = (diceSide: number): number =>
    Math.floor(Math.random() * diceSide) + 1;

function toggleDiv(): void {
    const div = getElement<HTMLDivElement>("divDice");
    if (!div) {
        return;
    }
    div.style.display = div.style.display === "none" ? "block" : "none";
}

function renderDice(
    diceCount: number,
    diceSide: number,
    showDice: HTMLElement,
    withClassNames: boolean,
): void {
    showDice.innerHTML = "";
    if (diceCount <= 0 || diceSide <= 0) {
        return;
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < diceCount; i += 1) {
        const result = rollOnce(diceSide);
        const resultContainer = createOctagon(result, diceSide);

        if (withClassNames) {
            switch (result) {
                case diceSide:
                    resultContainer.classList.add("diceOutputMax");
                    break;
                case 1:
                    resultContainer.classList.add("diceOutputMin");
                    break;
                default:
                    resultContainer.classList.add("diceOutput");
                    break;
            }
        }

        fragment.appendChild(resultContainer);
    }

    showDice.appendChild(fragment);
}

function Roll(): void {
    const diceCount = getNumberInputValue("DiceCount");
    const diceSide = getNumberInputValue("DiceSides");
    const showDice = getElement<HTMLDivElement>("showDice");

    if (!showDice) {
        return;
    }

    renderDice(diceCount, diceSide, showDice, false);
    zuTaschenrechner();
}

function zuTaschenrechner(): void {
    const diceCount = getNumberInputValue("DiceCount");
    const diceSide = getNumberInputValue("DiceSides");

    const container = getElement<HTMLDivElement>("container");
    const showDice = getElement<HTMLDivElement>("showDice");

    if (!showDice) {
        return;
    }

    if (diceCount === 666 && container) {
        container.style.display =
            container.style.display === "none" ? "grid" : "none";
        return;
    }

    renderDice(diceCount, diceSide, showDice, true);
}

function createOctagon(result: number, diceSide: number): SVGSVGElement {
    const size = 40; // Size of the octagon
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size.toString());
    svg.setAttribute("height", size.toString());
    svg.setAttribute("viewBox", "0 0 100 100");

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "50");
    text.setAttribute("y", "50");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "40");
    text.setAttribute("font-weight", "bold");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute(
        "points",
        "30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30",
    );
    polygon.setAttribute("stroke", "black");
    polygon.setAttribute("stroke-width", "5");
    polygon.setAttribute("fill", "white");

    svg.appendChild(polygon);
    svg.appendChild(text);

    switch (result) {
        case diceSide:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "#ff4122");
            text.textContent = result.toString();
            break;
        case 1:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "#1b7d4f");
            text.textContent = result.toString();
            break;
        default:
            text.setAttribute("fill", "black");
            polygon.setAttribute("fill", "white");
            text.textContent = result.toString();
            break;
    }

    return svg;
}

function DiceChooser(): void {
    const diceSelect = getElement<HTMLSelectElement>("Dicer");
    const diceSidesInput = getElement<HTMLInputElement>("DiceSides");

    if (!diceSelect || !diceSidesInput) {
        return;
    }

    const selection = diceSelect.options[diceSelect.selectedIndex]?.value;
    switch (selection) {
        case "d100":
            diceSidesInput.value = "100";
            diceSidesInput.style.display = "none";
            break;
        case "d20":
            diceSidesInput.value = "20";
            diceSidesInput.style.display = "none";
            break;
        case "d10":
            diceSidesInput.value = "10";
            diceSidesInput.style.display = "none";
            break;
        case "d6":
            diceSidesInput.value = "6";
            diceSidesInput.style.display = "none";
            break;
        case "custom":
            diceSidesInput.style.display = "block";
            break;
        default:
            console.error(`Unbekannte Auswahl: ${selection}`);
    }
}

DiceChooser();
