import { useState } from "react";

const Calculator = () => {
  const [equation, setEquation] = useState("");
  const [result, setResult] = useState("");

  const append = (value: string) => {
    setEquation((current) => `${current}${value}`);
    setResult("");
  };

  const clear = () => {
    setEquation("");
    setResult("");
  };

  const calculate = () => {
    if (!equation.trim()) {
      setResult("");
      return;
    }

    try {
      const calculation = eval(equation) as unknown;
      setResult(String(calculation));
    } catch {
      setResult("Fehler");
    }
  };

  return (
    <div className="FlexItemContainer calculator-container">
      <h6>Rechner</h6>
      <div id="calculator">
        <div id="calc-display">
          <div id="eqField" className="equation-field">
            {equation}
          </div>
          <div id="evField" className="result-field">
            {result}
          </div>
        </div>
        <div className="calculator-buttons">
          <button type="button" onClick={clear} className="calc-button function-button">
            C
          </button>
          <button type="button" onClick={() => append("(")} className="calc-button function-button">
            (
          </button>
          <button type="button" onClick={() => append(")")} className="calc-button function-button">
            )
          </button>
          <button type="button" onClick={() => append("/")} className="calc-button operator-button">
            /
          </button>

          <button type="button" onClick={() => append("7")} className="calc-button">
            7
          </button>
          <button type="button" onClick={() => append("8")} className="calc-button">
            8
          </button>
          <button type="button" onClick={() => append("9")} className="calc-button">
            9
          </button>
          <button type="button" onClick={() => append("*")} className="calc-button operator-button">
            ×
          </button>

          <button type="button" onClick={() => append("4")} className="calc-button">
            4
          </button>
          <button type="button" onClick={() => append("5")} className="calc-button">
            5
          </button>
          <button type="button" onClick={() => append("6")} className="calc-button">
            6
          </button>
          <button type="button" onClick={() => append("-")} className="calc-button operator-button">
            -
          </button>

          <button type="button" onClick={() => append("1")} className="calc-button">
            1
          </button>
          <button type="button" onClick={() => append("2")} className="calc-button">
            2
          </button>
          <button type="button" onClick={() => append("3")} className="calc-button">
            3
          </button>
          <button type="button" onClick={() => append("+")} className="calc-button operator-button">
            +
          </button>

          <button type="button" onClick={() => append("0")} className="calc-button">
            0
          </button>
          <button type="button" onClick={() => append(".")} className="calc-button">
            .
          </button>
          <button type="button" onClick={calculate} className="calc-button equal-button">
            =
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
