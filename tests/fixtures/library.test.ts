import { IDBFactory } from "fake-indexeddb";
import { expect, it } from "vitest";
import { createCharacter } from "../../src/domain";
import { openCharacterLibrary } from "../../src/storage/library";

const characterNamed = (name: string) => {
  const character = createCharacter();
  character.profile.name = name;
  return character;
};

it("speichert mehrere Charaktere und stellt den letzten aktiven Bogen wieder her", async () => {
  const factory = new IDBFactory();
  const library = await openCharacterLibrary(factory);
  const first = await library.create(characterNamed("Ardo"), { "/extra": "Erhalten" });
  const other = await library.create(characterNamed("Finja"));
  expect(await library.getActiveId()).toBe(other.id);
  await library.setActiveId(first.id);
  library.close();

  const reopened = await openCharacterLibrary(factory);
  expect(await reopened.getActiveId()).toBe(first.id);
  expect((await reopened.list()).map((entry) => entry.character.profile.name).sort()).toEqual(["Ardo", "Finja"]);
  expect(await reopened.get(first.id)).toMatchObject({ legacy: { "/extra": "Erhalten" }, revision: 1 });
  await reopened.delete(first.id, first.revision);
  expect(await reopened.get(first.id)).toBeUndefined();
  expect(await reopened.getActiveId()).toBeUndefined();
  expect(await reopened.get(other.id)).toEqual(other);
  reopened.close();
});

it("überschreibt oder löscht bei einer veralteten Revision keinen Stand", async () => {
  const factory = new IDBFactory();
  const firstTab = await openCharacterLibrary(factory);
  const secondTab = await openCharacterLibrary(factory);
  const record = await firstTab.create(characterNamed("Ardo"), { "/extra": true });
  const outcomes = await Promise.allSettled([
    firstTab.save(record.id, record.revision, characterNamed("Stand A")),
    secondTab.save(record.id, record.revision, characterNamed("Stand B")),
  ]);
  expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
  expect(outcomes).toContainEqual({
    status: "rejected", reason: expect.objectContaining({ name: "CharacterConflictError", reason: "changed" }),
  });
  await expect(secondTab.delete(record.id, record.revision)).rejects.toMatchObject({ reason: "changed" });
  const latest = await firstTab.get(record.id);
  expect(latest).toMatchObject({ revision: 2, legacy: { "/extra": true } });
  expect(["Stand A", "Stand B"]).toContain(latest?.character.profile.name);

  await firstTab.delete(record.id, 2);
  await expect(secondTab.save(record.id, 2, characterNamed("Alter Entwurf"))).rejects.toMatchObject({ reason: "deleted" });
  await expect(secondTab.setActiveId(record.id)).rejects.toMatchObject({ reason: "deleted" });
  expect(await secondTab.get(record.id)).toBeUndefined();
  expect(await secondTab.getActiveId()).toBeUndefined();
  firstTab.close();
  secondTab.close();
});
