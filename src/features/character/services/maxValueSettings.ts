export const applyMaxValueSettings = (level: number, MB: number) => {
  const talentInputs = document.querySelectorAll<HTMLInputElement>(
    ".Assassinen_Talente, .Talente_1, .Talente_2, .Handwerkstalente, .Kampf_Talente"
  );

  talentInputs.forEach((input) => {
    input.max = String(Math.min(level + 10, 21));
    input.min = String(-3);
  });

  const attrInputs = document.querySelectorAll<HTMLInputElement>(".attribute");
  attrInputs.forEach((input) => {
    input.max = String(Math.min(level + 12, 21));
    input.min = String(7);
  });

  const magicInputs = document.querySelectorAll<HTMLInputElement>(".Magische_Elemente");
  magicInputs.forEach((input) => {
    input.max = String(Math.min(MB / 2, 21));
    input.min = String(0);
  });

  const modifierInputs = document.querySelectorAll<HTMLInputElement>(".modifier");
  modifierInputs.forEach((input) => {
    input.max = String(level + 2);
    input.min = String(0);
  });

  const xp = document.querySelector<HTMLInputElement>("#erfahrung_xp");
  if (xp) xp.step = "100";
};
