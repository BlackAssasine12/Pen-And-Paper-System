import { useState } from "react";
import type { FormEvent } from "react";
import type { SpellNote } from "../domain";
import type { PlayCharacterProps } from "./CharacterView";
import { ConfirmButton } from "./fields";

type WritingProps = Pick<PlayCharacterProps, "character" | "onAction">;

export function CharacterNotes({ character, onAction }: WritingProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const current = character.writing?.notes ?? "";

  function save() {
    if (draft !== null && onAction({ type: "set-notes", value: draft })) setDraft(null);
  }

  return (
    <div className="form-stack">
      <label className="field">
        <span>Persönliche Notizen</span>
        <textarea rows={5} value={draft ?? current} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div><button className="button" type="button" disabled={draft === null || draft === current}
        onClick={save}>Notizen speichern</button></div>
    </div>
  );
}

const emptySpell = { id: "", name: "", text: "", magicId: undefined };

export function SpellNotes({ character, onAction }: WritingProps) {
  const [draft, setDraft] = useState<SpellNote>();
  const spells = character.writing?.spells ?? [];
  const abilityName = (magicId: string) => {
    const entry = character.magic.find(({ id }) => id === magicId);
    return entry ? entry.element + " · " + entry.type : "Magieeintrag fehlt";
  };

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft && onAction({ type: "save-spell-note", spell: { ...draft, id: draft.id || crypto.randomUUID() } })) {
      setDraft(undefined);
    }
  }

  return (
    <section className="panel panel--wide" aria-labelledby="spell-notes-heading">
      <h3 id="spell-notes-heading">Eigene Zauberbeschreibungen</h3>
      {spells.map((spell) => (
        <article className="journal-entry" key={spell.id}>
          <h4>{spell.name}</h4>
          {spell.magicId && <p className="muted">{abilityName(spell.magicId)}</p>}
          <p className="journal-text">{spell.text}</p>
          <div className="button-row">
            <button type="button" className="button" onClick={() => setDraft(spell)} aria-label={spell.name + " bearbeiten"}>Bearbeiten</button>
            <ConfirmButton label={spell.name + " löschen"} prompt="Zauberbeschreibung löschen?" confirmLabel="Beschreibung löschen"
              onConfirm={() => {
                if (draft?.id === spell.id) setDraft(undefined);
                return onAction({ type: "remove-spell-note", id: spell.id });
              }} />
          </div>
        </article>
      ))}
      {!draft && <div><button className="button" type="button" onClick={() => setDraft(emptySpell)}>Zauberbeschreibung anlegen</button></div>}
      {draft && (
        <form className="form-stack" onSubmit={save}>
          <label className="field">
            <span>Zaubername</span>
            <input value={draft.name} required onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="field">
            <span>Magieeintrag (optional)</span>
            <select value={draft.magicId ?? ""} onChange={(event) => setDraft({ ...draft, magicId: event.target.value || undefined })}>
              <option value="">Ohne Verknüpfung</option>
              {draft.magicId && !character.magic.some(({ id }) => id === draft.magicId) && (
                <option value={draft.magicId}>Magieeintrag fehlt</option>
              )}
              {character.magic.map((entry) => (
                <option value={entry.id} key={entry.id}>{abilityName(entry.id)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Beschreibung</span>
            <textarea rows={4} required value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} />
          </label>
          <div className="button-row">
            <button className="button button--primary" type="submit">Beschreibung speichern</button>
            <button className="button" type="button" onClick={() => setDraft(undefined)}>Abbrechen</button>
          </div>
        </form>
      )}
    </section>
  );
}
