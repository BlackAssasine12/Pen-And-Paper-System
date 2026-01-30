import { useState } from "react";
import {
  CharacterNameInput,
  ExperienceSection,
  SaveControls,
  generateStandardFilename,
  getSaveData,
  loadCharacterFile,
  saveCharacterData,
  useCharacter,
} from "../features/character";
import { useCharacterCalculations } from "../features/character/hooks/useCharacterCalculations";
import AttributesSection from "../features/character/components/AttributesSection";
import CombatBaseSection from "../features/character/components/CombatBaseSection";
import HiddenAttributesSection from "../features/character/components/HiddenAttributesSection";
import ModifiersSection from "../features/character/components/ModifiersSection";
import SonderwerteSection from "../features/character/components/SonderwerteSection";
import { updateCharakterCalculation } from "../features/character/services/calculations";
import { changeColor, changeFont } from "../features/character/services/skin";
import Calculator from "../features/dice/components/Calculator";
import DiceRoller from "../features/dice/components/DiceRoller";
import VanillaMagicSystem from "../features/magic/VanillaMagicSystem";
import type { MagicSystemState } from "../features/magic/types";
import InventoryPanel from "../features/shop/components/InventoryPanel";
import ShopPanel from "../features/shop/components/ShopPanel";
import WalletPanel from "../features/shop/components/WalletPanel";

type TabKey = "charakter" | "magie" | "ausgeblendete" | "inventar" | "werkzeuge" | "einstellungen";

type TabDefinition = {
  key: TabKey;
  label: string;
  contentId: string;
};

const tabs: TabDefinition[] = [
  { key: "charakter", label: "Charakter", contentId: "charakter-tab" },
  { key: "magie", label: "Magie", contentId: "magie-tab" },
  { key: "ausgeblendete", label: "Ausgeblendete", contentId: "ausgeblendete-tab" },
  { key: "inventar", label: "Inventar & Shop", contentId: "inventar-tab" },
  { key: "werkzeuge", label: "Werkzeuge", contentId: "werkzeuge-tab" },
  { key: "einstellungen", label: "Einstellungen", contentId: "einstellungen-tab" },
];

type TabsProps = {
  listenersEnabled: boolean;
  hiddenItemsVisible: boolean;
  magicState: MagicSystemState;
  onMagicChange: (state: MagicSystemState) => void;
};

