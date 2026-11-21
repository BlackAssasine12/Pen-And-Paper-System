import { useState } from "react";
import type { FormEvent } from "react";
import { rollDie } from "../domain/talentProbe";
import { evaluateArithmetic } from "./arithmetic";
import { formatNumber, parseWholeNumber } from "./fields";

const diceSizes = [6, 10, 20, 100] as const;
type DiceSelection = `${(typeof diceSizes)[number]}` | "custom";

type Roll = { sides: number; values: number[] };

function DiceRoller() {
  const [selection, setSelection] = useState<DiceSelection>("20");
  const [count, setCount] = useState("1");
  const [custom, setCustom] = useState("20");
  const [roll, setRoll] = useState<Roll>();
  const [error, setError] = useState("");

  function rollDice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedCount = parseWholeNumber(count);
    const sides = parseWholeNumber(selection === "custom" ? custom : selection);
    if (parsedCount === undefined || parsedCount < 1 || parsedCount > 20) {
      setError("Bitte 1 bis 20 Würfel eingeben.");
      return;
    }
    if (sides === undefined || sides < 2 || sides > 1000) {
      setError("Bitte 2 bis 1.000 Seiten eingeben.");
      return;
    }
    setError("");
    setRoll({ sides, values: Array.from({ length: parsedCount }, () => rollDie(sides)) });
  }

  return (
    <section className="panel" aria-labelledby="dice-heading">
      <h3 id="dice-heading">Würfel</h3>
      <form className="form-stack" onSubmit={rollDice}>
        <div className="form-grid">
          <label className="field">
            <span>Würfelart</span>
            <select value={selection} onChange={(event) => setSelection(event.target.value as DiceSelection)}>
              {diceSizes.map((sides) => <option key={sides} value={sides}>W{sides}</option>)}
              <option value="custom">Eigener Würfel</option>
            </select>
          </label>
          <label className="field">
            <span>Anzahl der Würfel</span>
            <input inputMode="numeric" value={count} onChange={(event) => setCount(event.target.value)} />
          </label>
          {selection === "custom" && (
            <label className="field">
              <span>Seiten pro Würfel</span>
              <input inputMode="numeric" value={custom} onChange={(event) => setCustom(event.target.value)} />
            </label>
          )}
        </div>
        <div>
          <button className="button button--primary" type="submit">Würfeln</button>
        </div>
        {error && <p className="feedback feedback--error" role="alert">{error}</p>}
      </form>
      {roll && (
        <div className="form-stack" role="status" aria-atomic="true">
          <p><strong>{roll.values.length}W{roll.sides}</strong> · Summe {formatNumber(roll.values.reduce((sum, value) => sum + value, 0))}</p>
          <ol className="dice-results" role="list" aria-label="Würfelergebnisse">
            {roll.values.map((value, index) => (
              <li
                className={`die${value === 1 ? " die--min" : value === roll.sides ? " die--max" : ""}`}
                key={index}
              >
                {value}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

const calculatorKeys = ["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "⌫", "="];
const keyLabels: Record<string, readonly [string, string]> = {
  C: ["C", "Rechner löschen"],
  "(": ["(", "Klammer auf"],
  ")": [")", "Klammer zu"],
  "/": ["÷", "Teilen"],
  "*": ["×", "Multiplizieren"],
  "-": ["−", "Minus"],
  "+": ["+", "Plus"],
  ".": [",", "Komma"],
  "⌫": ["⌫", "Letzte Eingabe löschen"],
  "=": ["=", "Berechnen"],
};

function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  function press(key: string) {
    if (key === "C") {
      setExpression("");
      setResult("");
    } else if (key === "⌫") {
      setExpression(expression.slice(0, -1));
      setResult("");
    } else if (key === "=") {
      if (!expression) return;
      try {
        setResult(String(evaluateArithmetic(expression)).replace(".", ","));
      } catch (error) {
        setResult(error instanceof Error ? error.message : "Ungültiger Ausdruck.");
      }
    } else if (expression.length < 160) {
      setExpression(expression + key);
      setResult("");
    }
  }

  return (
    <section className="panel" aria-labelledby="calculator-heading">
      <h3 id="calculator-heading">Rechner</h3>
      <div className="calc-display">
        <p aria-label="Ausdruck">{expression.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−").replaceAll(".", ",") || "0"}</p>
        <output aria-label="Rechenergebnis">{result}</output>
      </div>
      <div className="calc-pad">
        {calculatorKeys.map((key) => (
          <button
            key={key}
            className={`calc-key${keyLabels[key] ? " calc-key--operator" : ""}`}
            type="button"
            aria-label={keyLabels[key]?.[1]}
            onClick={() => press(key)}
          >
            {keyLabels[key]?.[0] ?? key}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ToolsView() {
  return (
    <section className="play-view" aria-labelledby="tools-heading">
      <h2 id="tools-heading">Werkzeuge</h2>
      <div className="play-grid">
        <DiceRoller />
        <Calculator />
      </div>
    </section>
  );
}
