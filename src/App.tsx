import { useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { createCharacter, createCharacterSelectors } from "./domain";
import {
  parseCharacterJson,
  serializeCharacterJson,
  serializeMagicJson,
} from "./storage/characterJson";
import type { CharacterRecord } from "./storage/library";
import PlayView from "./ui/PlayView";
import { useCharacterLibrary } from "./useCharacterLibrary";
import "./shell.css";

const navigation = [
  ["bogen", "Bogen"],
  ["magie", "Magie"],
  ["inventar", "Inventar & Shop"],
  ["werkzeuge", "Werkzeuge"],
  ["einstellungen", "Einstellungen"],
] as const;

type PlaySection = typeof navigation[number][0];
type PendingImport = ReturnType<typeof parseCharacterJson> & { filename: string };

const emptyAppearance = { font: "", color: "" };
const appearanceKey = "dsa3-appearance-v1";
const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });

function readAppearance() {
  try {
    const raw = localStorage.getItem(appearanceKey);
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>;
      if (typeof saved.font === "string" && typeof saved.color === "string") {
        return {
          font: saved.font,
          color: /^#[a-f\d]{6}$/i.test(saved.color) ? saved.color : "",
        };
      }
    }
  } catch {
    return emptyAppearance;
  }
  return emptyAppearance;
}

