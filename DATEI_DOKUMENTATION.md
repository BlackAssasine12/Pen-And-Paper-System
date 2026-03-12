Pen-And-Paper-System/
├── public/                                     # Statische Dateien (ohne Verarbeitung durch Vite)
│   ├── charbogen/
│   │   ├── charakter.json                      # Das leere Standard-Template für neue Charaktere
│   │   └── InfoListe.json                      # Datenbank für Tooltips oder Beschreibungen von Talenten/Zaubern
│   ├── preislisteKomplett.json                 # Globale Liste von Preisen für Berechnungen
│   └── shopData.json                           # Datenbank für alle kaufbaren Gegenstände
│
├── src/                                        # Der eigentliche Quellcode (React + TypeScript)
│   ├── components/                             # Globale, funktionsübergreifende UI-Komponenten
│   │   ├── Tabs.tsx                            # Hauptnavigation, um zwischen Charakter, Shop, Magie etc. zu wechseln
│   │   └── TopControls.tsx                     # Die oberen Buttons (z.B. Auto-Skill, Ansichtsoptionen)
│   │
│   ├── features/                               # Nach Funktionen getrennte Logik & UI
│   │   │
│   │   ├── character/                          # Alles rund um den Charakterbogen
│   │   │   ├── components/                     # Die einzelnen visuellen Bausteine des Charakterbogens
│   │   │   │   ├── AttributesSection.tsx       # Zeigt die Hauptattribute (z.B. Stärke, Klugheit) an
│   │   │   │   ├── CombatBaseSection.tsx       # UI für die Basis-Kampfwerte (z.B. Attacke-Basis, Parade-Basis)
│   │   │   │   ├── CombatTalentsSection.tsx    # UI für Waffen- und Kampffähigkeiten
│   │   │   │   ├── HiddenAttributesSection.tsx # Versteckte Attribute, die z.B. nur für den Meister relevant sind
│   │   │   │   ├── HiddenTalentsSection.tsx    # Geheime Talente, die nicht immer sichtbar sein sollen
│   │   │   │   ├── ModifiersSection.tsx        # UI für Modifikatoren
│   │   │   │   ├── SaveControlsSection.tsx     # Die Buttons zum Speichern/Laden visuell im Bogen eingebunden
│   │   │   │   ├── SonderwerteSection.tsx      # Spezielle abgeleitete Werte wie Karmaenergie, Lebenspunkte, Ausdauer
│   │   │   │   └── TalentSections.tsx          # Übersicht der weltlichen Talente (Natur, Gesellschaft, Handwerk)
│   │   │   ├── hooks/                          # Eigene React-Hooks (wiederverwendbare Zustands-Logik)
│   │   │   │   └── useCharacterCalculations.ts # Verbindet Eingaben der UI mit der P&P-Mathematik aus den Services
│   │   │   ├── services/                       # Die "Gehirne" des Charakterbogens (reine Logik, keine UI)
│   │   │   │   ├── adjustments.ts              # Kosten & Multiplikatoren für Level-Ups und Steigerungen
│   │   │   │   ├── autoSkillDistribution.ts    # Logik für das automatische Verteilen von Erfahrungspunkten/Werten
│   │   │   │   ├── calculations.ts             # Allgemeine Mathematik-Hilfsfunktionen für den Bogen
│   │   │   │   ├── characterInfo.ts            # Verwaltet Meta-Infos wie Name, Rasse, Profession
│   │   │   │   ├── characterState.ts           # Logik zum Verwalten des aktuellen Zustands (Lebend, Bewusstlos etc.)
│   │   │   │   ├── derivedCalculations.ts      # Echte P&P Formeln (wie sich LP aus Attributen berechnen)
│   │   │   │   ├── hideButtons.ts              # Logik zum Ausblenden bestimmter Bereiche (für mehr Übersichtlichkeit)
│   │   │   │   ├── inputListeners.ts           # Überwacht Tastatureingaben oder Klicks der Benutzer
│   │   │   │   ├── liste.ts                    # Hilfsfunktionen zum Arbeiten mit Listen (z.B. Inventar-Arrays)
│   │   │   │   ├── maxValueSettings.ts         # Definiert die maximal erlaubten Werte für Eigenschaften/Talente
│   │   │   │   ├── saveLoader.ts               # Wandelt den Code-Zustand in JSON um (Speichern) und zurück (Laden)
│   │   │   │   ├── skin.ts                     # Logik für optische Anpassungen (Themes/Farben) des Bogens
│   │   │   │   └── tabs.ts                     # Hilfslogik speziell für die Charakter-internen Reiter
│   │   │   ├── CharacterContext.tsx            # Globaler State für den Charakter (damit alle Komponenten die Werte kennen)
│   │   │   ├── CharacterNameInput.tsx          # Das simple Textfeld ganz oben für den Charakternamen
│   │   │   ├── ExperienceSection.tsx           # Zeigt Abenteuerpunkte (AP/XP) an und berechnet, was noch übrig ist
│   │   │   ├── index.ts                        # Bündelt Exporte, damit andere Ordner einfacher importieren können
│   │   │   └── SaveControls.tsx                # Hauptkomponente für die Speicher- und Ladeverwaltung
│   │   │
│   │   ├── dice/                               # Würfel- und Taschenrechner-Feature
│   │   │   ├── components/                     # Visuelle Elemente für das Würfeln
│   │   │   │   ├── Calculator.tsx              # Ein eingebauter Taschenrechner für schnelle P&P-Rechnungen
│   │   │   │   └── DiceRoller.tsx              # Die UI, in der man auf "W20" oder "W6" klickt und das Ergebnis sieht
│   │   │   ├── services/                       # Logik hinter den Würfeln
│   │   │   │   ├── dice.ts                     # Die mathematische Zufallsgenerierung (RNG) für Standardwürfel
│   │   │   │   ├── rechner.ts                  # Die Rechenlogik für den Calculator
│   │   │   │   └── spezialDice.ts              # Logik für besondere Würfe (z.B. Patzer/Kritisch-Tabellen)
│   │   │   └── index.ts                        # Bündelt Exporte für das Dice-Feature
│   │   │
│   │   ├── magic/                              # Magiesystem
│   │   │   ├── services/                       
│   │   │   │   └── vanillaMagicSystem.ts       # Logik für Astralenergie-Verbrauch, Zauberproben und Wirkungsdauer
│   │   │   ├── types.ts                        # Typdefinitionen speziell für Magie (z.B. wie ist ein 'Zauber' aufgebaut)
│   │   │   └── VanillaMagicSystem.tsx          # Visuelle Darstellung des Zauberbuchs und der Magiewerte
│   │   │
│   │   └── shop/                               # Inventar & Geld
│   │       ├── components/                     # Visuelle Ansichten für das Wirtschaftssystem
│   │       │   ├── InventoryPanel.tsx          # Der Rucksack des Spielers (was habe ich dabei?)
│   │       │   ├── ShopPanel.tsx               # Die Ansicht zum Einkaufen aus der shopData.json
│   │       │   └── WalletPanel.tsx             # Zeigt die aktuellen Münzen (Dukaten, Silber, Heller) an
│   │       ├── services/                       # Hintergrundlogik für das Einkaufen
│   │       │   ├── shop.ts                     # Logik, die prüft, ob ein Item existiert und kaufbar ist
│   │       │   └── wallet.ts                   # Währungsumrechnung (z.B. 10 Silber = 1 Gold) und Bezahllogik
│   │       ├── ShopContext.tsx                 # Stellt das Inventar und Geld allen Komponenten zur Verfügung
│   │       ├── store.ts                        # Oft eine Alternative zum Context, z.B. ein Zustand mit Zustand/Redux
│   │       └── index.ts                        # Bündelt Exporte für den Shop
│   │
│   ├── styles/                                 # SCSS (Erweitertes CSS) Dateien für das Design
│   │   ├── _base.scss                          # Grundlegende Stile (Schriftart, Hintergrundfarbe für die ganze App)
│   │   ├── _components.scss                    # Spezifisches Design für kleine Bausteine (Buttons, Input-Felder)
│   │   ├── _layout.scss                        # Definiert das Raster (Grids/Flexbox), wo was auf dem Bildschirm steht
│   │   ├── _tabs.scss                          # Das Design der Navigationsreiter
│   │   ├── _vanillaMagicSystem.scss            # Spezifisches Design nur für den Magie-Bereich
│   │   ├── _variables.scss                     # Speicherort für Farben (z.B. $primary-color: #ff0000), für leichtes Ändern
│   │   └── main.scss                           # Importiert alle anderen SCSS-Dateien und fügt sie zusammen
│   │
│   ├── types/                                  # TypeScript-Typdefinitionen (Der "Bauplan" für Daten)
│   │   ├── character.ts                        # Definiert, welche Eigenschaften ein Charakter in TypeScript haben MUSS
│   │   ├── react-shim.d.ts                     # Hilfsdatei, damit TypeScript React richtig versteht
│   │   └── vite-env.d.ts                       # Hilfsdatei, damit TypeScript mit Vite-spezifischen Dingen (wie Bild-Importen) klarkommt
│   │
│   ├── App.tsx                                 # Die Wurzel-Komponente, in der Tabs, TopControls und Features geladen werden
│   └── main.tsx                                # Startpunkt von React (nimmt die App.tsx und rendert sie in die index.html)
│
├── tests/                                      # Automatische Tests, um Fehler im Code zu finden, bevor man spielt
│   ├── adjustments.test.ts                     # Prüft, ob die Level-Up-Kosten-Logik fehlerfrei rechnet
│   ├── inputListeners.test.ts                  # Prüft, ob Tastendrücke richtig verarbeitet werden
│   └── saveLoader.test.ts                      # Testet, ob das Speichern/Laden Daten verliert (sehr wichtig!)
│
├── .eslintrc.cjs                               # Konfiguration für ESLint (Ein "Lehrer", der dich auf unsauberen Code hinweist)
├── .gitignore                                  # Sagt Git (Versionskontrolle), welche Dateien NICHT hochgeladen werden sollen (z.B. node_modules)
├── index.html                                  # Die einzige HTML-Datei, in der das React-Projekt läuft
├── package.json                                # Das "Herz" des Projekts: Listet alle Bibliotheken (wie React) auf, die benötigt werden
├── tsconfig.json                               # Sagt dem TypeScript-Compiler, wie streng er den Code prüfen soll
└── vite.config.ts                              # Einstellungen für Vite (das Tool, das deinen Code blitzschnell für den Browser übersetzt)