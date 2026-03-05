import { useEffect, useState } from "react";
import { CharacterNameInput, ExperienceSection } from "../features/character";
import SaveControlsSection from "../features/character/components/SaveControlsSection";
import CombatTalentsSection from "../features/character/components/CombatTalentsSection";
import { useCharacterCalculations } from "../features/character/hooks/useCharacterCalculations";
import AttributesSection from "../features/character/components/AttributesSection";
import CombatBaseSection from "../features/character/components/CombatBaseSection";
import HiddenAttributesSection from "../features/character/components/HiddenAttributesSection";
import ModifiersSection from "../features/character/components/ModifiersSection";
import SonderwerteSection from "../features/character/components/SonderwerteSection";
import TalentSections from "../features/character/components/TalentSections";
import { applyAutoSkillDistribution } from "../features/character/services/autoSkillDistribution";
import { changeColor, changeFont } from "../features/character/services/skin";
import { initializeListe } from "../features/character/services/liste";
import Calculator from "../features/dice/components/Calculator";
import DiceRoller from "../features/dice/components/DiceRoller";
import VanillaMagicSystem from "../features/magic/VanillaMagicSystem";
import type { MagicSystemState } from "../features/magic/types";
import InventoryPanel from "../features/shop/components/InventoryPanel";
import ShopPanel from "../features/shop/components/ShopPanel";
import WalletPanel from "../features/shop/components/WalletPanel";
import type { CharacterData } from "../types/character";
import type { CoreAttributes, CoreModifiers } from "../features/character/services/derivedCalculations";
import { setSaveData } from "../features/character/services/saveLoader";
import TopControls from "./TopControls";

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

