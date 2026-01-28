import { useState } from "react";
import type { FormEvent } from "react";
import { useCharacter } from "../features/character/CharacterContext";
import CharacterNameInput from "../features/character/CharacterNameInput";
import ExperienceSection from "../features/character/ExperienceSection";
import SaveControls from "../features/character/SaveControls";
import VanillaMagicSystem from "../features/magic/VanillaMagicSystem";
import type { MagicSystemState } from "../features/magic/types";
import { generateStandardFilename, getSaveData, loadCharacterFile, saveCharacterData } from "../script/saveLoader";

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

const invokeLegacy = (name: string, ...args: unknown[]) => {
  const legacyFn = (window as typeof window & Record<string, (...params: unknown[]) => void>)[name];
  if (typeof legacyFn === "function") {
    legacyFn(...args);
  }
};

type TabsProps = {
  listenersEnabled: boolean;
  hiddenItemsVisible: boolean;
  magicState: MagicSystemState;
  onMagicChange: (state: MagicSystemState) => void;
};

const Tabs = ({ listenersEnabled, hiddenItemsVisible, magicState, onMagicChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("charakter");
  const { name, experience, setLevel, setXp, setSteigerungspunkte } = useCharacter();

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
                  <button type="submit" id="wadd" onClick={() => invokeLegacy("TheChoosenOne")}>
                    Add Wallet
                  </button>
                  <button type="submit" id="wconvert" onClick={() => invokeLegacy("wConvert")}>
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
                  <button type="submit" id="wReset" onClick={() => invokeLegacy("wReset")} style={{ marginTop: "20px" }}>
                    Reset Wallet
                  </button>
                </form>
              </div>

              <ExperienceSection
                onRecalculate={() => invokeLegacy("updateCharakterCalculation")}
                listenersEnabled={listenersEnabled}
              />
            </div>

            <div className="three-column-container">
              <div className="FlexItemContainer" id="kampfBasisContainer">
                <h6>Kampf Basiswerte</h6>
                <div className="FlexItem">
                  <label>Wurfwaffen Basiswert:</label>
                  <input
                    className="stg attributeInput KampfBasiswerte"
                    type="number"
                    defaultValue={0}
                    id="KampfBasiswerte_Wurfwaffen_Basiswert"
                  />
                  <span className="readonly-value">×</span>
                </div>
                <div className="FlexItem">
                  <label>Schusswaffen Basiswert:</label>
                  <input
                    className="stg attributeInput KampfBasiswerte"
                    type="number"
                    defaultValue={0}
                    id="KampfBasiswerte_Schusswaffen_Basiswert"
                  />
                  <span className="readonly-value">×</span>
                </div>
                <div className="FlexItem">
                  <label>Attacke Basiswert:</label>
                  <input
                    className="stg attributeInput KampfBasiswerte"
                    type="number"
                    defaultValue={0}
                    id="KampfBasiswerte_Attacke_Basiswert"
                  />
                  <span className="readonly-value">×</span>
                </div>
                <div className="FlexItem">
                  <label>Parade Basiswert:</label>
                  <input
                    className="stg attributeInput KampfBasiswerte"
                    type="number"
                    defaultValue={0}
                    id="KampfBasiswerte_Parade_Basiswert"
                  />
                  <span className="readonly-value">×</span>
                </div>
              </div>

              <div className="FlexItemContainer" id="modifierContainer">
                <h6>Modifier</h6>
                <div className="modifier-flex">
                  <div className="FlexItem">
                    <label>Magie:</label>
                    <input className="stg attributeInput modifier" type="number" defaultValue={0} id="modifier_magie" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>ASP:</label>
                    <input className="stg attributeInput modifier" type="number" defaultValue={0} id="modifier_asp" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>LP:</label>
                    <input className="stg attributeInput modifier" type="number" defaultValue={0} id="modifier_lp" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Fernkampf:</label>
                    <input
                      className="stg attributeInput modifier"
                      type="number"
                      defaultValue={0}
                      id="modifier_fernkampf"
                    />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Nahkampf:</label>
                    <input
                      className="stg attributeInput modifier"
                      type="number"
                      defaultValue={0}
                      id="modifier_nahkampf"
                    />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Gift:</label>
                    <input className="stg attributeInput modifier" type="number" defaultValue={0} id="modifier_gift" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Stealth:</label>
                    <input
                      className="stg attributeInput modifier"
                      type="number"
                      defaultValue={0}
                      id="modifier_stealth"
                    />
                    <span className="readonly-value">×</span>
                  </div>
                </div>
              </div>

              <div className="FlexItemContainer" id="attributeContainer">
                <h6>Attribute</h6>
                <div className="attribute-flex">
                  <div className="FlexItem">
                    <label>Konstitution:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Konstitution" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Körperkraft:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Körperkraft" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Gewandheit:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Gewandheit" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Klugheit:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Klugheit" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Intuition:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Intuition" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Geschicklichkeit:</label>
                    <input
                      className="stg attributeInput attribute"
                      type="number"
                      defaultValue={9}
                      id="attribute_Geschicklichkeit"
                    />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Tarnung:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Tarnung" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Fingerfertigkeit:</label>
                    <input
                      className="stg attributeInput attribute"
                      type="number"
                      defaultValue={9}
                      id="attribute_Fingerfertigkeit"
                    />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Sinnesschärfe:</label>
                    <input
                      className="stg attributeInput attribute"
                      type="number"
                      defaultValue={9}
                      id="attribute_Sinnesschärfe"
                    />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Charisma:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Charisma" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                  <div className="FlexItem">
                    <label>Willenskraft:</label>
                    <input className="stg attributeInput attribute" type="number" defaultValue={9} id="attribute_Willenskraft" />
                    <button type="button" className="hidebutton">
                      X
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="three-column-container">
              <div className="FlexItemContainer" id="sonderwerteContainer">
                <h6>Sonderwerte</h6>
                <div className="sonderwerte-flex">
                  <div className="FlexItem">
                    <label>Aktuelle LP:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Aktuelle_LP" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Maximale LP:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Maximale_LP" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Ausdauer:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Ausdauer" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Maximale Ausdauer:</label>
                    <input
                      className="stg attributeInput sonderwerte"
                      type="number"
                      defaultValue={0}
                      id="sonderwerte_Maximale_Ausdauer"
                    />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Astralenergie:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Astralenergie" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Maximale Astralenergie:</label>
                    <input
                      className="stg attributeInput sonderwerte"
                      type="number"
                      defaultValue={0}
                      id="sonderwerte_Maximale_Astralenergie"
                    />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Magiebegabung:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Magiebegabung" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Magieresistenz:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Magieresistenz" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Giftresistenz:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Giftresistenz" />
                    <span className="readonly-value">×</span>
                  </div>
                  <div className="FlexItem">
                    <label>Schnelligkeit:</label>
                    <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Schnelligkeit" />
                    <span className="readonly-value">×</span>
                  </div>
                </div>
              </div>
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
          ></div>
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
              <button type="button" onClick={() => invokeLegacy("addToInventoryFromInput")}>
                Hinzufügen
              </button>
              <button type="button" onClick={() => invokeLegacy("removeFromInventoryFromInput")}>
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
              <select id="Dicer" defaultValue="d20" onChange={() => invokeLegacy("DiceChooser")}>
                <option value="d100">W100</option>
                <option value="d20">W20</option>
                <option value="d10">W10</option>
                <option value="d6">W6</option>
                <option value="custom">Eigener Würfel</option>
              </select>
              <input type="number" id="DiceCount" defaultValue={1} min={1} max={20} />
              <input type="number" id="DiceSides" defaultValue={20} min={2} max={1000} className="disNone" />
              <button type="button" onClick={() => invokeLegacy("Roll")}>
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
                <button type="button" onClick={() => invokeLegacy("clearEqField")} className="calc-button function-button">
                  C
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "(")} className="calc-button function-button">
                  (
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", ")")} className="calc-button function-button">
                  )
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "/")} className="calc-button operator-button">
                  /
                </button>

                <button type="button" onClick={() => invokeLegacy("InToHTML", "7")} className="calc-button">
                  7
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "8")} className="calc-button">
                  8
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "9")} className="calc-button">
                  9
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "*")} className="calc-button operator-button">
                  ×
                </button>

                <button type="button" onClick={() => invokeLegacy("InToHTML", "4")} className="calc-button">
                  4
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "5")} className="calc-button">
                  5
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "6")} className="calc-button">
                  6
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "-")} className="calc-button operator-button">
                  -
                </button>

                <button type="button" onClick={() => invokeLegacy("InToHTML", "1")} className="calc-button">
                  1
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "2")} className="calc-button">
                  2
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "3")} className="calc-button">
                  3
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", "+")} className="calc-button operator-button">
                  +
                </button>

                <button type="button" onClick={() => invokeLegacy("InToHTML", "0")} className="calc-button">
                  0
                </button>
                <button type="button" onClick={() => invokeLegacy("InToHTML", ".")} className="calc-button">
                  .
                </button>
                <button type="button" onClick={() => invokeLegacy("calculate")} className="calc-button equal-button">
                  =
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`tab-content${activeTab === "einstellungen" ? " active" : ""}`} id="einstellungen-tab">
          <div className="FlexItemContainer">
            <h6>Charakter Einstellungen</h6>
            <button type="button" id="setMin">
              Alle Werte auf Minimum setzen
            </button>
            <button type="button" id="setMax">
              Alle Werte auf Maximum setzen
            </button>
          </div>
          <div className="FlexItemContainer">
            <h6>Layout Einstellungen</h6>
            <div>
              <label htmlFor="fontInput">Schriftart:</label>
              <input type="text" id="fontInput" placeholder="z.B. Arial, sans-serif" />
              <button type="button" onClick={() => invokeLegacy("changeFont")}>
                Ändern
              </button>
            </div>
            <div>
              <label htmlFor="colorInput">Textfarbe:</label>
              <input type="color" id="colorInput" defaultValue="#36251b" />
              <button type="button" onClick={() => invokeLegacy("changeColor")}>
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
