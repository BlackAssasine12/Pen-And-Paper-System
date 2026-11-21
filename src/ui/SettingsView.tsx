import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { previewBulkAdvancement } from "../domain";
import type { BulkMode } from "../domain";
import type { PlayCharacterProps } from "./CharacterView";
import { parseWholeNumber, StatList } from "./fields";

export type Appearance = {
  font: string;
  color: string;
};

export type AppearanceProps = {
  appearance: Appearance;
  onAppearanceChange: (next: Appearance) => void;
};

function AppearanceSettings({ appearance, onAppearanceChange }: AppearanceProps) {
  return (
    <section className="panel" aria-labelledby="appearance-heading">
      <h3 id="appearance-heading">Darstellung</h3>
      <label className="field">
        <span>Schriftart</span>
        <input
          value={appearance.font}
          placeholder="Standardschrift"
          maxLength={160}
          onChange={(event) => onAppearanceChange({ ...appearance, font: event.target.value })}
        />
      </label>
      <label className="field field--amount">
        <span>Textfarbe</span>
        <input type="color" value={appearance.color || "#291c16"}
          onChange={(event) => onAppearanceChange({ ...appearance, color: event.target.value })} />
      </label>
      <div>
        <button className="button" type="button" onClick={() => onAppearanceChange({ font: "", color: "" })}>
          Standarddarstellung wiederherstellen
        </button>
      </div>
    </section>
  );
}

function AdvancementSettings({ character, onAction }: Pick<PlayCharacterProps, "character" | "onAction">) {
  const [mode, setMode] = useState<BulkMode>();
  const [bonus, setBonus] = useState("");
  const [error, setError] = useState("");
  const preview = useMemo(() => mode === undefined ? undefined : previewBulkAdvancement(character, mode), [character, mode]);

  function awardPoints(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = parseWholeNumber(bonus);
    if (amount === undefined || amount < 1) {
      setError("Bitte eine positive Anzahl an Bonuspunkten eingeben.");
      return;
    }
    setError("");
    if (onAction({ type: "grant-points", amount })) setBonus("");
  }

  return (
    <section className="panel" aria-labelledby="advancement-settings-heading">
      <h3 id="advancement-settings-heading">Steigerungen</h3>
      <label className="check-field">
        <input
          type="checkbox"
          checked={character.freeAdvancement}
          onChange={(event) => onAction({ type: "set-free-advancement", value: event.target.checked })}
        />
        Kostenloses Steigern
      </label>
      <form className="inline-form" onSubmit={awardPoints}>
        <label className="field">
          <span>Bonus-Steigerungspunkte</span>
          <input inputMode="numeric" value={bonus} onChange={(event) => setBonus(event.target.value)} />
        </label>
        <button className="button" type="submit">Punkte hinzufügen</button>
      </form>
      {error && <p className="feedback feedback--error" role="alert">{error}</p>}

      <div className="form-stack">
        <div className="button-row">
          <button className="button" type="button" aria-pressed={mode === "min"} onClick={() => setMode("min")}>Minimum prüfen</button>
          <button className="button" type="button" aria-pressed={mode === "max"} onClick={() => setMode("max")}>Maximum prüfen</button>
        </div>
        {mode && preview && (
          <div className="form-stack" aria-label="Vorschau der Änderungen">
            <StatList entries={[
              ["Betroffene Werte", preview.changes],
              [preview.cost < 0 ? "SP-Rückerstattung" : "SP-Kosten", Math.abs(preview.cost)],
              ["Verfügbare SP danach", preview.availablePoints],
            ]} />
            {!preview.canApply && <p className="feedback feedback--error">Der aktuelle Punktestand reicht für diese Änderung nicht aus.</p>}
            <div className="button-row">
              <button
                className="button button--primary"
                type="button"
                disabled={!preview.canApply || preview.changes === 0}
                onClick={() => { if (onAction({ type: "bulk-advance", mode })) setMode(undefined); }}
              >
                Änderung anwenden
              </button>
              <button className="button button--quiet" type="button" onClick={() => setMode(undefined)}>Abbrechen</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function SettingsView(props: PlayCharacterProps & AppearanceProps) {
  return (
    <section className="play-view" aria-labelledby="settings-heading">
      <h2 id="settings-heading">Einstellungen</h2>
      <div className="play-grid">
        <AdvancementSettings character={props.character} onAction={props.onAction} />
        <AppearanceSettings appearance={props.appearance} onAppearanceChange={props.onAppearanceChange} />
      </div>
    </section>
  );
}
