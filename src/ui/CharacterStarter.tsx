import { useMemo, useState } from "react";
import { classGroups } from "../domain";
import type { CharacterState } from "../domain";
import { starterFocuses, suggestStarter } from "../domain/starter";
import type { StarterFocus } from "../domain/starter";
import { StatList } from "./fields";

export function CharacterStarter({ name, disabled, onCreate }: {
  name: string;
  disabled: boolean;
  onCreate: (character: CharacterState) => Promise<void>;
}) {
  const [klasse, setKlasse] = useState("");
  const [focus, setFocus] = useState<StarterFocus>("kampf");
  const preview = useMemo(() => suggestStarter(klasse, focus), [klasse, focus]);

  return (
    <details className="starter-details">
      <summary>Erstellungsassistent</summary>
      <p>Wähle eine Klasse und einen Schwerpunkt für einen Startvorschlag nach den Hausregeln.</p>
      <div className="form-grid">
        <label className="field">
          <span>Startklasse</span>
          <select value={klasse} onChange={(event) => setKlasse(event.target.value)}>
            <option value="">Ohne Klassentarif</option>
            {Object.entries(classGroups).map(([group, members]) => (
              <optgroup key={group} label={group}>
                {members.map((member) => <option key={member}>{member}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Schwerpunkt</span>
          <select value={focus} onChange={(event) => setFocus(event.target.value as StarterFocus)}>
            {Object.entries(starterFocuses).map(([id, entry]) => <option key={id} value={id}>{entry.label}</option>)}
          </select>
        </label>
      </div>
      {preview ? (
        <div className="form-stack">
          <ul>{preview.changes.map((change) => <li key={change}>{change}</li>)}</ul>
          <StatList entries={[["Kosten in SP", preview.pointsSpent], ["Verbleibende SP", preview.pointsLeft]]} />
          <div>
            <button type="button" className="button button--primary" disabled={disabled} onClick={() => void onCreate({
              ...preview.character, profile: { ...preview.character.profile, name: name.trim() },
            })}>
              Charakter mit Vorschlag anlegen
            </button>
          </div>
        </div>
      ) : <p className="feedback feedback--error" role="alert">Für diese Auswahl steht kein gültiger Vorschlag zur Verfügung.</p>}
    </details>
  );
}
