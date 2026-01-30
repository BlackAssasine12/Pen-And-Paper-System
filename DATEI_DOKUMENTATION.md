# Dateiübersicht und Zweck der Bestandteile

Dieses Projekt ist ein digitaler Charakterbogen für ein selbst erfundenes Pen-and-Paper-System (basierend auf DSA). Ziel ist der Umbau in eine TypeScript/Light-React/Vite-Version, ohne CSS-Frameworks außer SCSS.

Diese Dokumentation beschreibt die Aufgaben der Dateien im Repository **Pen-And-Paper-System**. Sie ist nach Ordnern gegliedert und erklärt, welche Teile der Anwendung (Charakterbogen, Magiesystem, Shop, Layout usw.) die jeweiligen Dateien abdecken.

## Wurzelebene des Repos

- **DATEI_DOKUMENTATION.md**
  - Diese Datei: Übersicht über Struktur, Migration und Aufgabenstatus.
- **README.md**
  - Enthält Regeln, Klassenkosten, Beispielaufträge sowie Berechnungsformeln für Charakterwerte. Dient als Regel- und Referenzdokumentation.
- **index.html**
  - Einstiegspunkt für die Vite/React-App (Root-Div + TSX-Bundle).
- **package.json**
  - Vite/React-Setup inkl. Scripts und Abhängigkeiten.
- **package-lock.json**
  - Lockfile für reproduzierbare npm-Installationen.
- **prettier.config.cjs**
  - Prettier-Konfiguration für konsistentes Formatting.
- **tsconfig.json**
  - TypeScript-Konfiguration für die React-Anwendung.
- **tsconfig.node.json**
  - TypeScript-Konfiguration für die Vite-Konfiguration.
- **tsconfig.test.json**
  - TypeScript-Konfiguration für Tests.
- **vite.config.ts**
  - Vite-Konfiguration (React-Plugin).
- **legacy-deps-report.json**
  - Automatisch generierter Legacy-Report (window-Globals, DOM-IDs, Selektoren), erzeugt via `scripts/legacy-deps-inventory.mjs`.
- **preislisteKomplett.json**
  - Umfangreiche Preisliste (DSA 4.0/4.1) mit Maßen, Gewichten und Ausrüstung.
- **shopData.json**
  - Shop-Katalog (Kategorien + Items mit Preis/Währung), der im Shop-Tab geladen wird.
- **test.js**
  - Platzhalter für Tests oder spätere Skripte.

## Ordner `assets/`

- **assets/pappenheimer.jpg**
  - Bild-Asset (Layout/Illustration).
- **assets/wood.jpg**
  - Hintergrundtextur für das UI (Body-Background).

## Ordner `charbogen/`

- **charbogen/charakter.json**
  - Beispiel-/Vorlagendatei für den Charakterbogen (Struktur für Charakterinfo, Werte, Geld, Fähigkeiten, Magie, Inventar).
- **charbogen/InfoListe.json**
  - Datenquelle für Rassen- und Klassenlisten, strukturiert nach Kategorien. Wird in Dropdowns übernommen.

## Ordner `legacy/`

- **legacy/index.html**
  - Frühere Hauptoberfläche der Dokumentation/Übersicht.
- **legacy/charakterbogen.html**
  - Alte Komplettansicht des Charakterbogens als Referenz für die Migration.

## Ordner `scripts/`

- **scripts/patch-test-imports.mjs**
  - Hilfsskript für Test-Importe (wird für die Testumgebung genutzt).
- **scripts/legacy-deps-inventory.mjs**
  - Inventarisiert Legacy-DOM-Abhängigkeiten in `src/` und erzeugt den Report `legacy-deps-report.json`.

## Ordner `tests/`

- **tests/adjustments.test.ts**
  - Tests für Klassenanpassungen/Steigerungswerte.
- **tests/saveLoader.test.ts**
  - Tests für das Speichern/Laden und Migration von Charakterdaten.
- **tests/node-ambient.d.ts** / **tests/vite-env.d.ts**
  - Typdefinitionen für die Test-Umgebung.

## Ordner `src/`

### Einstieg & App-Struktur

- **src/main.tsx**
  - Einstiegspunkt der React-App, lädt die Styles und rendert den Root-Container.
- **src/App.tsx**
  - App-Container mit globalen Zuständen (Listener, versteckte Felder, Magiestate) und den Top-Level-Komponenten.

