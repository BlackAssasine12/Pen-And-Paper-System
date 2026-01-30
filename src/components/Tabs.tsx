import { useState } from "react";
import type { FormEvent } from "react";
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
import { Roll, DiceChooser } from "../features/dice/services/dice";
import { calculate, clearEqField, InToHTML } from "../features/dice/services/rechner";
import VanillaMagicSystem from "../features/magic/VanillaMagicSystem";
import type { MagicSystemState } from "../features/magic/types";
import { addToInventoryFromInput, removeFromInventoryFromInput } from "../features/shop/services/shop";
import { TheChoosenOne, wConvert, wReset } from "../features/shop/services/wallet";

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

              <div className="WalletContainer FlexItemContainer" id="WalletContainer">
                <h6>Geldbeutel</h6>
                <form id="inputField" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
                  <input type="number" placeholder="Enter a number" id="NumberInput" defaultValue={0} />
                  <select name="Währund" id="CurrencyField">
                    <option id="dukaten" value="dukaten">
                      Dukaten
                    </option>
                    <option id="silber" value="silber">
                      Silberlinge
                    </option>
                    <option id="heller" value="heller">
                      Heller
                    </option>
                    <option id="kreuzer" value="kreuzer">
                      Kreuzer
                    </option>
                  </select>
                  <button type="submit" id="wadd" onClick={TheChoosenOne}>
                    Add Wallet
                  </button>
                  <button type="submit" id="wconvert" onClick={wConvert}>
                    Convert Wallet
                  </button>

                  <div style={{ marginTop: "20px" }}>
                    <div>
                      Dukaten: <p id="showDukaten"></p>
                    </div>
                    <div>
                      Silberlinge: <p id="showSilber"></p>
                    </div>
                    <div>
                      Heller: <p id="showHeller"></p>
                    </div>
                    <div>
                      Kreuzer: <p id="showKreuzer"></p>
                    </div>
                  </div>
                  <button type="submit" id="wReset" onClick={wReset} style={{ marginTop: "20px" }}>
                    Reset Wallet
                  </button>
                </form>
              </div>

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
          <div className="FlexItemContainer" id="ShopContainer">
            <h6>Shop</h6>
            <button type="button" id="ShopButton">
              -
            </button>
            <div id="shop" className="shop-container"></div>
          </div>
          <div className="FlexItemContainer" id="InvContainer">
            <h6>Inventar</h6>
            <div>
              <input type="text" id="itemNameInput" placeholder="Artikelname" />
              <button type="button" onClick={addToInventoryFromInput}>
                Hinzufügen
              </button>
              <button type="button" onClick={removeFromInventoryFromInput}>
                Entfernen
              </button>
            </div>
            <ul id="inventory" className="inventory-list"></ul>
          </div>
        </div>

        <div className={`tab-content${activeTab === "werkzeuge" ? " active" : ""}`} id="werkzeuge-tab">
          <div className="FlexItemContainer">
            <h6>Würfelsystem</h6>
            <div className="dice-controls">
              <select id="Dicer" defaultValue="d20" onChange={DiceChooser}>
                <option value="d100">W100</option>
                <option value="d20">W20</option>
                <option value="d10">W10</option>
                <option value="d6">W6</option>
                <option value="custom">Eigener Würfel</option>
              </select>
              <input type="number" id="DiceCount" defaultValue={1} min={1} max={20} />
              <input type="number" id="DiceSides" defaultValue={20} min={2} max={1000} className="disNone" />
              <button type="button" onClick={Roll}>
                Würfeln
              </button>
            </div>
            <div id="showDice" className="dice-results"></div>
          </div>

          <div className="FlexItemContainer calculator-container">
            <h6>Rechner</h6>
            <div id="calculator">
              <div id="calc-display">
                <div id="eqField" className="equation-field"></div>
                <div id="evField" className="result-field"></div>
              </div>
              <div className="calculator-buttons">
                <button type="button" onClick={clearEqField} className="calc-button function-button">
                  C
                </button>
                <button type="button" onClick={() => InToHTML("(")} className="calc-button function-button">
                  (
                </button>
                <button type="button" onClick={() => InToHTML(")")} className="calc-button function-button">
                  )
                </button>
                <button type="button" onClick={() => InToHTML("/")} className="calc-button operator-button">
                  /
                </button>

                <button type="button" onClick={() => InToHTML("7")} className="calc-button">
                  7
                </button>
                <button type="button" onClick={() => InToHTML("8")} className="calc-button">
                  8
                </button>
                <button type="button" onClick={() => InToHTML("9")} className="calc-button">
                  9
                </button>
                <button type="button" onClick={() => InToHTML("*")} className="calc-button operator-button">
                  ×
                </button>

                <button type="button" onClick={() => InToHTML("4")} className="calc-button">
                  4
                </button>
                <button type="button" onClick={() => InToHTML("5")} className="calc-button">
                  5
                </button>
                <button type="button" onClick={() => InToHTML("6")} className="calc-button">
                  6
                </button>
                <button type="button" onClick={() => InToHTML("-")} className="calc-button operator-button">
                  -
                </button>

                <button type="button" onClick={() => InToHTML("1")} className="calc-button">
                  1
                </button>
                <button type="button" onClick={() => InToHTML("2")} className="calc-button">
                  2
                </button>
                <button type="button" onClick={() => InToHTML("3")} className="calc-button">
                  3
                </button>
                <button type="button" onClick={() => InToHTML("+")} className="calc-button operator-button">
                  +
                </button>

                <button type="button" onClick={() => InToHTML("0")} className="calc-button">
                  0
                </button>
                <button type="button" onClick={() => InToHTML(".")} className="calc-button">
                  .
                </button>
                <button type="button" onClick={calculate} className="calc-button equal-button">
                  =
                </button>
              </div>
            </div>
          </div>
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
