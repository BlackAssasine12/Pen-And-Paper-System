import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useCharacter } from "../character/CharacterContext";
import type { MagicAbility, MagicSystemState } from "./types";

const magicElements = [
  "Feuer",
  "Wasser",
  "Erde",
  "Luft",
  "Natur",
  "Heilung",
  "Dunkle",
  "Helle",
  "Schatten",
  "Licht",
  "Holz",
  "Metall",
  "Eis",
  "Leben",
  "Nekromantie",
  "Blitz",
  "Blut",
  "Gravitation",
  "Erschaffung",
  "Raumzeit",
];

const magicTypes = ["Angriff", "Verteidigung", "Unterstützung", "Kontrolle", "Beschwörung", "Illusion", "Heilung"];

const elementIcons: Record<string, string> = {
  Feuer: "🔥",
  Wasser: "💧",
  Erde: "🌍",
  Luft: "💨",
  Natur: "🌿",
  Heilung: "❤️",
  Dunkle: "🌑",
  Helle: "✨",
  Schatten: "👤",
  Licht: "☀️",
  Holz: "🌲",
  Metall: "⚙️",
  Eis: "❄️",
  Leben: "🍃",
  Nekromantie: "💀",
  Blitz: "⚡",
  Blut: "🩸",
  Gravitation: "🧲",
  Erschaffung: "✨",
  Raumzeit: "🌀",
};

const magicTypeIcons: Record<string, string> = {
  Angriff: "⚔️",
  Verteidigung: "🛡️",
  Unterstützung: "🔮",
  Kontrolle: "🕸️",
  Beschwörung: "🌀",
  Illusion: "👁️",
  Heilung: "💖",
};

const levelUpCosts = [0, 2, 4, 6, 9, 12, 15, 18, 22, 26, 30, 34, 38, 43, 48, 53, 58, 64, 70, 76, 82];

type VanillaMagicSystemProps = {
  state: MagicSystemState;
  onChange: (next: MagicSystemState) => void;
};

