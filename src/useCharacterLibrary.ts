import { useEffect, useRef, useState } from "react";
import {
  applyCharacterAction,
  createCharacter,
  type DerivedValues,
  type CharacterAction,
  type CharacterState,
} from "./domain";
import {
  CharacterConflictError,
  openCharacterLibrary,
  type CharacterLibrary,
  type CharacterRecord,
} from "./storage/library";
import type { LegacyData } from "./storage/characterJson";

type SaveState = "saved" | "saving" | "unsaved" | "conflict";

interface Draft {
  record: CharacterRecord;
  character: CharacterState;
}

interface LibraryView {
  ready: boolean;
  records: CharacterRecord[];
  active?: Draft;
  saveState: SaveState;
  busy: boolean;
  error: string;
}

const initialView: LibraryView = {
  ready: false,
  records: [],
  saveState: "saved",
  busy: false,
  error: "",
};

export function useCharacterLibrary(selectDerived: (state: CharacterState) => DerivedValues) {
  const [view, setView] = useState(initialView);
  const latest = useRef(initialView);
  const repository = useRef<CharacterLibrary | null>(null);
  const activeWrite = useRef<Promise<boolean> | null>(null);

  function update(changes: Partial<LibraryView>) {
    latest.current = { ...latest.current, ...changes };
    setView(latest.current);
  }

  useEffect(() => {
    let cancelled = false;
    let opened: CharacterLibrary | undefined;
    void (async () => {
      try {
        opened = await openCharacterLibrary();
        const [records, activeId] = await Promise.all([opened.list(), opened.getActiveId()]);
        if (cancelled) return;

        repository.current = opened;
        const record = records.find((entry) => entry.id === activeId);
        update({
          ready: true,
          records,
          active: record && { record, character: record.character },
        });
      } catch {
        opened?.close();
        if (!cancelled) {
          update({
            ready: true,
            error: "Der Browserspeicher konnte nicht geöffnet werden. Du kannst spielen und deinen Stand als JSON sichern.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      opened?.close();
    };
  }, []);

  useEffect(() => {
    if (!view.active || view.saveState === "saved") return;
    const warnOnClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warnOnClose);
    return () => window.removeEventListener("beforeunload", warnOnClose);
  }, [view.active, view.saveState]);

  function replaceRecord(record: CharacterRecord) {
    const others = latest.current.records.filter((entry) => entry.id !== record.id);
    return [record, ...others];
  }

  function saveDraft(): Promise<boolean> {
    if (activeWrite.current) return activeWrite.current;
    const db = repository.current;
    if (!db) return Promise.resolve(false);

    const save = async () => {
      try {
        let draft = latest.current.active;
        while (draft && draft.record.character !== draft.character) {
          const { record, character } = draft;
          update({ saveState: "saving" });
          const saved = await db.save(record.id, record.revision, character);
          draft = latest.current.active;
          if (draft?.record.id !== saved.id) return true;

          update({
            active: { record: saved, character: draft.character },
            records: replaceRecord(saved),
          });
          draft = latest.current.active;
        }
        update({ saveState: "saved" });
        return true;
      } catch (error) {
        if (error instanceof CharacterConflictError) {
          update({
            saveState: "conflict",
            error: "Dieser Charakter wurde in einem anderen Tab geändert. Du kannst deinen Stand als Kopie sichern.",
          });
        } else {
          update({
            saveState: "unsaved",
            error: "Dein aktueller Stand konnte nicht gespeichert werden. Versuche es erneut oder exportiere ihn als JSON.",
          });
        }
        return false;
      }
    };

    activeWrite.current = save().finally(() => {
      activeWrite.current = null;
    });
    return activeWrite.current;
  }

  function apply(action: CharacterAction) {
    const { active, busy } = latest.current;
    if (!active || busy) return false;

    const result = applyCharacterAction(active.character, action, selectDerived);
    if (result.error) {
      update({ error: result.error });
      return false;
    }
    if (result.state === active.character) {
      if (latest.current.saveState === "saved") update({ error: "" });
      return true;
    }

    const conflict = latest.current.saveState === "conflict";
    update({
      active: { ...active, character: result.state },
      saveState: conflict ? "conflict" : repository.current ? "saving" : "unsaved",
      error: conflict ? latest.current.error : "",
    });
    if (!conflict) void saveDraft();
    return true;
  }

  async function run(operation: () => Promise<boolean>, message: string) {
    if (!latest.current.ready || latest.current.busy) return false;
    update({ busy: true });
    try {
      return await operation();
    } catch (error) {
      update({
        error: error instanceof CharacterConflictError
          ? "Dieser Charakter wurde in einem anderen Tab geändert. Öffne die Charakterliste erneut."
          : message,
      });
      return false;
    } finally {
      update({ busy: false });
    }
  }

  async function finishCurrent() {
    const { active, saveState } = latest.current;
    if (!active || saveState === "saved") return true;
    if (saveState === "conflict") return false;
    return saveDraft();
  }

  function activate(record: CharacterRecord, saved: boolean) {
    update({
      active: { record, character: record.character },
      saveState: saved ? "saved" : "unsaved",
      records: saved ? replaceRecord(record) : latest.current.records,
      error: saved ? "" : "Der Charakter ist nur im aktuellen Tab verfügbar. Sichern kannst du ihn als JSON.",
    });
  }

  function create(character = createCharacter(), legacy?: LegacyData) {
    return run(async () => {
      if (!(await finishCurrent())) {
        if (!repository.current) {
          update({ error: "Sichere deinen aktuellen Stand vor dem Wechsel als JSON." });
        }
        return false;
      }
      const db = repository.current;
      if (db) {
        activate(await db.create(character, legacy), true);
      } else {
        activate({ id: crypto.randomUUID(), revision: 0, updatedAt: Date.now(), character, legacy }, false);
      }
      return true;
    }, "Der Charakter konnte nicht angelegt werden.");
  }

  function open(id: string) {
    return run(async () => {
      if (!(await finishCurrent())) return false;
      const db = repository.current;
      if (!db) return false;
      const record = await db.get(id);
      if (!record) {
        update({
          records: latest.current.records.filter((entry) => entry.id !== id),
          error: "Der Charakter ist in diesem Browser nicht mehr vorhanden.",
        });
        return false;
      }
      await db.setActiveId(id);
      activate(record, true);
      return true;
    }, "Der Charakter konnte nicht geöffnet werden.");
  }

  function refresh() {
    const db = repository.current;
    return db && run(async () => {
      update({ records: await db.list() });
      return true;
    }, "Die Charakterliste konnte nicht gelesen werden.");
  }

  function remove(record: CharacterRecord) {
    return run(async () => {
      if (!(await finishCurrent())) return false;
      const db = repository.current;
      if (!db) return false;
      const current = latest.current.records.find((entry) => entry.id === record.id);
      await db.delete(record.id, current?.revision ?? record.revision);
      update({
        records: latest.current.records.filter((entry) => entry.id !== record.id),
        active: latest.current.active?.record.id === record.id ? undefined : latest.current.active,
        error: "",
      });
      return true;
    }, "Der Charakter konnte nicht gelöscht werden.");
  }

  function saveAsCopy() {
    return run(async () => {
      const draft = latest.current.active;
      if (!draft) return false;
      const db = repository.current ?? await openCharacterLibrary();
      try {
        const record = await db.create(draft.character, draft.record.legacy);
        repository.current = db;
        activate(record, true);
        return true;
      } catch (error) {
        if (!repository.current) db.close();
        throw error;
      }
    }, "Die Kopie konnte nicht gespeichert werden. Sichere deinen Stand als JSON.");
  }

  function replaceMagic(magic: CharacterState["magic"]) {
    const { active, busy, saveState } = latest.current;
    if (!active || busy || saveState === "conflict") return false;
    update({
      active: { ...active, character: { ...active.character, magic } },
      saveState: repository.current ? "saving" : "unsaved",
      error: "",
    });
    void saveDraft();
    return true;
  }

  function retry() {
    if (!repository.current) return saveAsCopy();
    update({ error: "" });
    return saveDraft();
  }

  return { view, apply, create, open, refresh, remove, saveAsCopy, replaceMagic, retry };
}