### Komponenten (Layout/Steuerung)

- **src/components/TopControls.tsx**
  - Kopfbereich mit Schaltern für Listener, Ausgeblendete-Tab und Auto-Skill-Verteilung.
- **src/components/Tabs.tsx**
  - Tab-Navigation und Tab-Inhalte (Charakter, Magie, Ausgeblendete, Inventar, Werkzeuge, Einstellungen). Bindet Legacy-Funktionen als Übergang an.

### Feature: Charakter

- **src/features/character/CharacterContext.tsx**
  - React-Context für Charaktername und Erfahrungswerte (Level, XP, Steigerungspunkte).
- **src/features/character/CharacterNameInput.tsx**
  - Eingabe für den Charakternamen, gebunden an den Context.
- **src/features/character/ExperienceSection.tsx**
  - Anzeige und Bearbeitung von Level/XP/Steigerungspunkten inkl. Trigger für Berechnungen.
- **src/features/character/SaveControls.tsx**
  - UI für Laden/Speichern (Datei-Upload und Download).
- **src/features/character/components/CharacterAttributes.tsx**
  - React-Komponente zum Rendern der Attribut- und Talent-Abschnitte aus JSON-Daten.
- **src/features/character/components/AttributesSection.tsx**
  - React-Komponente für die Attribut-Eingaben (React-State).
- **src/features/character/components/ModifiersSection.tsx**
  - React-Komponente für Modifier-Eingaben (React-State).
- **src/features/character/components/CombatBaseSection.tsx**
  - React-Komponente für Kampf-Basiswerte (abgeleitete Werte).
- **src/features/character/components/SonderwerteSection.tsx**
  - React-Komponente für Sonderwerte (abgeleitete Werte).
- **src/features/character/components/HiddenAttributesSection.tsx**
  - React-Komponente für ausgeblendete Attribute (Ausgeblendete-Tab).
- **src/features/character/components/SaveControlsSection.tsx**
  - Wrapper-Komponente für Save/Load, bindet SaveControls an Character- und Magic-State.
- **src/features/character/index.ts**
  - Sammel-Exports für Context, UI-Teile und Save/Load-Helfer.
- **src/features/character/legacy.ts**
  - Lädt die bisherigen DOM-basierten Services (Übergangscode).
- **src/features/character/hooks/useCharacterCalculations.ts**
  - Hook für React-State-Berechnungen der Kernwerte (Attribute/Modifier → abgeleitete Werte).

#### Charakter-Services (`src/features/character/services/`)

- **adjustments.ts**
  - Standard-Steigerungswerte und Klassenanpassungen.
- **calculations.ts**
  - Berechnung abgeleiteter Werte (LP, AUSD, MB, ASP, MR, Giftresistenz) sowie Auto-Skill-Verteilung.
- **characterInfo.ts**
  - Laden/Speichern der Stammdaten (Name, Alter, Klasse usw.).
- **derivedCalculations.ts**
  - Pure Berechnungsfunktionen für Level- und Derived-Values (React/Legacy gemeinsam nutzbar).
- **characterState.ts**
  - Zentrale Brücke zwischen Eingaben und berechneten Ausgaben (DOM-Input/Output).
- **hideButtons.ts**
  - Ausblenden einzelner Eingabefelder und Wiederherstellen im „Ausgeblendete“-Tab.
- **inputListeners.ts**
  - Event-Listener für automatische Berechnungen und Steigerungspunkte.
- **liste.ts**
  - Lädt `InfoListe.json` und füllt Dropdowns für Rassen/Klassen.
- **maxValueSettings.ts**
  - Setzt dynamische Min-/Max-Werte für Eingaben und greift in die UI ein.
- **saveLoader.ts**
  - Speichern/Laden von Charakterdaten inkl. Migrationslogik für alte Magie-/Inventarstrukturen.
- **skin.ts**
  - Schriftart-/Farb-Optionen für das Layout.
- **tabs.ts**
  - Tab-spezifische DOM-Logik (Legacy-Verhalten).

### Feature: Magie

- **src/features/magic/VanillaMagicSystem.tsx**
  - React-Komponente für das Magiesystem (Elemente, Typen, Level, Steigerungskosten, UI-Rendering).
- **src/features/magic/services/vanillaMagicSystem.ts**
  - Service-Logik zur Legacy-Synchronisation des Magiesystems.
