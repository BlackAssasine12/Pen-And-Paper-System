# Dateiübersicht und Zweck der Bestandteile

Diese Dokumentation beschreibt die Aufgaben der Dateien im Repository **Pen-And-Paper-System**. Sie ist nach Ordnern gegliedert und erklärt, welche Teile der Anwendung (Charakterbogen, Magiesystem, Shop, Layout usw.) die jeweiligen Dateien abdecken.

## Wurzelebene des Repos

- **README.md**
  - Enthält Regeln, Klassenkosten, Beispielaufträge sowie Berechnungsformeln für Charakterwerte. Dient als Regel- und Referenzdokumentation für Spielleiter und Spieler.
- **index.html**
  - Hauptoberfläche (Charakterbogen). Definiert Tabs (Charakter, Magie, Ausgeblendete, Inventar & Shop, Werkzeuge, Einstellungen), Eingabefelder, Steuerelemente und die Grundstruktur für alle UI-Module.
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

## Ordner `script/`

### Kernlogik für Charakterbogen

- **script/adjustments.js**
  - Enthält Standard-Steigerungswerte (z. B. Attribute, Magie, Talente) und passt diese dynamisch an die gewählte Klassenkategorie an.
- **script/calculations.js**
  - Berechnet abgeleitete Werte (LP, AUSD, MB, ASP, MR, Giftresistenz, Basiswerte etc.) aus Eingaben und synchronisiert Steigerungspunkte mit dem Magiesystem. Enthält zudem die automatische Skill-Verteilung.
- **script/characterAttributes.js**
  - Generiert die dynamischen UI-Abschnitte für Attribute/Talente (inkl. Kampf-Talente) und befüllt bestehende Container. Verantwortlich für das Rendern von Eingabefeldern und Tooltips.
- **script/characterInfo.js**
  - Lädt und speichert die Charakter-Stammdaten (Name, Alter, Klasse usw.) zwischen JSON und UI.
- **script/inputListeners.js**
  - Verwaltet Event-Listener für automatische Berechnungen und Steigerungspunkte. Enthält Funktionen zum Setzen von Min/Max-Werten für Eingabefelder.
- **script/hideButtons.js**
  - Ermöglicht das Ausblenden einzelner Eingabefelder und verschiebt sie in den Tab „Ausgeblendete“, inkl. Wiederherstellungsfunktion.

### Magie- und Zaubersystem

- **script/vanillaMagicSystem.js**
  - Implementiert das Magiesystem: Datenmodelle, UI-Rendering, Steigerungskosten, Element-Anforderungen, Synchronisierung mit dem Charakterbogen sowie Speichern/Laden.

### Speichern/Laden und Datenfluss

- **script/saveLoader.js**
  - Zentrales Speicher-/Ladesystem für Charakterdaten. Migriert ältere Magiestrukturen, synchronisiert Inventar, Geldbeutel, Magiesystem und Charakterwerte, und erzeugt JSON-Downloads.

### Inventar/Shop

- **script/shop.js**
  - Lädt Shop-Daten aus `shopData.json`, rendert Kategorien/Items, verwaltet Käufe, Inventar und Wallet-Umrechnung.

### Werkzeuge (Würfel & Rechner)

- **script/dice.js**
  - Würfelsystem mit Anzeige der Würfelergebnisse als SVG-Oktaeder, inklusive Sonderlogik (z. B. d20/d100 Auswahl).
- **script/spezialDice.js**
  - Experimentelles Skript für „gute/schlechte“ Würfel-Logik (derzeit nur Logging).
- **script/rechner.js**
  - Einfacher Taschenrechner im Werkzeuge-Tab (String-Ausdruck + `eval`).

### UI/UX & Komfort

- **script/tabs.js**
  - Tab-Steuerung der Oberfläche und Logik für den „Ausgeblendete“-Tab.
- **script/skin.js**
  - Anpassungen für Schriftart und Textfarbe im UI.
- **script/wallet.js**
  - Wallet-/Währungsverwaltung (Dukaten, Silber, Heller, Kreuzer) inkl. Anzeige und Umrechnung.
- **script/liste.js**
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