const attributeKeyMap: Record<string, keyof CoreAttributes> = {
  Konstitution: "konstitution",
  Körperkraft: "körperkraft",
  Gewandheit: "gewandheit",
  Klugheit: "klugheit",
  Intuition: "intuition",
  Fingerfertigkeit: "fingerfertigkeit",
  Charisma: "charisma",
  Geschicklichkeit: "geschicklichkeit",
  Tarnung: "tarnung",
  Sinnesschärfe: "sinnesschärfe",
  Willenskraft: "willenskraft",
};

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("charakter");
  const [listenersEnabled, setListenersEnabled] = useState(true);
  const [hiddenItemsVisible, setHiddenItemsVisible] = useState(false);
  const [magicState, setMagicState] = useState<MagicSystemState>({
    advancementPoints: 0,
    magicAbilities: [],
  });
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const magicSum = magicState.magicAbilities.reduce((sum, ability) => sum + (ability.level ?? 0), 0);
  const { attributes, setAttributes, modifiers, setModifiers, derived } = useCharacterCalculations(magicSum);
  const [hiddenAttributes, setHiddenAttributes] = useState<Array<keyof typeof attributes>>([]);

  const attributeMin = 7;
  const attributeMax = Math.min(derived.level + 12, 21);
  const modifierMin = 0;
  const modifierMax = derived.level + 2;
  const talentMin = -3;
  const talentMax = Math.min(derived.level + 10, 21);

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

  const updateFaehigkeiten = (
    updater: (current: NonNullable<CharacterData["charakter"]["fähigkeiten"]>) => CharacterData["charakter"]["fähigkeiten"]
  ) => {
    setCharacterData((prev) => {
      if (!prev) {
        return prev;
      }
      const current = (prev.charakter.fähigkeiten ?? {}) as NonNullable<CharacterData["charakter"]["fähigkeiten"]>;
      return {
        ...prev,
        charakter: {
          ...prev.charakter,
          fähigkeiten: updater(current),
        },
      };
    });
  };

  const setAllAbilityValues = (value: number) => {
    updateFaehigkeiten((current) => {
      const updated = { ...current };

      const updateTalentArray = (talents?: any[]) => {
        if (!talents || !Array.isArray(talents)) return talents;
        return talents.map((talent) => ({ ...talent, Wert: value }));
      };

      const updateKampfTalente = (talents?: Record<string, number[]>) => {
        if (!talents || typeof talents !== "object") return talents;
        return Object.keys(talents).reduce((acc, key) => {
          acc[key] = talents[key].map(() => value);
          return acc;
        }, {} as Record<string, number[]>);
      };

      updated.Assassinen_Talente = updateTalentArray(updated.Assassinen_Talente);
      updated.Talente_1 = updateTalentArray(updated.Talente_1);
      updated.Talente_2 = updateTalentArray(updated.Talente_2);
      updated.Handwerkstalente = updateTalentArray(updated.Handwerkstalente);

      updated.Kampf_Talente = updateKampfTalente(updated.Kampf_Talente);
      updated.Gespeicherte_Kampftalente = updateKampfTalente(updated.Gespeicherte_Kampftalente);

      return updated;
    });
  };

  const handleCombatTalentChange = (talentName: string, index: number, value: number) => {
    updateFaehigkeiten((current) => {
      const nextTalents = { ...(current.Kampf_Talente ?? {}) };
      const existing = Array.isArray(nextTalents[talentName]) ? [...(nextTalents[talentName] ?? [])] : [];
      while (existing.length < 3) {
        existing.push(0);
      }
      existing[index] = value;
      nextTalents[talentName] = existing;
      return { ...current, Kampf_Talente: nextTalents };
    });
  };

  const handleTalentChange = (section: "Assassinen_Talente" | "Talente_1" | "Talente_2" | "Handwerkstalente", index: number, value: number) => {
    updateFaehigkeiten((current) => {
      const sectionEntries = current[section];
      if (!Array.isArray(sectionEntries)) {
        return current;
      }
      const nextEntries = sectionEntries.map((entry, idx) =>
        idx === index ? { ...entry, Wert: value } : entry
      );
      return { ...current, [section]: nextEntries };
    });
  };

  const handleAutoSkill = () => {
    updateFaehigkeiten((current) => {
      if (!current.Kampf_Talente) {
        return current;
      }
      const nextTalents = applyAutoSkillDistribution(current.Kampf_Talente, {
        attacke: derived.attacke,
        parade: derived.parade,
        wurf: derived.wurf,
        schuss: derived.schuss,
      });
      return { ...current, Kampf_Talente: nextTalents };
    });
  };

  const applyCharacterData = (data: CharacterData) => {
    setCharacterData(data);
    setSaveData(data);

    const faehigkeiten = data.charakter?.fähigkeiten;
    if (faehigkeiten?.attribute) {
      setAttributes((current) => {
        const next = { ...current };
        Object.entries(faehigkeiten.attribute ?? {}).forEach(([key, value]) => {
          const mapped = attributeKeyMap[key];
          if (mapped) {
            next[mapped] = Number.isFinite(Number(value)) ? Number(value) : 0;
          }
        });
        return next;
      });
    }

    if (faehigkeiten?.modifier) {
      setModifiers((current) => {
        const next: CoreModifiers = { ...current };
        Object.entries(faehigkeiten.modifier ?? {}).forEach(([key, value]) => {
          if (key in next) {
            next[key as keyof CoreModifiers] = Number.isFinite(Number(value)) ? Number(value) : 0;
          }
        });
        return next;
      });
    }
  };

  useEffect(() => {
    if (characterData) {
      return;
    }
    const baseUrl = import.meta.env.BASE_URL ?? "/";
    fetch(`${baseUrl}charbogen/charakter.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Template konnte nicht geladen werden."))))
      .then((data: CharacterData) => {
        applyCharacterData(data);
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Charaktervorlage:", error);
      });
  }, [characterData]);

  useEffect(() => {
    if (characterData) {
      setSaveData(characterData);
    }
  }, [characterData]);

  useEffect(() => {
    initializeListe();
  }, []);

  return (
    <div className="tabs-container">
      <TopControls
        listenersEnabled={listenersEnabled}
        onToggleListeners={setListenersEnabled}
        hiddenItemsVisible={hiddenItemsVisible}
        onToggleHiddenItems={setHiddenItemsVisible}
        onAutoSkill={handleAutoSkill}
      />
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
          <SaveControlsSection
            magicState={magicState}
            onMagicChange={setMagicState}
            onCharacterLoaded={applyCharacterData}
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

              <ExperienceSection />
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

            <CombatTalentsSection
              talents={characterData?.charakter?.fähigkeiten?.Kampf_Talente}
              onChange={handleCombatTalentChange}
              minValue={talentMin}
              maxValue={talentMax}
            />

            <TalentSections
              faehigkeiten={characterData?.charakter?.fähigkeiten}
              onChange={handleTalentChange}
              minValue={talentMin}
              maxValue={talentMax}
            />
          </div>
        </div>

        <div className={`tab-content${activeTab === "magie" ? " active" : ""}`} id="magie-tab">
          <VanillaMagicSystem state={magicState} onChange={setMagicState} />
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
                setAllAbilityValues(talentMin);
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
                setAllAbilityValues(talentMax);
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