- **src/features/magic/types.ts**
  - TypeScript-Typen für Magie-Objekte und State.

### Feature: Shop/Inventar

- **src/features/shop/ShopContext.tsx**
  - React-Context für Shop- und Wallet-State (Shopdaten, Käufe, Inventar).
- **src/features/shop/store.ts**
  - Kleiner Store für Shop-Snapshots (Wallet/Inventar), damit Save/Load ohne DOM funktioniert.
- **src/features/shop/components/ShopPanel.tsx**
  - React-Komponente für die Shop-Ansicht inkl. Kaufaktionen.
- **src/features/shop/components/InventoryPanel.tsx**
  - React-Komponente für Inventarverwaltung (Hinzufügen/Entfernen).
- **src/features/shop/components/WalletPanel.tsx**
  - React-Komponente für den Geldbeutel (Add/Convert/Reset).
- **src/features/shop/index.ts**
  - Index/Exports für Shop-Context und Shop-Store.
- **src/features/shop/legacy.ts**
  - Lädt die DOM-basierten Shop-/Wallet-Services.
- **src/features/shop/services/shop.ts**
  - Shop-Rendering, Käufe und Inventar-Handling.
- **src/features/shop/services/wallet.ts**
  - Wallet-/Währungsverwaltung (Dukaten, Silber, Heller, Kreuzer).

### Feature: Würfel & Rechner

- **src/features/dice/components/DiceRoller.tsx**
  - React-Komponente für das Würfelsystem inkl. Ergebnisanzeige.
- **src/features/dice/components/Calculator.tsx**
  - React-Komponente für den Taschenrechner (String-Ausdruck + `eval`).
- **src/features/dice/index.ts**
  - Index/Exports für Würfel-Logik.
- **src/features/dice/legacy.ts**
  - Lädt die DOM-basierten Würfel-/Rechner-Skripte (Legacy-Referenz).
- **src/features/dice/services/dice.ts**
  - Würfelsystem inkl. d20/d100 Logik und Ergebnisanzeige (Legacy-Referenz).
- **src/features/dice/services/spezialDice.ts**
  - Experimentelle „gute/schlechte“ Würfel-Logik (Logging, Legacy-Referenz).
- **src/features/dice/services/rechner.ts**
  - Taschenrechner (String-Ausdruck + `eval`, Legacy-Referenz).

### Gemeinsame Typen

- **src/types/character.ts**
  - Datenstrukturen für Charakterdaten, Magie, Inventar und Speicherdaten.
- **src/types/react-shim.d.ts** / **src/types/vite-env.d.ts**
  - TS-Definitionen für React/TSX und Vite.

### Styles (SCSS)

- **src/styles/main.scss**
  - Einstiegspunkt für die Styles, bindet SCSS-Module ein.
- **src/styles/_variables.scss**
  - Zentrale Variablen (Farben, Typografie, Abstände).
- **src/styles/_base.scss**
  - Reset/Global-Styles und Body-Styling.
- **src/styles/_layout.scss**
  - Layout-Regeln (Spalten, Container, Flexbox, Würfel-/Rechner-Layout).
- **src/styles/_components.scss**
  - Styling für Buttons, Inputs, Wallet, Inventar-/Shop-Komponenten.
- **src/styles/_tabs.scss**
  - Tabs-Layout und Navigation.
- **src/styles/_vanillaMagicSystem.scss**
  - Spezifische Styles für das Magiesystem.

## Migrationsstand & offene Punkte

### Was bereits übernommen wurde