function downloadJson(name: string, content: string, tail: string) {
  const base = (name.trim() || "Charakter").replace(/[<>:"/\\|?*\x00-\x1f]/g, "-");
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const url = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = [base, stamp, tail].filter(Boolean).join("_") + ".json";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function displayName(record: CharacterRecord) {
  return record.character.profile.name.trim() || "Unbenannter Charakter";
}

export default function App() {
  const derive = useMemo(createCharacterSelectors, []);
  const { view, apply, create, open, refresh, remove, saveAsCopy, replaceMagic, retry } = useCharacterLibrary(derive);
  const [section, setSection] = useState<PlaySection>("bogen");
  const [showLibrary, setShowLibrary] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState<PendingImport>();
  const [deletion, setDeletion] = useState<CharacterRecord>();
  const [message, setMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [appearance, setAppearance] = useState(readAppearance);
  const fileInput = useRef<HTMLInputElement>(null);
  const latestImport = useRef(0);
  const character = view.active?.character;
  const derived = character ? derive(character) : undefined;
  const libraryVisible = showLibrary || !character;
  const layoutStyle: CSSProperties & { "--app-font"?: string; "--app-user-color"?: string } = {
    ...(appearance.font && { "--app-font": appearance.font }),
    ...(appearance.color && { "--app-user-color": appearance.color }),
  };

  function openPlay() {
    setShowLibrary(false);
    setSection("bogen");
  }

  function selectFile() {
    fileInput.current?.click();
  }

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const request = ++latestImport.current;
    setFileError("");
    setMessage("");
    setPending(undefined);
    try {
      const imported = parseCharacterJson(await file.text());
      if (request === latestImport.current) setPending({ ...imported, filename: file.name });
    } catch (error) {
      if (request !== latestImport.current) return;
      setFileError(error instanceof Error ? error.message : "Die Datei konnte nicht gelesen werden.");
    }
  }

  async function confirmImport() {
    if (!pending) return;
    if (await create(pending.character, pending.legacy)) {
      setPending(undefined);
      setMessage("Der Charakter wurde aus der JSON-Datei übernommen.");
      openPlay();
    }
  }

  function confirmMagic() {
    if (pending?.kind !== "magic" || !replaceMagic(pending.character.magic)) return;
    setPending(undefined);
    setSection("magie");
    setShowLibrary(false);
    setMessage("Die Magie des geöffneten Charakters wurde übernommen.");
  }

  function exportFile(magic = false) {
    if (!view.active) return;
    const draft = view.active;
    const file = magic
      ? serializeMagicJson(draft.character, derived)
      : serializeCharacterJson(draft.character, draft.record.legacy, derived);
    downloadJson(draft.character.profile.name, file, magic ? "magie" : "");
  }

  function changeAppearance(next: typeof emptyAppearance) {
    setAppearance(next);
    try {
      localStorage.setItem(appearanceKey, JSON.stringify(next));
    } catch {
      setMessage("Die Darstellung kann im aktuellen Tab geändert werden.");
    }
  }

  const statusText = view.saveState === "saving"
    ? "Wird lokal gespeichert …"
    : view.saveState === "saved"
      ? "Lokal gespeichert"
      : view.saveState === "conflict"
        ? "Konflikt beim Speichern"
        : "Ungesicherte Änderungen";

  return (
    <div className="app-shell" style={layoutStyle}>
      <a className="skip-link" href="#inhalt">Zum Inhalt springen</a>
      <header className="app-header">
        <div className="app-header__identity">
          <p className="app-brand">Blacks Pen &amp; Paper</p>
          <h1>{character?.profile.name.trim() || "Charakterbogen"}</h1>
          {derived && (
            <p className="app-character-summary">
              Stufe {derived.level} · {derived.availablePoints} Steigerungspunkte
            </p>
          )}
        </div>
        <div className="app-header__actions">
          <button
            className="button"
            type="button"
            onClick={() => {
              if (!libraryVisible) void refresh();
              setShowLibrary(!libraryVisible);
              setMessage("");
            }}
            disabled={!view.ready || !character}
            aria-expanded={libraryVisible}
          >
            {libraryVisible && character ? "Zum Spielbogen" : "Charakterliste"}
          </button>
          <button className="button" type="button" onClick={selectFile} disabled={!view.ready || view.busy}>
            JSON importieren
          </button>
          <button className="button" type="button" onClick={() => exportFile()} disabled={!character}>
            JSON exportieren
          </button>
          <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={readFile} aria-label="JSON-Datei auswählen" />
        </div>
        {character && <p className="app-save-status" role="status">{statusText}</p>}
      </header>

      {character && !libraryVisible && (
        <nav className="app-nav" aria-label="Spielbereiche">
          {navigation.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="button"
              aria-current={id === section ? "page" : undefined}
              onClick={() => {
                setSection(id);
                setMessage("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <main id="inhalt" className="app-main">
        {view.error && (
          <div className="feedback shell-feedback" role="alert">
            <p>{view.error}</p>
            {character && view.saveState === "conflict" && (
              <button type="button" className="button" disabled={view.busy} onClick={() => void saveAsCopy()}>
                Stand als Kopie sichern
              </button>
            )}
            {character && view.saveState === "unsaved" && (
              <button type="button" className="button" disabled={view.busy} onClick={() => void retry()}>
                Speicherung erneut versuchen
              </button>
            )}
          </div>
        )}
        {fileError && <p className="feedback shell-feedback" role="alert">{fileError}</p>}
        {message && <p className="feedback shell-feedback" role="status">{message}</p>}

        {pending && (
          <section className="panel import-preview" aria-labelledby="import-title">
            <h2 id="import-title">JSON-Import prüfen</h2>
            <p><strong>{pending.filename}</strong> · {pending.kind === "magic" ? "Magiedatei" : "Charakterdatei"}</p>
            <p>{pending.character.profile.name.trim() || "Unbenannter Charakter"}</p>
            {pending.warnings.length > 0 && (
              <ul className="import-warnings">
                {pending.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            )}
            <div className="shell-actions">
              <button type="button" className="button button--primary" onClick={() => void confirmImport()} disabled={view.busy}>
                Als neuen Charakter importieren
              </button>
              {pending.kind === "magic" && character && (
                <button type="button" className="button" onClick={confirmMagic} disabled={view.busy || view.saveState === "conflict"}>
                  Magie im geöffneten Bogen ersetzen
                </button>
              )}
              <button type="button" className="button" onClick={() => setPending(undefined)}>Abbrechen</button>
            </div>
          </section>
        )}

        {!view.ready && <p role="status">Charakterliste wird geladen …</p>}
        {view.ready && libraryVisible && (
          <section className="panel library-panel" aria-labelledby="library-title">
            <h2 id="library-title">Charakterliste</h2>
            <p>Deine Charaktere werden in diesem Browser gespeichert. Exportiere eine JSON-Datei, um einen Stand zu sichern oder das Gerät zu wechseln.</p>
            <form
              className="character-create"
              onSubmit={async (event) => {
                event.preventDefault();
                const draft = createCharacter();
                const initial = { ...draft, profile: { ...draft.profile, name: newName.trim() } };
                if (await create(initial)) {
                  setNewName("");
                  openPlay();
                }
              }}
            >
              <label>
                Name des neuen Charakters
                <input name="character-name" value={newName} onChange={(event) => setNewName(event.target.value)} />
              </label>
              <button type="submit" className="button button--primary" disabled={view.busy}>Charakter anlegen</button>
            </form>
            <div className="library-grid">
              {view.records.map((record) => (
                <article key={record.id} className="character-card">
                  <h3>{displayName(record)}</h3>
                  <p className="muted">Zuletzt geändert {dateFormat.format(record.updatedAt)}</p>
                  <div className="shell-actions">
                    <button
                      className="button"
                      type="button"
                      aria-label={displayName(record) + " öffnen"}
                      disabled={view.busy}
                      onClick={async () => {
                        if (await open(record.id)) openPlay();
                      }}
                    >
                      Öffnen
                    </button>
                    <button
                      className="button"
                      type="button"
                      aria-label={displayName(record) + " löschen"}
                      disabled={view.busy}
                      onClick={() => setDeletion(record)}
                    >
                      Löschen
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {deletion && (
              <div className="feedback shell-feedback" role="alert">
                <p>{displayName(deletion)} aus diesem Browser löschen?</p>
                <div className="shell-actions">
                  <button className="button" type="button" onClick={() => setDeletion(undefined)}>Abbrechen</button>
                  <button
                    className="button"
                    type="button"
                    disabled={view.busy}
                    onClick={async () => {
                      if (await remove(deletion)) setDeletion(undefined);
                    }}
                  >
                    Charakter endgültig löschen
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {!libraryVisible && character && derived && (
          <PlayView
            key={view.active?.record.id}
            view={section}
            character={character}
            derived={derived}
            onAction={apply}
            appearance={appearance}
            onAppearanceChange={changeAppearance}
            onMagicImport={selectFile}
            onMagicExport={() => exportFile(true)}
          />
        )}
      </main>
    </div>
  );
}
