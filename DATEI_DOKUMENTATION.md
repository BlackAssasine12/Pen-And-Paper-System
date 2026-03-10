Pen-And-Paper-System/
├── public/                                     # Statische Dateien (ohne Verarbeitung durch Vite)
│   ├── charbogen/
│   │   └── charakter.json                      # Das leere Standard-Template für neue Charaktere
│   ├── preislisteKomplett.json                 # Globale Liste von Preisen
│   └── shopData.json                           # Datenbank für alle kaufbaren Gegenstände
├── src/                                        # Der eigentliche Quellcode (React + TypeScript)
│   ├── components/                             # Globale, funktionsübergreifende UI-Komponenten
│   │   ├── Tabs.tsx                            # Hauptnavigation und zentraler Zustand (State)
│   │   └── TopControls.tsx                     # Die oberen Buttons (z.B. Auto-Skill, Ansichtsoptionen)
│   ├── features/                               # Nach Funktionen getrennte Logik & UI
│   │   ├── character/                          # Alles rund um den Charakterbogen
│   │   │   ├── components/                     # UI-Teile (Attribute, Talente, Lebenspunkte etc.)
│   │   │   ├── hooks/          
│   │   │   │   └── useCharacterCalculations.ts # Verbindet Eingaben mit P&P-Mathematik
│   │   │   ├── services/                       # Die "Gehirne" des Charakterbogens (reine Logik)
│   │   │   │   ├── derivedCalculations.ts      # Echte P&P Formeln (LP, Ausdauer, Attacke)
│   │   │   │   ├── adjustments.ts              # Kosten & Multiplikatoren für Level-Ups
│   │   │   │   └── saveLoader.ts               # JSON speichern, laden und exportieren
│   │   │   └── CharacterContext.tsx            # Globaler State für Erfahrungspunkte (XP)
│   │   ├── dice/                               # Würfel- und Taschenrechner-Feature
│   │   │   ├── components/                     # UI für den Würfel-Reiter
│   │   │   └── services/       
│   │   │       └── dice.ts                     # Logik für Zufallszahlen (W20, W6 etc.)
│   │   ├── magic/                              # Magiesystem
│   │   │   └── VanillaMagicSystem.tsx          # Magie-UI und Logik
│   │   └── shop/                               # Inventar & Geld
│   │       ├── components/                     # UI für Laden, Rucksack und Geldbeutel
│   │       ├── services/
│   │       │   └── wallet.ts                   # Logik für Währungsumrechnung und Bezahlen
│   │       └── ShopContext.tsx                 # Globaler State für Inventar und Finanzen
│   ├── styles/                                 # SCSS Dateien für das Design (Farben, Layout)
│   ├── types/                                  # TypeScript-Typdefinitionen (z.B. wie sieht 'CharacterData' aus)
│   ├── App.tsx                                 # Die Wurzel-Komponente, die alles zusammenhält
│   └── main.tsx                                # Startpunkt von React (hängt App in die index.html)
└── index.html                                  # Die einzige HTML-Datei, in der das React-Projekt läuft