- React/Vite-Struktur inkl. Tabs, Header-Steuerung und globalem CharacterContext.
- Magiesystem als React-Komponente (inkl. Typed State).
- Charakterdaten-Speichern/-Laden (inkl. Migrationspfade) ist in TypeScript-Services vorhanden.
- Shop-Logik wurde in Services ausgelagert und aus React heraus angesteuert; Würfel/Rechner sind als React-Komponenten umgesetzt.
- Legacy-Abhängigkeiten inventarisiert (Codex-Aufgabe 1 erledigt) inkl. Skript zur Wiederholung der Analyse.
- Kernberechnungen für Attribute/Modifier + abgeleitete Basis-/Sonderwerte sind als React-State/Hook verfügbar (Codex-Aufgabe 2 erledigt).
- UI-Abschnitte für Attribute/Modifier/Sonderwerte/Kampf-Basiswerte in React-Komponenten ausgelagert (Codex-Aufgabe 3 erledigt).
- Hide-Buttons/Min-Max-Aktionen für Attribute/Modifier nach React-State überführt (Codex-Aufgabe 4 erledigt).
- Tabs rufen Service-Funktionen auf und sind von globalen `window`-Callbacks entkoppelt (Codex-Aufgabe 5 erledigt).
- Shop/Inventar-UI und Wallet-Logik in React-State migriert, inkl. Shop-Data-Loading (Codex-Aufgabe 6 erledigt).
- Würfel & Rechner als React-Komponenten umgesetzt, Legacy-Init in `main.tsx` entfernt (Codex-Aufgabe 7 erledigt).
- Save/Load-UI modularisiert, SaveControls separat in Tabs integriert (Codex-Aufgabe 8 erledigt).
- Legacy-Bootstrap aus `src/main.tsx` entfernt (Codex-Aufgabe 9 erledigt).

### Was noch zu migrieren ist (weil aktuell noch Legacy-Skripte benötigt werden)

- **Restliche DOM-Logik in `services/` → React-State/Komponenten:** Teile der Charakterlogik (z. B. Talente/Auto-Skill-Verteilung) greifen weiterhin auf DOM-IDs/Legacy-Services zu.
- **Auto-Skill-Trigger entkoppeln:** Der Auto-Skill-Trigger in der UI ruft noch eine `window`-Funktion auf und sollte durch React-State ersetzt werden.
- **Legacy-UI-Container entfernen:** Bereiche wie Kampf-Talente oder dynamische Listen werden noch über Legacy-Container (`*_Container`, `*_GridContainer`) gefüllt.
- **Legacy-Ordner aufräumen:** `legacy/` und ungenutzte Services entfernen, sobald die letzten DOM-Abhängigkeiten ersetzt sind.
- **Dokumentation konsolidieren:** Abschluss von Codex-Aufgabe 10 (Cleanup/Stabilisierung) inkl. Aktualisierung der Referenzen.

### Inventarisierte Legacy-Abhängigkeiten (Codex-Aufgabe 1)

Für eine reproduzierbare Analyse kann das Skript `scripts/legacy-deps-inventory.mjs` genutzt werden. Es erzeugt `legacy-deps-report.json` im Repo-Root mit einer Feature-Übersicht (window-Globals, DOM-IDs, Selektoren, DOM-Operationen).

**Core (src/main.tsx)**
- DOM-IDs: `root`
- DOM-Operationen: `createRoot`, `getElementById`

