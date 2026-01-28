const getElement = <T extends HTMLElement>(id: string): T | null =>
    document.getElementById(id) as T | null;

function InToHTML(operation: string): void {
    const eqField = getElement<HTMLDivElement>("eqField");
    const evField = getElement<HTMLDivElement>("evField");

    if (!eqField || !evField) {
        return;
    }

    eqField.textContent = `${eqField.textContent ?? ""}${operation}`;
    evField.textContent = " ";
}

function clearEqField(): void {
    const eqField = getElement<HTMLDivElement>("eqField");
    const evField = getElement<HTMLDivElement>("evField");

    if (!eqField || !evField) {
        return;
    }

    eqField.textContent = " ";
    evField.textContent = " ";
}

function calculate(): void {
    const eqField = getElement<HTMLDivElement>("eqField");
    const evField = getElement<HTMLDivElement>("evField");

    if (!eqField || !evField) {
        return;
    }

    const expression = eqField.textContent ?? "";
    if (!expression.trim()) {
        evField.textContent = " ";
        return;
    }

    try {
        const result = eval(expression);
        evField.textContent = String(result);
        console.log(`${expression}=${result}`);
    } catch (error) {
        console.warn("Ungültiger Ausdruck im Taschenrechner", error);
        evField.textContent = "Fehler";
    }
}
