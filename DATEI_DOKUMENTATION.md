# Dateiübersicht und Zweck der Bestandteile

Dieses Projekt ist ein digitaler Charakterbogen für ein selbst erfundenes Pen-and-Paper-System (basierend auf DSA). Ziel ist der Umbau in eine TypeScript/Light-React/Vite-Version, ohne CSS-Frameworks außer SCSS.

Diese Dokumentation beschreibt die Aufgaben der Dateien im Repository **Pen-And-Paper-System**. Sie ist nach Ordnern gegliedert und erklärt, welche Teile der Anwendung (Charakterbogen, Magiesystem, Shop, Layout usw.) die jeweiligen Dateien abdecken.

## Wurzelebene des Repos

- **README.md**
  - Enthält Regeln, Klassenkosten, Beispielaufträge sowie Berechnungsformeln für Charakterwerte. Dient als Regel- und Referenzdokumentation.
- **index.html**
  - Einstiegspunkt für die Vite/React-App (Root-Div + TSX-Bundle).
- **package.json**
  - Vite/React-Setup inkl. Scripts und Abhängigkeiten.
- **package-lock.json**
  - Lockfile für reproduzierbare npm-Installationen.
- **tsconfig.json**
  - TypeScript-Konfiguration für die React-Anwendung.
- **tsconfig.node.json**
  - TypeScript-Konfiguration für die Vite-Konfiguration.
- **tsconfig.test.json**
  - TypeScript-Konfiguration für Tests.
- **vite.config.ts**
  - Vite-Konfiguration (React-Plugin).
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
  - Einstiegspunkt der React-App, lädt die Styles und initialisiert die Legacy-Skripte (Charakter/Shop/Würfel) als Übergang.
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
- **src/features/character/index.ts**
  - Sammel-Exports für Context, UI-Teile und Save/Load-Helfer.
- **src/features/character/legacy.ts**
  - Lädt die bisherigen DOM-basierten Services (Übergangscode).

#### Charakter-Services (`src/features/character/services/`)

- **adjustments.ts**
  - Standard-Steigerungswerte und Klassenanpassungen.
- **calculations.ts**
  - Berechnung abgeleiteter Werte (LP, AUSD, MB, ASP, MR, Giftresistenz) sowie Auto-Skill-Verteilung.
- **characterInfo.ts**
  - Laden/Speichern der Stammdaten (Name, Alter, Klasse usw.).
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

- **src/features/shop/index.ts**
  - Index/Exports für Shop-Logik (Legacy-Anbindung).
- **src/features/shop/legacy.ts**
  - Lädt die DOM-basierten Shop-/Wallet-Services.
- **src/features/shop/services/shop.ts**
  - Shop-Rendering, Käufe und Inventar-Handling.
- **src/features/shop/services/wallet.ts**
  - Wallet-/Währungsverwaltung (Dukaten, Silber, Heller, Kreuzer).

### Feature: Würfel & Rechner

- **src/features/dice/index.ts**
  - Index/Exports für Würfel-Logik.
- **src/features/dice/legacy.ts**
  - Lädt die DOM-basierten Würfel-/Rechner-Skripte.
- **src/features/dice/services/dice.ts**
  - Würfelsystem inkl. d20/d100 Logik und Ergebnisanzeige.
- **src/features/dice/services/spezialDice.ts**
  - Experimentelle „gute/schlechte“ Würfel-Logik (Logging).
- **src/features/dice/services/rechner.ts**
  - Taschenrechner (String-Ausdruck + `eval`).

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
- Shop/Würfel/Rechner-Logik wurde in Services ausgelagert und aus React heraus angesteuert.

### Was noch zu migrieren ist (weil aktuell noch Legacy-Skripte benötigt werden)

- **DOM-Logik in `services/` → React-State/Komponenten:** Charakterberechnungen, Listener, Hide-Buttons, Tabs, Wallet und Shop hängen noch direkt am DOM.
- **UI-Abschnitte mit Legacy-IDs:** Viele Inputs/Container werden noch per ID gesucht (z. B. `attribute_*`, `shop`, `inventory`). Diese müssten in React-Components überführt werden.
- **Global-Funktionen auf `window`:** Tabs rufen Legacy-Funktionen wie `Roll`, `TheChoosenOne`, `updateCharakterCalculation` usw. auf. Das sollte in lokale Hooks/Services umgebaut werden.
- **Datei-Import/Export an React binden:** Save/Load ist bereits ausgelagert, aber die UI ist noch Teil des großen Tab-Markups; eine saubere Trennung in eigenständige Komponenten fehlt.

### Hinweis zum aktuellen Stand

Da `src/main.tsx` weiterhin die Legacy-Skripte lädt und die Tabs `window`-Funktionen aufrufen, funktioniert die App nur, wenn die DOM-Struktur exakt der bisherigen Struktur entspricht. Die Migration muss daher die DOM-Abhängigkeiten schrittweise entfernen und die Logik in React-State + Komponenten überführen.
