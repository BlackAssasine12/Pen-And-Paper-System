export function evaluateArithmetic(expression: string): number {
  let offset = 0;

  function match(operator: string): boolean {
    if (expression[offset] !== operator) return false;
    offset += 1;
    return true;
  }

  function readTerm(): number {
    if (match("+")) return readTerm();
    if (match("-")) return -readTerm();
    if (match("(")) {
      const value = readSum();
      if (!match(")")) throw new Error("Schließende Klammer fehlt.");
      return value;
    }
    const number = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(expression.slice(offset));
    if (!number) throw new Error("Ungültiger Ausdruck.");
    offset += number[0].length;
    return Number(number[0]);
  }

  function readProduct(): number {
    let value = readTerm();
    while (expression[offset] === "*" || expression[offset] === "/") {
      const operator = expression[offset++];
      const next = readTerm();
      if (operator === "/" && next === 0) throw new Error("Division durch null ist nicht möglich.");
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  }

  function readSum(): number {
    let value = readProduct();
    while (expression[offset] === "+" || expression[offset] === "-") {
      const operator = expression[offset++];
      const next = readProduct();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }

  const value = readSum();
  if (offset !== expression.length || !Number.isFinite(value)) throw new Error("Ungültiger Ausdruck.");
  return value;
}