const VanillaMagicSystem = ({ state, onChange }: VanillaMagicSystemProps) => {
  const { experience, name, setSteigerungspunkte } = useCharacter();
  const [elementValue, setElementValue] = useState("");
  const [customElement, setCustomElement] = useState("");
  const [magicTypeValue, setMagicTypeValue] = useState("");
  const [magicLevel, setMagicLevel] = useState(1);
  const [levelError, setLevelError] = useState("");

  const advancementPoints = experience.steigerungspunkte;
  const characterMagic = state.magicAbilities;

  useEffect(() => {
    if (state.advancementPoints !== advancementPoints) {
      onChange({ ...state, advancementPoints });
    }
  }, [advancementPoints, onChange, state]);

  const previewGroups = useMemo(() => {
    const groups = new Map<string, MagicAbility[]>();
    characterMagic.forEach((magic) => {
      const list = groups.get(magic.element) ?? [];
      list.push(magic);
      groups.set(magic.element, list);
    });
    return groups;
  }, [characterMagic]);

  const resolvedElement = elementValue === "custom" ? customElement.trim() : elementValue;
  const canAddMagic = resolvedElement && magicTypeValue && magicLevel >= 1 && magicLevel <= 21;
  const previewEntries: Array<[string, MagicAbility[]]> = Array.from(previewGroups.entries());

  const handleAddMagic = () => {
    if (!canAddMagic) {
      setLevelError("Bitte alle Felder ausfüllen (Level 1-21).");
      return;
    }
    setLevelError("");

    const nextMagic: MagicAbility = {
      element: resolvedElement,
      type: magicTypeValue,
      level: magicLevel,
    };

    onChange({
      ...state,
      magicAbilities: [...state.magicAbilities, nextMagic],
    });

    setElementValue("");
    setCustomElement("");
    setMagicTypeValue("");
    setMagicLevel(1);
  };

  const handleRemoveMagic = (index: number) => {
    const next = state.magicAbilities.filter((_, i) => i !== index);
    onChange({ ...state, magicAbilities: next });
  };

  const handleLevelUp = (index: number) => {
    const magic = state.magicAbilities[index];
    const cost = levelUpCosts[magic.level] ?? Infinity;
    if (cost === Infinity || advancementPoints < cost) {
      return;
    }

    const nextMagic = state.magicAbilities.map((item, i) =>
      i === index ? { ...item, level: item.level + 1 } : item
    );
    const nextPoints = advancementPoints - cost;

    onChange({ ...state, magicAbilities: nextMagic });
    setSteigerungspunkte(nextPoints);
  };

  const handleAddPoints = () => {
    const response = window.prompt("Wie viele Steigerungspunkte möchtest du hinzufügen?", "5");
    const value = Number.parseInt(response ?? "", 10);
    if (!Number.isNaN(value) && value > 0) {
      setSteigerungspunkte(advancementPoints + value);
    }
  };

  const addPointsDisabled = !Number.isFinite(advancementPoints);

  return (
    <div className="vanilla-magic-system">
      <div className="card">
        <div className="scroll-decoration scroll-left"></div>
        <div className="scroll-decoration scroll-right"></div>
        <h2>Magie-Charakterbogen</h2>

        <div className="info-box">
          <div className="info-box-title">Hinweis</div>
          <p>
            Füge mehrere Magie-Elemente und -Arten hinzu, um einen mächtigen Charakterbogen zu erstellen. Jedes Element
            kann mehrere Magiearten beherrschen!
          </p>
        </div>

        <div className="stats-box">
          <div className="stat-item">
            <span className="stat-label">Steigerungspunkte:</span>
            <span id="advancement-points" className="stat-value">
              {advancementPoints}
            </span>
          </div>
          <button type="button" className="btn btn-small" onClick={handleAddPoints} disabled={addPointsDisabled}>
            <i className="fas fa-plus-circle"></i> Punkte hinzufügen
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="characterName">Charaktername</label>
          <input type="text" id="characterName" placeholder="Gib deinen Charakternamen ein" value={name} readOnly />
        </div>

        <div className="magic-title">
          <i className="fas fa-magic"></i>
          <h2>Magieauswahl</h2>
          <i className="fas fa-magic"></i>
        </div>

        <div className="form-group">
          <label htmlFor="elementSelect">Magie-Element</label>
          <select
            id="elementSelect"
            value={elementValue}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setElementValue(event.target.value)}
          >
            <option value="">-- Element wählen --</option>
            {magicElements.map((element) => (
              <option key={element} value={element}>
                {element}
              </option>
            ))}
            <option value="custom">Eigenes Element eingeben</option>
          </select>

          {elementValue === "custom" ? (
            <div id="customElementContainer">
              <input
                type="text"
                id="customElement"
                placeholder="Eigenes Element eingeben"
                value={customElement}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomElement(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="magicTypeSelect">Magie-Art</label>
          <select
            id="magicTypeSelect"
            value={magicTypeValue}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setMagicTypeValue(event.target.value)}
          >
            <option value="">-- Magie-Art wählen --</option>
            {magicTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="magicLevel">Magie-Level (1-21)</label>
          <input
            type="number"
            id="magicLevel"
            min={1}
            max={21}
            value={magicLevel}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setMagicLevel(Number.parseInt(event.target.value, 10) || 1)}
          />
          {levelError ? <div className="error">{levelError}</div> : null}
        </div>

        <button type="button" id="addMagicBtn" className="btn" onClick={handleAddMagic}>
          <i className="fas fa-plus-circle"></i> Magie hinzufügen
        </button>

        <div id="magic-list" className="magic-list">
          {characterMagic.length === 0 ? (
            <p>Noch keine Magien hinzugefügt. Füge oben deine erste Magie hinzu!</p>
          ) : (
            characterMagic.map((magic, index) => {
              const nextLevelCost = magic.level < 21 ? levelUpCosts[magic.level] : null;
              const levelUpDisabled = nextLevelCost === null || nextLevelCost > advancementPoints || magic.level >= 21;

              return (
                <div key={`${magic.element}-${magic.type}-${index}`} className="added-magic">
                  <div className="magic-info">
                    <span className="magic-icon">{elementIcons[magic.element] ?? "✨"}</span>
                    <strong>{magic.element}</strong> -
                    <span className="magic-icon">{magicTypeIcons[magic.type] ?? "✨"}</span>
                    <span className="magic-type">{magic.type}</span>
                    <span>
                      Level <strong>{magic.level}</strong>
                    </span>
                    {nextLevelCost !== null ? (
                      <span className="tooltip">
                        <i>ℹ️</i>
                        <span className="tooltip-content">Nächstes Level: {nextLevelCost} Punkte</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="magic-controls">
                    <button
                      type="button"
                      className="btn btn-level-up"
                      disabled={levelUpDisabled}
                      onClick={() => handleLevelUp(index)}
                    >
                      ⬆️ Level
                    </button>
                    <button type="button" className="btn btn-remove" onClick={() => handleRemoveMagic(index)}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="card character-preview">
        <div className="scroll-decoration scroll-left"></div>
        <div className="scroll-decoration scroll-right"></div>
        <h3>Charaktervorschau</h3>
        <div id="previewContent">
          {characterMagic.length === 0 ? (
            <p>Füge Magien hinzu, um die Vorschau zu sehen.</p>
          ) : (
            <>
              <h2>{name || "Unbenannter Charakter"}</h2>
              <div className="character-stats">
                <div className="stat">
                  <span className="stat-label">Steigerungspunkte:</span>
                  <span className="stat-value">{advancementPoints}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Level:</span>
                  <span className="stat-value">{experience.level}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">XP:</span>
                  <span className="stat-value">{experience.xp}</span>
                </div>
              </div>
              {previewEntries.map(([element, magics]) => (
                <div key={element} className="element-group">
                  <h4>
                    {elementIcons[element] ?? "✨"} {element}
                  </h4>
                  <ul>
                    {magics.map((magic, index) => (
                      <li key={`${magic.type}-${index}`}>
                        {magicTypeIcons[magic.type] ?? "✨"} {magic.type} - Level {magic.level}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VanillaMagicSystem;
