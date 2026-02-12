import { useMemo, useState } from "react";
import { useCharacter } from "../CharacterContext";
import {
  calculateDerivedValues,
  type CoreAttributes,
  type CoreModifiers,
} from "../services/derivedCalculations";

const defaultAttributes: CoreAttributes = {
  konstitution: 9,
  körperkraft: 9,
  gewandheit: 9,
  klugheit: 9,
  intuition: 9,
  fingerfertigkeit: 9,
  charisma: 9,
  geschicklichkeit: 9,
  tarnung: 9,
  sinnesschärfe: 9,
  willenskraft: 9,
};

const defaultModifiers: CoreModifiers = {
  lp: 0,
  asp: 0,
  magie: 0,
  fernkampf: 0,
  nahkampf: 0,
  gift: 0,
  stealth: 0,
};

export const useCharacterCalculations = (magicSum: number) => {
  const { experience } = useCharacter();
  const [attributes, setAttributes] = useState<CoreAttributes>(defaultAttributes);
  const [modifiers, setModifiers] = useState<CoreModifiers>(defaultModifiers);

  const derived = useMemo(
    () =>
      calculateDerivedValues({
        attributes,
        modifiers,
        experience,
        magicSum,
      }),
    [attributes, modifiers, experience, magicSum]
  );

  return {
    attributes,
    setAttributes,
    modifiers,
    setModifiers,
    derived,
  };
};