**Character (src/features/character/… )**
- window-Globals: `MagicSystem`, `advancementPoints`, `characterMagic`, `inventory`, `kampfArr`
- DOM-IDs (statisch):
  - Charakterinfo: `name`, `alter`, `geschlecht`, `rassen-select`, `klassen-select`, `größe`, `gewicht`, `haarfarbe`, `augenfarbe`, `titel`
  - Erfahrung/Werte: `erfahrung_xp`, `erfahrung_level`, `erfahrung_Steigerungspunkte`, `erfahrung_Gesteigerte`
  - Attribute/Modifier: `modifier_lp`, `modifier_asp`, `modifier_magie`, `modifier_fernkampf`, `modifier_nahkampf`, `modifier_gift`
  - Attribute-Eingaben: `attribute_Körperkraft`, `attribute_Gewandheit`, `attribute_Klugheit`, `attribute_Intuition`, `attribute_Fingerfertigkeit`, `attribute_Charisma`, `attribute_Geschicklichkeit`, `attribute_Tarnung`, `attribute_Sinnesschärfe`, `attribute_Willenskraft`, `attribute_Konstitution`
  - Sonderwerte/Basiswerte: `sonderwerte_Maximale_LP`, `sonderwerte_Maximale_Ausdauer`, `sonderwerte_Magiebegabung`, `sonderwerte_Maximale_Astralenergie`, `sonderwerte_Magieresistenz`, `sonderwerte_Giftresistenz`, `sonderwerte_Schnelligkeit`, `KampfBasiswerte_Wurfwaffen_Basiswert`, `KampfBasiswerte_Schusswaffen_Basiswert`, `KampfBasiswerte_Attacke_Basiswert`, `KampfBasiswerte_Parade_Basiswert`
  - Auto-Skill/Buttons: `ASkillVert`, `setMin`, `setMax`, `toggleListenersCheckbox`, `toggleHiddenCheckbox`
  - Containers/Legacy-UI: `modifierContainer`, `sonderwerteContainer`, `attributeContainer`, `magischeElementeContainer`, `kampfTalenteGridContainer`, `hiddenItemsContainer`, `saveButton`
  - Magie-Tooltip-IDs: `Magische_Elemente_Schatten_Tooltip`, `Magische_Elemente_Licht_Tooltip`, `Magische_Elemente_Holz_Tooltip`, `Magische_Elemente_Metall_Tooltip`, `Magische_Elemente_Eis_Tooltip`, `Magische_Elemente_Leben_Tooltip`, `Magische_Elemente_Nekromantie_Tooltip`, `Magische_Elemente_Blitz_Tooltip`, `Magische_Elemente_Gravitation_Tooltip`, `Magische_Elemente_Erschaffung_Tooltip`, `Magische_Elemente_Raumzeit_Tooltip`, `Magische_Elemente_Gift_Tooltip`, `Magische_Elemente_Blut_Tooltip`
  - Kampf-Talent-IDs (fixiert genutzt): `Kampf_Talente_Schild_0`, `Kampf_Talente_Schild_1`, `Kampf_Talente_Schild_2`, `Kampf_Talente_Wurfwaffen_0`, `Kampf_Talente_Wurfwaffen_1`, `Kampf_Talente_Wurfwaffen_2`, `Kampf_Talente_Bolzenwaffen_0`, `Kampf_Talente_Bolzenwaffen_1`, `Kampf_Talente_Bolzenwaffen_2`, `Kampf_Talente_Pfeilwaffen_0`, `Kampf_Talente_Pfeilwaffen_1`, `Kampf_Talente_Pfeilwaffen_2`
  - Dynamische IDs/Template-IDs: `${sectionId}_${sanitizedKey}_${index}`, `${sectionId}_${sanitizedKey}`
  - Magic/Shop-Synchronisierung: `advancement-points`, `inventory`
- DOM-Selektoren: `.stg`, `.hidden-items`, `.tab-item`, `.tab-content`, `.hidebutton`, `.FlexItem`, `.BigFlexItem`, `.hidden-item`, `.Assassinen_Talente`, `.Talente_1`, `.Talente_2`, `.Handwerkstalente`, `.Kampf_Talente`, `.attribute`, `.Magische_Elemente`, `.modifier`, `#inventory li`, `label`, `select`, `input`
- Direkte DOM-Operationen: `getElementById`, `querySelector(All)`, `createElement`, `appendChild`, `removeChild`, `classList`, `style`, `innerHTML`, `textContent`, `setAttribute`, `addEventListener`, `removeEventListener`, `closest`

**Magic (src/features/magic/… )**
- window-Globals: `MagicSystem`, `advancementPoints`, `characterMagic`, `renderMagicList`, `updatePreview`
- DOM-IDs: `erfahrung_level`, `erfahrung_xp`, `erfahrung_Gesteigerte`, `erfahrung_Steigerungspunkte`, `advancement-points`, `name`, `characterName`, `elementSelect`, `customElementContainer`, `customElement`, `magicTypeSelect`, `magicLevel`, `levelError`, `addMagicBtn`, `magic-list`, `add-points-btn`, `saveButton`, `loadButton`, `fileInput`, `previewContent`, `magie-tab`, `magieSpeichernButton`
- DOM-Selektoren: `.tab-item`, `.btn-level-up`, `.btn-remove`, `.vanilla-magic-system`
- Direkte DOM-Operationen: `getElementById`, `querySelector(All)`, `createElement`, `appendChild`, `removeChild`, `classList`, `style`, `innerHTML`, `textContent`, `setAttribute`, `addEventListener`, `dispatchEvent`

**Shop (src/features/shop/… )**
- window-Globals: `inventory`
- DOM-IDs: `shop`, `itemNameInput`, `inventory`, `ShopButton`, `showDukaten`, `showSilber`, `showHeller`, `showKreuzer`, `CurrencyField`, `NumberInput`
- DOM-Selektoren: `#inventory li`
- Direkte DOM-Operationen: `getElementById`, `createElement`, `appendChild`, `classList`, `innerHTML`, `textContent`, `addEventListener`

