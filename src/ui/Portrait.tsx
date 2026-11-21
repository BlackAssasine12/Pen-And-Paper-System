import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { isCharacterPortrait, portraitMaxBytes } from "../domain/portrait";
import type { PlayCharacterProps } from "./CharacterView";

export function Portrait({ character, onAction }: Pick<PlayCharacterProps, "character" | "onAction">) {
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const activeReader = useRef<FileReader | null>(null);

  useEffect(() => () => { activeReader.current?.abort(); }, []);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    activeReader.current?.abort();
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.size > portraitMaxBytes || !/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError("Wähle ein PNG-, JPEG- oder WebP-Bild bis 2 MB.");
      return;
    }
    setError("");

    const reader = new FileReader();
    activeReader.current = reader;
    reader.onerror = () => setError("Das Bild konnte nicht geöffnet werden.");
    reader.onload = () => {
      const value = reader.result;
      if (typeof value !== "string" || !isCharacterPortrait(value)) {
        setError("Die Datei enthält kein lesbares Bild im gewählten Format.");
        return;
      }
      onAction({ type: "set-portrait", value });
    };
    reader.onloadend = () => { if (activeReader.current === reader) activeReader.current = null; };
    reader.readAsDataURL(file);
  }

  return (
    <div className="portrait-row">
      {character.portrait && (
        <img src={character.portrait} alt="Charakterbild" className="character-portrait" />
      )}
      <div className="form-stack">
        <div className="button-row">
          <input ref={input} hidden aria-label="Bilddatei auswählen" type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" onChange={chooseFile} />
          <button className="button" type="button" onClick={() => input.current?.click()}>
            {character.portrait ? "Charakterbild ändern" : "Charakterbild hinzufügen"}
          </button>
          {character.portrait && (
            <button className="button button--quiet" type="button"
              onClick={() => {
                activeReader.current?.abort();
                setError("");
                onAction({ type: "set-portrait", value: undefined });
              }}>
              Charakterbild entfernen
            </button>
          )}
        </div>
        <small className="muted">PNG, JPEG oder WebP bis 2 MB</small>
        {error && <p className="feedback feedback--error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
