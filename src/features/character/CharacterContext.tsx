import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type CharacterExperience = {
  level: number;
  xp: number;
  steigerungspunkte: number;
  gesteigerte: number;
};

type CharacterContextValue = {
  name: string;
  setName: (name: string) => void;
  experience: CharacterExperience;
  setLevel: (level: number) => void;
  setXp: (xp: number) => void;
  setSteigerungspunkte: (points: number) => void;
};

const CharacterContext = createContext<CharacterContextValue | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [steigerungspunkte, setSteigerungspunkte] = useState(0);
  const experience = useMemo(() => {
    const computedGesteigerte = (level * 30 + 100) - steigerungspunkte;
    return {
      level,
      xp,
      steigerungspunkte,
      gesteigerte: Number.isFinite(computedGesteigerte) ? computedGesteigerte : 0,
    };
  }, [level, xp, steigerungspunkte]);

  const value = useMemo(
    () => ({
      name,
      setName,
      experience,
      setLevel,
      setXp,
      setSteigerungspunkte,
    }),
    [name, experience]
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within CharacterProvider");
  }
  return context;
};