**Dice (src/features/dice/… )**
- DOM-IDs: `divDice`, `DiceCount`, `DiceSides`, `showDice`, `container`, `Dicer`, `eqField`, `evField`
- Direkte DOM-Operationen: `getElementById`, `createElementNS`, `appendChild`, `classList`, `style`, `innerHTML`, `innerText`, `setAttribute`

### Hinweis zum aktuellen Stand

Da weiterhin Legacy-Services und `window`-Funktionen in React-Logik eingebunden sind, muss die DOM-Struktur noch teilweise der bisherigen Struktur entsprechen. Die Migration muss daher die verbleibenden DOM-Abhängigkeiten schrittweise entfernen und die Logik in React-State + Komponenten überführen.

## Codex-Aufgabenplan (Schritt-für-Schritt)

> **Wichtig:** Nach jeder erledigten Aufgabe muss die Sektion **„Migrationsstand & offene Punkte“** aktualisiert werden (erledigte Punkte markieren, offene Punkte präzisieren, neue Hinweise ergänzen).

1) **Codex-Aufgabe: Legacy-Abhängigkeiten inventarisieren (erledigt)**
   - Sammle in `src/features/*/legacy.ts` und `src/main.tsx` alle `window`-Funktionen, DOM-IDs und direkte DOM-Manipulationen.
   - Liefere eine Feature-Liste (Character/Magic/Shop/Dice) der Abhängigkeiten als Basis für die Migration.

2) **Codex-Aufgabe: Charakterberechnungen nach React-State migrieren (erledigt)**
   - Überführe die Kernberechnungen aus `src/features/character/services/` (z. B. `calculations.ts`, `inputListeners.ts`, `characterState.ts`) in State-basierte Logik/Hooks.
   - Starte mit Attribut- und Talentberechnungen, da sie viele weitere Komponenten beeinflussen.

3) **Codex-Aufgabe: Legacy-UI-IDs durch React-Komponenten ersetzen (erledigt)**
   - Migriere UI-Abschnitte mit Legacy-IDs (z. B. Attribute, Talente, Shop, Inventar) in eigenständige React-Komponenten.
   - Entferne direkte `document.getElementById`/`querySelector`-Abhängigkeiten in diesen Bereichen.

4) **Codex-Aufgabe: Listener/Hide-Buttons in React-Logik überführen (erledigt)**
   - Ersetze `hideButtons.ts`, `inputListeners.ts` und `maxValueSettings.ts` durch React-State + Effekte.
   - Stelle sicher, dass das Verhalten im „Ausgeblendete“-Tab erhalten bleibt.

5) **Codex-Aufgabe: Tabs-Logik ohne globale `window`-Funktionen (erledigt)**
   - Baue die `window`-Funktionsaufrufe in `src/components/Tabs.tsx` auf lokale Handler/Hooks um.
   - Definiere klar, welche Funktionen/Services von Tabs benötigt werden.

6) **Codex-Aufgabe: Shop & Wallet vollständig entkoppeln (erledigt)**
   - Migriere die DOM-gebundene Shop-/Wallet-Logik (`src/features/shop/services/*`) in React-State.
   - Baue das Shop-/Inventar-UI als komponentenbasierte Ansicht mit sauberem Datenfluss.

7) **Codex-Aufgabe: Würfel & Rechner als React-Komponenten (erledigt)**
   - `src/features/dice/services/*` in Komponenten mit lokalem State überführt.
   - `legacy.ts`-Abhängigkeiten entfernt und direkte DOM-Updates ersetzt.

8) **Codex-Aufgabe: Save/Load UI sauber modularisieren (erledigt)**
   - `SaveControlsSection` bindet die Save/Load-UI mit Character- und Magic-State ein.
   - Tabs nutzen den Wrapper statt das Save/Load-Markup inline zu definieren.

9) **Codex-Aufgabe: Legacy-Bootstrap entfernen (erledigt)**
   - Entferne das Laden der Legacy-Skripte aus `src/main.tsx`.
   - Stelle sicher, dass alle Funktionen durch React-Logik abgedeckt sind.

10) **Codex-Aufgabe: Aufräumen & Stabilisierung**
   - Lösche obsolet gewordene Dateien in `legacy/` und nicht mehr benötigte Services.
   - Konsolidiere die Dokumentation, damit Onboarding schneller und klarer wird.
