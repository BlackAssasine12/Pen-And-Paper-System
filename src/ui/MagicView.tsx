import { useState } from "react";
import type { FormEvent } from "react";
import { getMagicUpgradeCost, magicElements, magicRequirements, magicTypes } from "../domain";
import type { PlayCharacterProps } from "./CharacterView";
import { formatNumber, parseWholeNumber, StatList } from "./fields";
import { SpellNotes } from "./Writing";

export type MagicViewProps = PlayCharacterProps & {
  onMagicImport?: () => void;
  onMagicExport?: () => void;
};

function prerequisites(element: string): string | undefined {
  return magicRequirements[element as (typeof magicElements)[number]];
}

export function MagicView({ character, derived, onAction, onMagicImport, onMagicExport }: MagicViewProps) {
  const [element, setElement] = useState("");
  const [customElement, setCustomElement] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("1");
  const [error, setError] = useState("");
  const elementName = element === "custom" ? customElement.trim() : element;
  const requirements = prerequisites(elementName);

  function addMagic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredLevel = parseWholeNumber(level);
    if (!elementName || !type || enteredLevel === undefined || enteredLevel < 1 || enteredLevel > 21) {
      setError("Bitte Element und Magie-Art wählen und ein Level zwischen 1 und 21 eingeben.");
      return;
    }
    setError("");
    if (onAction({
      type: "add-magic",
      ability: { id: crypto.randomUUID(), element: elementName, type, level: enteredLevel },
    })) {
      setElement("");
      setCustomElement("");
      setType("");
      setLevel("1");
    }
  }

  return (
    <section className="play-view" aria-labelledby="magic-heading">
      <div className="play-view__heading">
        <h2 id="magic-heading">Magie</h2>
        {(onMagicImport || onMagicExport) && (
          <div className="button-row">
            {onMagicImport && <button className="button" type="button" onClick={onMagicImport}>Magie-JSON importieren</button>}
            {onMagicExport && <button className="button" type="button" onClick={onMagicExport}>Magie-JSON exportieren</button>}
          </div>
        )}
      </div>
      <div className="play-grid">
        <section className="panel" aria-labelledby="magic-add-heading">
          <h3 id="magic-add-heading">Magie hinzufügen</h3>
          <form className="form-stack" onSubmit={addMagic}>
            <div className="form-grid">
              <label className="field">
                <span>Magie-Element</span>
                <select value={element} onChange={(event) => setElement(event.target.value)}>
                  <option value="">Bitte wählen</option>
                  {magicElements.map((item) => <option key={item}>{item}</option>)}
                  <option value="custom">Eigenes Element</option>
                </select>
              </label>
              {element === "custom" && (
                <label className="field">
                  <span>Eigenes Magie-Element</span>
                  <input value={customElement} onChange={(event) => setCustomElement(event.target.value)} />
                </label>
              )}
              <label className="field">
                <span>Magie-Art</span>
                <select value={type} onChange={(event) => setType(event.target.value)}>
                  <option value="">Bitte wählen</option>
                  {magicTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Magie-Level</span>
                <input inputMode="numeric" value={level} onChange={(event) => setLevel(event.target.value)} />
              </label>
            </div>
            <p className="muted fine-print">Anlegen kostet 0 SP. Magie-Level 1 bis 21.</p>
            {requirements && <p className="muted fine-print">Zur Kombination gehören laut Hausregeln {requirements}.</p>}
            <div><button className="button button--primary" type="submit">Magie hinzufügen</button></div>
            {error && <p role="alert" className="feedback feedback--error">{error}</p>}
          </form>
        </section>
        <section className="panel panel--ink" aria-labelledby="magic-preview-heading">
          <h3 id="magic-preview-heading">{character.profile.name || "Magiewerte"}</h3>
          <StatList entries={[
            ["Magiebegabung", derived.magiebegabung],
            ["Maximale Astralenergie", derived.maxAstralenergie],
            ["Verfügbare Steigerungspunkte", derived.availablePoints],
          ]} />
        </section>
        <section className="panel panel--wide" aria-labelledby="magic-list-heading">
          <h3 id="magic-list-heading">Gelernte Magie</h3>
          {character.magic.length === 0 && <p className="muted">Dein Charakter hat noch keine Magie eingetragen.</p>}
          <div>
            {character.magic.map((ability) => {
              const shownCost = getMagicUpgradeCost(ability.level, character.freeAdvancement);
              return (
                <div className="item-row" key={ability.id}>
                  <div>
                    <span className="item-row__name">{ability.element} · {ability.type}</span>
                    <span className="fine-print">Level {ability.level}</span>
                    <p className="muted fine-print">{shownCost === undefined ? "Höchstlevel erreicht" : `Nächstes Level für ${formatNumber(shownCost)} SP`}</p>
                  </div>
                  <div className="item-row__actions">
                    <button
                      className="button button--primary"
                      type="button"
                      aria-label={`${ability.element} ${ability.type} steigern`}
                      disabled={shownCost === undefined || (shownCost > 0 && shownCost > derived.availablePoints)}
                      onClick={() => onAction({ type: "upgrade-magic", id: ability.id })}
                    >
                      Steigern
                    </button>
                    <button
                      className="button button--danger"
                      type="button"
                      aria-label={`${ability.element} ${ability.type} entfernen`}
                      onClick={() => onAction({ type: "remove-magic", id: ability.id })}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <SpellNotes character={character} onAction={onAction} />
      </div>
    </section>
  );
}
