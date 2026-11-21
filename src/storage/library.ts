import type { CharacterState } from "../domain";
import type { LegacyData } from "./characterJson";

const databaseName = "dsa3-character-library";
const charactersStore = "characters";
const metadataStore = "metadata";
const activeCharacterKey = "activeCharacterId";

export interface CharacterRecord {
  id: string;
  revision: number;
  updatedAt: number;
  character: CharacterState;
  legacy?: LegacyData;
}

export interface CharacterLibrary {
  list(): Promise<CharacterRecord[]>;
  get(id: string): Promise<CharacterRecord | undefined>;
  getActiveId(): Promise<string | undefined>;
  setActiveId(id?: string): Promise<void>;
  create(character: CharacterState, legacy?: LegacyData): Promise<CharacterRecord>;
  save(id: string, expectedRevision: number, character: CharacterState, legacy?: LegacyData): Promise<CharacterRecord>;
  delete(id: string, expectedRevision: number): Promise<void>;
  close(): void;
}

export class CharacterConflictError extends Error {
  constructor(public readonly reason: "changed" | "deleted") {
    super(reason === "changed"
      ? "Dieser Charakter wurde in einem anderen Tab geändert."
      : "Dieser Charakter wurde in einem anderen Tab gelöscht.");
    this.name = "CharacterConflictError";
  }
}

type SetResult<Result> = (result: Result) => void;
type AbortTransaction = (reason: Error) => void;

function transact<Result>(
  database: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode,
  operation: (transaction: IDBTransaction, setResult: SetResult<Result>, abort: AbortTransaction) => void,
): Promise<Result> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(stores, mode);
    let result: Result;
    let failure: Error | undefined;
    const abort: AbortTransaction = (reason) => {
      failure = reason;
      transaction.abort();
    };

    transaction.oncomplete = () => resolve(result);
    transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("Lokales Speichern wurde abgebrochen."));

    try {
      operation(transaction, (value) => { result = value; }, abort);
    } catch (error) {
      abort(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function readRecord(
  transaction: IDBTransaction,
  id: string,
  callback: (record: CharacterRecord | undefined) => void,
) {
  const request: IDBRequest<CharacterRecord | undefined> = transaction.objectStore(charactersStore).get(id);
  request.onsuccess = () => callback(request.result);
}

function requireRevision(
  record: CharacterRecord | undefined,
  expectedRevision: number,
  abort: AbortTransaction,
): CharacterRecord | undefined {
  if (!record) {
    abort(new CharacterConflictError("deleted"));
    return;
  }
  if (record.revision !== expectedRevision) {
    abort(new CharacterConflictError("changed"));
    return;
  }
  return record;
}

function libraryFor(database: IDBDatabase): CharacterLibrary {
  return {
    list() {
      return transact(database, [charactersStore], "readonly", (transaction, setResult) => {
        const request: IDBRequest<CharacterRecord[]> = transaction.objectStore(charactersStore).getAll();
        request.onsuccess = () => setResult(request.result.sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id)));
      });
    },
    get(id) {
      return transact(database, [charactersStore], "readonly", (transaction, setResult) => {
        readRecord(transaction, id, setResult);
      });
    },
    getActiveId() {
      return transact(database, [metadataStore], "readonly", (transaction, setResult) => {
        const request: IDBRequest<string | undefined> = transaction.objectStore(metadataStore).get(activeCharacterKey);
        request.onsuccess = () => setResult(request.result);
      });
    },
    setActiveId(id) {
      return transact(database, [charactersStore, metadataStore], "readwrite", (transaction, setResult, abort) => {
        const metadata = transaction.objectStore(metadataStore);
        setResult(undefined);
        if (id === undefined) {
          metadata.delete(activeCharacterKey);
          return;
        }
        readRecord(transaction, id, (record) => {
          if (!record) {
            abort(new CharacterConflictError("deleted"));
            return;
          }
          metadata.put(id, activeCharacterKey);
        });
      });
    },
    create(character, legacy) {
      return transact(database, [charactersStore, metadataStore], "readwrite", (transaction, setResult) => {
        const record: CharacterRecord = {
          id: globalThis.crypto.randomUUID(),
          revision: 1,
          updatedAt: Date.now(),
          character,
          legacy,
        };
        transaction.objectStore(charactersStore).add(record);
        transaction.objectStore(metadataStore).put(record.id, activeCharacterKey);
        setResult(record);
      });
    },
    save(id, expectedRevision, character, legacy) {
      return transact(database, [charactersStore], "readwrite", (transaction, setResult, abort) => {
        readRecord(transaction, id, (record) => {
          const current = requireRevision(record, expectedRevision, abort);
          if (!current) return;
          const next: CharacterRecord = {
            ...current,
            revision: current.revision + 1,
            updatedAt: Date.now(),
            character,
            legacy: legacy ?? current.legacy,
          };
          transaction.objectStore(charactersStore).put(next);
          setResult(next);
        });
      });
    },
    delete(id, expectedRevision) {
      return transact(database, [charactersStore, metadataStore], "readwrite", (transaction, setResult, abort) => {
        readRecord(transaction, id, (record) => {
          if (!requireRevision(record, expectedRevision, abort)) return;
          transaction.objectStore(charactersStore).delete(id);
          const metadata = transaction.objectStore(metadataStore);
          const request: IDBRequest<string | undefined> = metadata.get(activeCharacterKey);
          request.onsuccess = () => {
            if (request.result === id) {
              metadata.delete(activeCharacterKey);
            }
          };
          setResult(undefined);
        });
      });
    },
    close() {
      database.close();
    },
  };
}

export function openCharacterLibrary(factory = globalThis.indexedDB): Promise<CharacterLibrary> {
  return new Promise((resolve, reject) => {
    if (!factory) {
      reject(new Error("Der Browserspeicher ist nicht verfügbar."));
      return;
    }

    const request = factory.open(databaseName, 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      request.result.createObjectStore(charactersStore, { keyPath: "id" });
      request.result.createObjectStore(metadataStore);
    };
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Die lokale Charakterbibliothek ist durch einen anderen Tab blockiert."));
    };
    request.onerror = () => reject(request.error ?? new Error("Die lokale Charakterbibliothek konnte nicht geöffnet werden."));
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }
      database.onversionchange = () => database.close();
      resolve(libraryFor(database));
    };
  });
}
