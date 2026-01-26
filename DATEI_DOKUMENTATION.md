# Dateiübersicht und Zweck der Bestandteile

Dieses Projekt ist ein Digitaler Charakterbogen für ein selbst erfundenes pen and paper system basierend auf DSA
Das Projektziel ist das hier in einer TypeScript/Light React/Vite version um zu bauen, ohne jegliche css frameworks/bibiliotheken außer scss zu bauen.

Diese Dokumentation beschreibt die Aufgaben der Dateien im Repository **Pen-And-Paper-System**. Sie ist nach Ordnern gegliedert und erklärt, welche Teile der Anwendung (Charakterbogen, Magiesystem, Shop, Layout usw.) die jeweiligen Dateien abdecken.

## Wurzelebene des Repos

- **README.md**
  - Enthält Regeln, Klassenkosten, Beispielaufträge sowie Berechnungsformeln für Charakterwerte. Dient als Regel- und Referenzdokumentation für Spielleiter und Spieler.
- **index.html**
  - Einstiegspunkt für die neue Vite/React-Dokumentation (Root-Div + TSX-Bundle).
- **package.json**
  - Vite/React-Setup inkl. Scripts und Abhängigkeiten für die Dokumentations-App.
- **tsconfig.json**
  - TypeScript-Konfiguration für den React-Code im Ordner `src/`.
- **tsconfig.node.json**
  - TypeScript-Konfiguration für die Vite-Konfiguration.
- **vite.config.ts**
  - Vite-Konfiguration (React-Plugin).
- **preislisteKomplett.json**
  - Umfangreiche Preisliste (DSA 4.0/4.1) mit Abschnitten zu Maßen, Gewichten und Ausrüstung. Dient als Datenquelle für Wirtschaft/Shop oder als Referenz.
- **shopData.json**
  - Shop-Katalog (Kategorien + Items mit Preis/Währung), der im Shop-Tab geladen und angezeigt wird.
- **test.js**
  - Leere Datei (Platzhalter für Tests oder spätere Skripte).

## Ordner `assets/`

- **assets/pappenheimer.jpg**
  - Bild-Asset (z. B. für Layout/Illustration).
- **assets/wood.jpg**
  - Hintergrundtextur für das UI (wird im CSS als Body-Background verwendet).

## Ordner `charbogen/`

- **charbogen/charakter.json**
  - Beispiel-/Vorlagendatei für den Charakterbogen (Struktur für Charakterinfo, Werte, Geld, Fähigkeiten, Magie, Inventar).
- **charbogen/InfoListe.json**
  - Datenquelle für Rassen- und Klassenlisten, strukturiert nach Kategorien. Wird beim Laden der Seite in Dropdowns übernommen.

## Ordner `src/script/`

### Kernlogik für Charakterbogen

- **src/script/adjustments.tsx**
  - Enthält Standard-Steigerungswerte (z. B. Attribute, Magie, Talente) und passt diese dynamisch an die gewählte Klassenkategorie an.
- **src/script/calculations.tsx**
  - Berechnet abgeleitete Werte (LP, AUSD, MB, ASP, MR, Giftresistenz, Basiswerte etc.) aus Eingaben und synchronisiert Steigerungspunkte mit dem Magiesystem. Enthält zudem die automatische Skill-Verteilung.
- **src/script/characterAttributes.tsx**
  - Generiert die dynamischen UI-Abschnitte für Attribute/Talente (inkl. Kampf-Talente) und befüllt bestehende Container. Verantwortlich für das Rendern von Eingabefeldern und Tooltips.
- **src/script/characterInfo.tsx**
  - Lädt und speichert die Charakter-Stammdaten (Name, Alter, Klasse usw.) zwischen JSON und UI.
- **src/script/inputListeners.tsx**
  - Verwaltet Event-Listener für automatische Berechnungen und Steigerungspunkte. Enthält Funktionen zum Setzen von Min/Max-Werten für Eingabefelder.
