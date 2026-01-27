// @ts-nocheck
type CharacterState = {
  inputs: Record<string, number | string>;
  derived: Record<string, number>;
};

const characterState: CharacterState = {
  inputs: {},
  derived: {},
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const readNumericInput = (id: string, fallback = 0) => {
  const element = document.getElementById(id);
  const value = parseNumber(element?.value, fallback);
  characterState.inputs[id] = value;
  return value;
};

export const readTextInput = (id: string, fallback = "") => {
  const element = document.getElementById(id);
  const value = element?.value ?? fallback;
  characterState.inputs[id] = value;
  return value;
};

export const writeInputValue = (id: string, value: number | string) => {
  characterState.inputs[id] = value;
  const element = document.getElementById(id);
  if (element) {
    element.value = String(value);
  }
};

export const writeDerivedValue = (id: string, value: number) => {
  characterState.derived[id] = value;
  const element = document.getElementById(id);
  if (element) {
    element.value = String(value);
  }
};

export const syncInputElement = (element: HTMLInputElement) => {
  if (!element?.id) {
    return;
  }
  const value = element.type === "number" ? parseNumber(element.value, 0) : element.value;
  characterState.inputs[element.id] = value;
};

export const getCharacterStateSnapshot = () => ({
  inputs: { ...characterState.inputs },
  derived: { ...characterState.derived },
});
