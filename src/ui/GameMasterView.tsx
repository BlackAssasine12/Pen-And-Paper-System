import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { attributeIds, createCharacterSelectors } from "../domain";
import type { CharacterState } from "../domain";
import { parseCharacterJson } from "../storage/characterJson";
import { StatList } from "./fields";

interface SharedSheet {
  id: string;
  fileName: string;
  character: CharacterState;
  derived: ReturnType<ReturnType<typeof createCharacterSelectors>>;
  warnings: string[];
}

function SharedCharacter({ sheet }: { sheet: SharedSheet }) {
  const { character, derived, fileName, warnings } = sheet;
  return (
    <article className="panel shared-sheet">
      <h3>{character.profile.name || "Unbenannter Charakter"}</h3>
      <p className="muted">{[character.profile.rasse, character.profile.klasse, fileName].filter(Boolean).join(" · ")}</p>
      {warnings.length > 0 && <ul className="muted">{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
      <StatList entries={[
        ["Stufe", derived.level],
        ["LP", character.resources.lp + " / " + derived.lpMax],
        ["Ausdauer", character.resources.endurance + " / " + derived.ausdauerMax],
        ["ASP", character.resources.asp + " / " + derived.maxAstralenergie],
        ["Magiebegabung", derived.magiebegabung],
        ["Magieresistenz", derived.magieresistenz],
      ]} />
      <details>
        <summary>Attribute und Talente</summary>
        <StatList entries={attributeIds.filter((id) => !character.hidden.attributes.includes(id)).map((id) => [id, character.attributes[id]] as const)} />
        <ul>
          {character.talents.filter(({ id }) => !character.hidden.talents.includes(id)).map((talent) => (
            <li key={talent.id}>{talent.name} · {talent.value}{talent.attributes && " (" + talent.attributes + ")"}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Kampf und Magie</summary>
        <ul>
          {character.combatTalents.map((talent) => (
            <li key={talent.id}>{talent.name} · AT {talent.attack} · PA {talent.parry} · Skillwert {talent.value}</li>
          ))}
          {character.magic.map((ability) => <li key={ability.id}>{ability.element} · {ability.type} · Stufe {ability.level}</li>)}
        </ul>
      </details>
    </article>
  );
}

export function GameMasterView({ onExport }: { onExport?: () => void }) {
  const [sheets, setSheets] = useState<SharedSheet[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const request = useRef(0);

  async function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length === 0) return;
    const currentRequest = ++request.current;
    const loaded: SharedSheet[] = [];
    const failed: string[] = [];
    for (const file of files) {
      try {
        const parsed = parseCharacterJson(await file.text());
        if (parsed.kind !== "character") throw new Error("Für die Spielleitungsansicht ist eine vollständige Charakterdatei nötig.");
        loaded.push({
          id: crypto.randomUUID(), fileName: file.name, character: parsed.character,
          derived: createCharacterSelectors()(parsed.character), warnings: parsed.warnings,
        });
      } catch (error) {
        failed.push(file.name + " · " + (error instanceof Error ? error.message : "Datei konnte nicht gelesen werden."));
      }
    }
    if (currentRequest !== request.current) return;
    setErrors(failed);
    if (loaded.length > 0) setSheets(loaded);
  }

  return (
    <section className="play-view" aria-labelledby="game-master-heading">
      <h2 id="game-master-heading">Spielleitung</h2>
      <div className="panel">
        <p>Öffne die von deiner Gruppe geteilten JSON-Bögen. Die Ansicht ist schreibgeschützt und gilt für diesen Tab. Lade für einen neuen Spielstand die aktuellen Dateien.</p>
        <div className="button-row">
          <input ref={picker} type="file" hidden multiple aria-label="Geteilte Dateien auswählen"
            accept=".json,application/json" onChange={chooseFiles} />
          <button type="button" className="button button--primary" onClick={() => picker.current?.click()}>
            {sheets.length ? "Geteilte Bögen neu auswählen" : "Geteilte Bögen öffnen"}
          </button>
          {onExport && <button type="button" className="button" onClick={onExport}>Spielwerte exportieren</button>}
          {sheets.length > 0 && (
            <button type="button" className="button button--quiet" onClick={() => {
              request.current += 1;
              setSheets([]);
              setErrors([]);
            }}>Ansicht leeren</button>
          )}
        </div>
        {onExport && <p className="muted">Der Spielwerte-Export enthält den geöffneten Bogen ohne persönliche Notizen, Zaubertexte, Charakterbild und archivierte Zusatzfelder.</p>}
        {errors.length > 0 && <ul role="alert" className="feedback feedback--error">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
      </div>
      {sheets.length > 0 && (
        <div className="play-grid">{sheets.map((sheet) => <SharedCharacter key={sheet.id} sheet={sheet} />)}</div>
      )}
    </section>
  );
}
