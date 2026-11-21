import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

async function createCharacter(page: Page, name: string) {
  await page.goto("/");
  await page.getByLabel("Name des neuen Charakters").fill(name);
  await page.getByRole("button", { name: "Charakter anlegen" }).click();
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
}

async function uploadJson(page: Page, payload: unknown, name = "alt.json") {
  const opening = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "JSON importieren", exact: true }).click();
  const picker = await opening;
  await picker.setFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(payload)),
  });
}

async function openSection(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Spielbereiche" }).getByRole("button", { name, exact: true }).click();
}

test("Steigerung, Anzeige und versteckte Werte überstehen einen Reload", async ({ page }) => {
  await createCharacter(page, "Ilaris");
  await expect(page.getByText("Stufe 1 · 130 Steigerungspunkte", { exact: true })).toBeVisible();
  const xp = page.getByRole("textbox", { name: "Erfahrungspunkte (XP)" });
  await xp.fill("");
  await expect(page.getByText("Stufe 1 · 130 Steigerungspunkte", { exact: true })).toBeVisible();
  await xp.fill("750");
  await xp.press("Enter");
  await expect(page.getByText("Stufe 6 · 280 Steigerungspunkte", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Konstitution erhöhen" }).click();
  await expect(page.getByText("Stufe 6 · 275 Steigerungspunkte", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Konstitution ausblenden" }).click();
  await expect(page.getByRole("button", { name: "Konstitution ausblenden" })).toHaveCount(0);
  await expect(page.getByText("Lokal gespeichert", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Ilaris", level: 1 })).toBeVisible();
  await expect(page.getByText("Stufe 6 · 275 Steigerungspunkte", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Konstitution ausblenden" })).toHaveCount(0);
  await page.getByRole("button", { name: "Konstitution einblenden" }).click();
  await expect(page.getByRole("textbox", { name: "Konstitution", exact: true })).toHaveValue("10");
});

test("alte JSON-Dateien, Export und Wiederimport lassen beide Charaktere getrennt", async ({ page }) => {
  await createCharacter(page, "Erster Charakter");
  const template = JSON.parse(readFileSync("charbogen/charakter.json", "utf8"));
  template.charakter.charakterInfo.name = "Alter Spielstand";
  template.charakter.werte = { xp: 750, level: 7, Steigerungspunkte: 300, Gesteigerte: 10 };
  await uploadJson(page, template);
  await expect(page.getByRole("heading", { name: "JSON-Import prüfen" })).toBeVisible();
  await page.getByRole("button", { name: "Als neuen Charakter importieren" }).click();
  await expect(page.getByRole("heading", { name: "Alter Spielstand", level: 1 })).toBeVisible();
  await expect(page.getByText("Stufe 6 · 270 Steigerungspunkte", { exact: true })).toBeVisible();

  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON exportieren" }).click();
  const download = await downloading;
  const exported = JSON.parse(readFileSync(await download.path(), "utf8"));
  expect(exported.charakter.charakterInfo.name).toBe("Alter Spielstand");
  expect(exported.charakter.werte.Steigerungspunkte).toBe(270);
  expect(exported.schemaVersion).toBe(1);

  await uploadJson(page, exported, "export.json");
  await page.getByRole("button", { name: "Als neuen Charakter importieren" }).click();
  await expect(page.getByText("Der Charakter wurde aus der JSON-Datei übernommen.")).toBeVisible();

  await uploadJson(page, { wrong: true }, "falsch.json");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alter Spielstand", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Charakterliste" }).click();
  await expect(page.getByRole("button", { name: "Alter Spielstand öffnen" })).toHaveCount(2);
  await page.getByRole("button", { name: "Erster Charakter öffnen" }).click();
  await expect(page.getByRole("heading", { name: "Erster Charakter", level: 1 })).toBeVisible();
  await expect(page.getByText("Stufe 1 · 130 Steigerungspunkte", { exact: true })).toBeVisible();
});

test("speichert konkurrierende Tab-Änderungen als getrennte Kopie", async ({ page, context }) => {
  await createCharacter(page, "Gemeinsamer Stand");
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.getByRole("heading", { name: "Gemeinsamer Stand", level: 1 })).toBeVisible();

  const currentXp = page.getByRole("textbox", { name: "Erfahrungspunkte (XP)" });
  await currentXp.fill("300");
  await currentXp.press("Enter");
  await expect(page.getByText("Stufe 3 · 190 Steigerungspunkte", { exact: true })).toBeVisible();
  await expect(page.getByText("Lokal gespeichert", { exact: true })).toBeVisible();

  const otherXp = other.getByRole("textbox", { name: "Erfahrungspunkte (XP)" });
  await otherXp.fill("600");
  await otherXp.press("Enter");
  await expect(other.getByText("Konflikt beim Speichern", { exact: true })).toBeVisible();
  await other.getByRole("button", { name: "Stand als Kopie sichern" }).click();
  await expect(other.getByText("Stufe 5 · 250 Steigerungspunkte", { exact: true })).toBeVisible();
  await expect(other.getByText("Lokal gespeichert", { exact: true })).toBeVisible();
  await other.getByRole("button", { name: "Charakterliste" }).click();
  await expect(other.getByRole("button", { name: "Gemeinsamer Stand öffnen" })).toHaveCount(2);
});

test("alle Ansichten passen in schmale und breite Viewports", async ({ page }) => {
  await createCharacter(page, "Sehr langer Charaktername – Schwertmeisterin aus dem Bornland");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const section of ["Bogen", "Magie", "Inventar & Shop", "Werkzeuge", "Einstellungen"]) {
      await openSection(page, section);
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(dimensions.content, section + " bei " + width + " Pixeln").toBeLessThanOrEqual(dimensions.width);
    }
  }
});

test("Werkzeuge würfeln per Tastatur und halten das Würfelergebnis fest", async ({ page }) => {
  await createCharacter(page, "Würfelprobe");
  await openSection(page, "Werkzeuge");
  const roll = page.getByRole("button", { name: "Würfeln", exact: true });
  await roll.focus();
  await page.keyboard.press("Enter");
  const results = page.getByRole("list", { name: "Würfelergebnisse" });
  await expect(results.getByRole("listitem")).toHaveCount(1);
  const value = await results.getByRole("listitem").textContent();
  await page.getByLabel("Würfelart").selectOption("6");
  await expect(results.getByRole("listitem")).toHaveText(value ?? "");
});

test("Magie zeigt das gemeinsame Guthaben und Shop und Inventar bleiben konsistent", async ({ page }) => {
  await createCharacter(page, "Magierin");
  await openSection(page, "Magie");
  await page.getByRole("combobox", { name: "Magie-Element", exact: true }).selectOption("Feuer");
  await page.getByRole("combobox", { name: "Magie-Art", exact: true }).selectOption("Angriff");
  await page.getByRole("button", { name: "Magie hinzufügen", exact: true }).click();
  await expect(page.getByText("Stufe 1 · 130 Steigerungspunkte", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Feuer Angriff steigern" }).click();
  await expect(page.getByText("Stufe 1 · 128 Steigerungspunkte", { exact: true })).toBeVisible();

  await uploadJson(page, { name: "Nur Magie", magic: [{ element: "Wasser", type: "Unterstützung", level: 3 }] }, "magie.json");
  await page.getByRole("button", { name: "Magie im geöffneten Bogen ersetzen" }).click();
  await expect(page.getByRole("heading", { name: "Magierin", level: 1 })).toBeVisible();
  await expect(page.getByText("Stufe 1 · 128 Steigerungspunkte", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Wasser Unterstützung steigern" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Feuer Angriff steigern" })).toHaveCount(0);

  await openSection(page, "Inventar & Shop");
  await page.getByLabel("Betrag", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Einzahlen", exact: true }).click();
  await page.getByText("Waffenzubehör", { exact: true }).click();
  await page.getByRole("button", { name: "Schwertgürtel kaufen" }).click();
  await expect(page.getByText("800 Kreuzer", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Menge Schwertgürtel")).toHaveText("1");
  await page.getByRole("button", { name: "Ein Stück Schwertgürtel hinzufügen" }).click();
  await expect(page.getByLabel("Menge Schwertgürtel")).toHaveText("2");
  await expect(page.getByText("800 Kreuzer", { exact: true })).toBeVisible();
  await expect(page.getByText("Lokal gespeichert", { exact: true })).toBeVisible();
  await page.reload();
  await openSection(page, "Inventar & Shop");
  await expect(page.getByLabel("Menge Schwertgürtel")).toHaveText("2");
});

test("filtert Talente und würfelt drei W20 mit den Werten der Probe", async ({ page }) => {
  await createCharacter(page, "Pfadfinder");
  const search = page.getByRole("searchbox", { name: "Talent suchen" });
  await search.fill("KLETTERN");
  const roll = page.getByRole("button", { name: "Klettern würfeln" });
  await expect(roll).toBeVisible();
  await page.getByRole("combobox", { name: "Talentgruppe" }).selectOption("Handwerkstalente");
  await expect(page.getByText("Keine passenden Talente.")).toBeVisible();
  await page.getByRole("combobox", { name: "Talentgruppe" }).selectOption("Assassinen_Talente");
  await roll.click();
  const probe = page.getByRole("status", { name: "Wurf für Klettern" });
  await expect(probe.getByRole("listitem")).toHaveCount(3);
  await expect(probe.getByRole("listitem").first()).toContainText("Konstitution (9)");
  await expect(page.getByRole("textbox", { name: "Klettern", exact: true })).toHaveValue("0");
  await search.clear();
  await expect(page.getByRole("textbox", { name: "Klettern", exact: true })).toHaveValue("0");
});

test("ändert die Reihenfolge per Tastatur, merkt sie beim Reload und setzt sie zurück", async ({ page }) => {
  await createCharacter(page, "Ordnung");
  const headings = page.locator("#sheet-heading + nav ~ .play-grid h3");
  await expect(headings.first()).toHaveText("Fortschritt");
  await page.getByText("Abschnitte anordnen", { exact: true }).click();
  const up = page.getByRole("button", { name: "Profil nach oben verschieben" });
  await up.focus();
  await page.keyboard.press("Enter");
  await expect(headings.first()).toHaveText("Profil");
  await page.reload();
  await expect(headings.first()).toHaveText("Profil");
  await page.getByText("Abschnitte anordnen", { exact: true }).click();
  await page.getByRole("button", { name: "Reihenfolge zurücksetzen" }).click();
  await expect(headings.first()).toHaveText("Fortschritt");
  await expect(page.getByText("Stufe 1 · 130 Steigerungspunkte", { exact: true })).toBeVisible();
});

test("speichert Charakterbild, Notiz und Zaubertext und hält sie aus geteilten Spielwerten heraus", async ({ page }) => {
  await createCharacter(page, "Nera");
  const opening = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Charakterbild hinzufügen" }).click();
  await (await opening).setFiles({
    name: "bild.png", mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/5l8AAAAASUVORK5CYII=", "base64"),
  });
  await expect.poll(() => page.getByRole("img", { name: "Charakterbild" }).evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(1);
  await page.getByLabel("Persönliche Notizen").fill("Eine private Notiz");
  await page.getByRole("button", { name: "Notizen speichern" }).click();
  await openSection(page, "Magie");
  await page.getByRole("button", { name: "Zauberbeschreibung anlegen" }).click();
  await page.getByLabel("Zaubername").fill("Lichtfunke");
  await page.getByLabel("Beschreibung", { exact: true }).fill("Ein kleiner Funke.");
  await page.getByRole("button", { name: "Beschreibung speichern" }).click();
  await expect(page.getByText("Lichtfunke", { exact: true })).toBeVisible();
  await expect(page.getByText("Lokal gespeichert", { exact: true })).toBeVisible();
  await page.reload();
  await expect.poll(() => page.getByRole("img", { name: "Charakterbild" }).evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(1);
  await expect(page.getByLabel("Persönliche Notizen")).toHaveValue("Eine private Notiz");
  await openSection(page, "Magie");
  await expect(page.getByText("Ein kleiner Funke.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Spielleitung" }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Spielwerte exportieren" }).click();
  const download = await downloading;
  const shared = readFileSync(await download.path(), "utf8");
  expect(shared).not.toContain("private Notiz");
  expect(shared).not.toContain("Lichtfunke");
  expect(shared).not.toContain("base64");

  const pickingShared = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Geteilte Bögen öffnen" }).click();
  await (await pickingShared).setFiles([
    { name: "daten.json", mimeType: "application/json", buffer: Buffer.from(shared) },
    { name: "fehler.json", mimeType: "application/json", buffer: Buffer.from("{") },
  ]);
  await expect(page.getByRole("heading", { level: 3, name: "Nera" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("fehler.json");
  await page.getByRole("button", { name: "Spielleitung" }).click();
  await page.getByRole("button", { name: "Charakterliste" }).click();
  await expect(page.getByRole("button", { name: "Nera öffnen" })).toHaveCount(1);
});

test("legt den bestätigten Vorschlag mit den geprüften Klassentarifen an", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Name des neuen Charakters").fill("Juna");
  await page.getByText("Erstellungsassistent", { exact: true }).click();
  await page.getByRole("combobox", { name: "Startklasse" }).selectOption("Ritter");
  await page.getByRole("button", { name: "Charakter mit Vorschlag anlegen" }).click();
  await expect(page.getByRole("heading", { name: "Juna", level: 1 })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Körperkraft", exact: true })).toHaveValue("10");
  await expect(page.getByText("Stufe 1 · 116 Steigerungspunkte", { exact: true })).toBeVisible();
});