const Tabs = ({ listenersEnabled, hiddenItemsVisible, magicState, onMagicChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("charakter");
  const { name, experience, setLevel, setXp, setSteigerungspunkte } = useCharacter();
  const magicSum = magicState.magicAbilities.reduce((sum, ability) => sum + (ability.level ?? 0), 0);
  const { attributes, setAttributes, modifiers, setModifiers, derived } = useCharacterCalculations(magicSum);
  const [hiddenAttributes, setHiddenAttributes] = useState<Array<keyof typeof attributes>>([]);

  // Tabs nutzt weiterhin diese DOM-basierten Services, bis die Features vollständig in React migriert sind.

  const attributeMin = 7;
  const attributeMax = Math.min(derived.level + 12, 21);
  const modifierMin = 0;
  const modifierMax = derived.level + 2;

  const handleAttributeChange = (key: keyof typeof attributes, value: number) => {
    setAttributes((current) => ({ ...current, [key]: value }));
  };

  const handleModifierChange = (key: keyof typeof modifiers, value: number) => {
    setModifiers((current) => ({ ...current, [key]: value }));
  };

  const handleHideAttribute = (key: keyof typeof attributes) => {
    setHiddenAttributes((current) => (current.includes(key) ? current : [...current, key]));
  };

  const handleRestoreAttribute = (key: keyof typeof attributes) => {
    setHiddenAttributes((current) => current.filter((item) => item !== key));
  };

  const setAllAttributeValues = (value: number) => {
    setAttributes((current) =>
      (Object.keys(current) as Array<keyof typeof current>).reduce(
        (acc, key) => ({ ...acc, [key]: value }),
        { ...current }
      )
    );
  };

  const setAllModifierValues = (value: number) => {
    setModifiers((current) =>
      (Object.keys(current) as Array<keyof typeof current>).reduce(
        (acc, key) => ({ ...acc, [key]: value }),
        { ...current }
      )
    );
  };

  return (
    <div className="tabs-container">
      <ul className="tab-nav">
        {tabs.map((tab) => (
          <li
            key={tab.key}
            className={`tab-item${activeTab === tab.key ? " active" : ""}`}
            data-tab={tab.contentId}
          >
            <button type="button" onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="content">
        <div className={`tab-content${activeTab === "charakter" ? " active" : ""}`} id="charakter-tab">
          <SaveControls
            characterName={name}
            onGenerateFilename={generateStandardFilename}
            onLoadFile={(file) =>
              loadCharacterFile(file, {
                onMagicLoaded: onMagicChange,
                onExperienceLoaded: (loadedExperience) => {
                  setLevel(loadedExperience.level ?? 0);
                  setXp(loadedExperience.xp ?? 0);
                  setSteigerungspunkte(loadedExperience.steigerungspunkte ?? 0);
                },
              })
            }
            onSave={(filename) => {
              const data = getSaveData();
              if (!data) {
                alert("Es wurden noch keine Charakterdaten geladen!");
                return;
              }

              saveCharacterData(data, {
                filename,
                characterName: name,
                experience,
                magicSystem: {
                  ...magicState,
                  advancementPoints: experience.steigerungspunkte,
                },
              });
            }}
          />

          <div className="main-character-content">
            <div className="three-column-container">
              <div className="infoFlexContainer">
                <h6>Charakterinformation</h6>
                <CharacterNameInput />
                <div className="mediumFlexItem">
                  Geschlecht: <input className="eingabefeld" defaultValue=" " id="geschlecht" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Größe: <input className="eingabefeld" defaultValue=" " id="größe" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Alter: <input className="eingabefeld" defaultValue=" " id="alter" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Gewicht: <input className="eingabefeld" defaultValue=" " id="gewicht" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Haarfarbe: <input className="eingabefeld" defaultValue=" " id="haarfarbe" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Augenfarbe: <input className="eingabefeld" defaultValue=" " id="augenfarbe" type="text" />
                </div>
                <div className="mediumFlexItem">
                  Titel: <input className="eingabefeld" defaultValue=" " id="titel" type="text" />
                </div>
                <div className="rakla-select">
                  <div className="mediumFlexItem">
                    <label htmlFor="rassen-select">Rasse: </label>
                    <select name="rassen-select" id="rassen-select" className="infoFlexItem">
                      <option value=""></option>
                    </select>
                  </div>
                  <div className="mediumFlexItem">
                    <label htmlFor="klassen-select">Klasse: </label>
                    <select name="klassen-select" id="klassen-select" className="infoFlexItem">
                      <option value=""></option>
                    </select>
                  </div>
                </div>
              </div>

              <WalletPanel />

              <ExperienceSection onRecalculate={updateCharakterCalculation} listenersEnabled={listenersEnabled} />
            </div>

            <div className="three-column-container">
              <CombatBaseSection derived={derived} />
              <ModifiersSection
                modifiers={modifiers}
                onChange={handleModifierChange}
                minValue={modifierMin}
                maxValue={modifierMax}
              />
              <AttributesSection
                attributes={attributes}
                onChange={handleAttributeChange}
                minValue={attributeMin}
                maxValue={attributeMax}
                hiddenKeys={hiddenAttributes}
                onHide={handleHideAttribute}
              />
            </div>

            <div className="three-column-container">
              <SonderwerteSection derived={derived} />
            </div>

            <div className="FlexItemContainer BigFlexItemContainer" id="kampfTalenteContainer">
              <h6>Kampf Talente (AT/PA/Skillwert)</h6>
              <div className="kampf-talente-flex" id="kampfTalenteGridContainer"></div>
            </div>

            <div id="charakterContainer"></div>
          </div>
        </div>

        <div className={`tab-content${activeTab === "magie" ? " active" : ""}`} id="magie-tab">
          <VanillaMagicSystem state={magicState} onChange={onMagicChange} />
        </div>

        <div className={`tab-content${activeTab === "ausgeblendete" ? " active" : ""}`} id="ausgeblendete-tab">
          <div
            id="hiddenItemsContainer"
            className="hidden-items"
            style={{ display: hiddenItemsVisible ? "flex" : "none" }}
          >
            <HiddenAttributesSection
              attributes={attributes}
              hiddenKeys={hiddenAttributes}
              minValue={attributeMin}
              maxValue={attributeMax}
              onChange={handleAttributeChange}
              onRestore={handleRestoreAttribute}
            />
          </div>
        </div>

        <div className={`tab-content${activeTab === "inventar" ? " active" : ""}`} id="inventar-tab">
          <ShopPanel />
          <InventoryPanel />
        </div>

        <div className={`tab-content${activeTab === "werkzeuge" ? " active" : ""}`} id="werkzeuge-tab">
          <DiceRoller />
          <Calculator />
        </div>

        <div className={`tab-content${activeTab === "einstellungen" ? " active" : ""}`} id="einstellungen-tab">
          <div className="FlexItemContainer">
            <h6>Charakter Einstellungen</h6>
            <button
              type="button"
              id="setMin"
              onClick={() => {
                setAllAttributeValues(attributeMin);
                setAllModifierValues(modifierMin);
              }}
            >
              Alle Werte auf Minimum setzen
            </button>
            <button
              type="button"
              id="setMax"
              onClick={() => {
                setAllAttributeValues(attributeMax);
                setAllModifierValues(modifierMax);
              }}
            >
              Alle Werte auf Maximum setzen
            </button>
          </div>
          <div className="FlexItemContainer">
            <h6>Layout Einstellungen</h6>
            <div>
              <label htmlFor="fontInput">Schriftart:</label>
              <input type="text" id="fontInput" placeholder="z.B. Arial, sans-serif" />
              <button type="button" onClick={changeFont}>
                Ändern
              </button>
            </div>
            <div>
              <label htmlFor="colorInput">Textfarbe:</label>
              <input type="color" id="colorInput" defaultValue="#36251b" />
              <button type="button" onClick={changeColor}>
                Ändern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
