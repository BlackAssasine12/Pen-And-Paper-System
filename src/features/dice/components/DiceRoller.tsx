import { useMemo, useState } from "react";

type DiceOption = {
  value: string;
  label: string;
  sides: number | null;
};

const diceOptions: DiceOption[] = [
  { value: "d100", label: "W100", sides: 100 },
  { value: "d20", label: "W20", sides: 20 },
  { value: "d10", label: "W10", sides: 10 },
  { value: "d6", label: "W6", sides: 6 },
  { value: "custom", label: "Eigener Würfel", sides: null },
];

const createResults = (count: number, sides: number) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);

const DiceResult = ({ result, sides }: { result: number; sides: number }) => {
  const isMax = result === sides;
  const isMin = result === 1;
  const fill = isMax ? "#ff4122" : isMin ? "#1b7d4f" : "white";

  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 100 100"
      className={isMax ? "diceOutputMax" : isMin ? "diceOutputMin" : "diceOutput"}
    >
      <polygon
        points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
        stroke="black"
        strokeWidth={5}
        fill={fill}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={40}
        fontWeight="bold"
        fill="black"
      >
        {result}
      </text>
    </svg>
  );
};

const DiceRoller = () => {
  const [diceType, setDiceType] = useState("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(20);
  const [results, setResults] = useState<number[]>([]);

  const currentOption = useMemo(
    () => diceOptions.find((option) => option.value === diceType) ?? diceOptions[1],
    [diceType]
  );

  const handleTypeChange = (value: string) => {
    setDiceType(value);
    const option = diceOptions.find((item) => item.value === value);
    if (option?.sides) {
      setDiceSides(option.sides);
    }
  };

  const handleRoll = () => {
    const safeCount = Math.max(1, Math.min(20, Number.isNaN(diceCount) ? 1 : diceCount));
    const safeSides = Math.max(2, Math.min(1000, Number.isNaN(diceSides) ? 20 : diceSides));
    setResults(createResults(safeCount, safeSides));
  };

  return (
    <div className="FlexItemContainer">
      <h6>Würfelsystem</h6>
      <div className="dice-controls">
        <select value={diceType} onChange={(event) => handleTypeChange(event.target.value)}>
          {diceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={diceCount}
          min={1}
          max={20}
          onChange={(event) => setDiceCount(Number(event.target.value))}
        />
        <input
          type="number"
          value={diceSides}
          min={2}
          max={1000}
          className={currentOption.sides ? "disNone" : undefined}
          onChange={(event) => setDiceSides(Number(event.target.value))}
        />
        <button type="button" onClick={handleRoll}>
          Würfeln
        </button>
      </div>
      <div className="dice-results">
        {results.map((result, index) => (
          <DiceResult key={`${result}-${index}`} result={result} sides={diceSides} />
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