- **src/script/hideButtons.tsx**
  - Ermöglicht das Ausblenden einzelner Eingabefelder und verschiebt sie in den Tab „Ausgeblendete“, inkl. Wiederherstellungsfunktion.

### Magie- und Zaubersystem

- **src/script/vanillaMagicSystem.tsx**
  - Implementiert das Magiesystem: Datenmodelle, UI-Rendering, Steigerungskosten, Element-Anforderungen, Synchronisierung mit dem Charakterbogen sowie Speichern/Laden.

### Speichern/Laden und Datenfluss

- **src/script/saveLoader.tsx**
  - Zentrales Speicher-/Ladesystem für Charakterdaten. Migriert ältere Magiestrukturen, synchronisiert Inventar, Geldbeutel, Magiesystem und Charakterwerte, und erzeugt JSON-Downloads.

### Inventar/Shop

- **src/script/shop.tsx**
  - Lädt Shop-Daten aus `shopData.json`, rendert Kategorien/Items, verwaltet Käufe, Inventar und Wallet-Umrechnung.

### Werkzeuge (Würfel & Rechner)

- **src/script/dice.tsx**
  - Würfelsystem mit Anzeige der Würfelergebnisse als SVG-Oktaeder, inklusive Sonderlogik (z. B. d20/d100 Auswahl).
- **src/script/spezialDice.tsx**
  - Experimentelles Skript für „gute/schlechte“ Würfel-Logik (derzeit nur Logging).
- **src/script/rechner.tsx**
  - Einfacher Taschenrechner im Werkzeuge-Tab (String-Ausdruck + `eval`).

### UI/UX & Komfort

- **src/script/tabs.tsx**
  - Tab-Steuerung der Oberfläche und Logik für den „Ausgeblendete“-Tab.
- **src/script/skin.tsx**
  - Anpassungen für Schriftart und Textfarbe im UI.
- **src/script/wallet.tsx**
  - Wallet-/Währungsverwaltung (Dukaten, Silber, Heller, Kreuzer) inkl. Anzeige und Umrechnung.
- **src/script/liste.tsx**
  - Lädt `InfoListe.json` und füllt die Dropdowns für Rassen und Klassen, inklusive Klassenkategorien für Steigerungsanpassungen.

## Ordner `style/`

### SCSS-Quellen

- **style/main.scss**
  - Einstiegspunkt für das Stylesheet. Bindet die SCSS-Module ein.
- **style/_variables.scss**
  - Zentrale Variablen (Farben, Typografie, Abstände) und Hilfsklassen.
- **style/_base.scss**
  - Grundlegendes Reset/Global-Styles und Body-Styling.
- **style/_layout.scss**
  - Layout-Regeln (Spalten, Container, Flexbox, responsive Anpassungen), einschließlich Würfel- und Rechner-Layout.
- **style/_components.scss**
  - Styling für Buttons, Inputs, Wallet-Abschnitt und Inventar-/Shop-Komponenten.
- **style/_tabs.scss**
  - Tabs-Layout und visuelle Steuerung der Tab-Navigation.
- **style/_vanillaMagicSystem.scss**
  - Spezifische Styles für das Magiesystem (Karten, Listen, Buttons, Statusboxen).

### Generierte Assets

- **style/main.css**
  - Kompilierte CSS-Datei aus den SCSS-Quellen.
- **style/main.css.map**
  - Source Map zur Debug-Unterstützung im Browser.

## Ordner `legacy/`

- **legacy/index.html**
  - Ehemalige Hauptoberfläche des Charakterbogens (aus der Wurzelebene verschoben, bleibt als Referenz erhalten).

## Ordner `src/`

- **src/main.tsx**
  - Einstiegspunkt der React-App, rendert das Dokumentations-UI.
- **src/App.tsx**
  - Grundgerüst der Dokumentations-Seite (Placeholder-Inhalte).
- **src/styles/main.scss**
  - SCSS-Basisstyles für die neue Dokumentations-App (ohne Frameworks).
