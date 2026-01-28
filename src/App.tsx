import { useState } from "react";
import TopControls from "./components/TopControls";
import Tabs from "./components/Tabs";
import { CharacterProvider } from "./features/character";
import type { MagicSystemState } from "./features/magic/types";

const App = () => {
  const [listenersEnabled, setListenersEnabled] = useState(true);
  const [hiddenItemsVisible, setHiddenItemsVisible] = useState(false);
  const [magicState, setMagicState] = useState<MagicSystemState>({
    advancementPoints: 0,
    magicAbilities: [],
  });

  const handleAutoSkill = () => {
    const legacyFn = (window as typeof window & Record<string, (...params: unknown[]) => void>).autoSkillVerteilung;
    if (typeof legacyFn === "function") {
      legacyFn();
    }
  };

  return (
    <CharacterProvider>
      <div className="app">
        <TopControls
          listenersEnabled={listenersEnabled}
          onToggleListeners={setListenersEnabled}
          hiddenItemsVisible={hiddenItemsVisible}
          onToggleHiddenItems={setHiddenItemsVisible}
          onAutoSkill={handleAutoSkill}
        />
        <Tabs
          listenersEnabled={listenersEnabled}
          hiddenItemsVisible={hiddenItemsVisible}
          magicState={magicState}
          onMagicChange={setMagicState}
        />
      </div>
    </CharacterProvider>
  );
};

export default App;
