# Arbeit am Charakterbogen

- Die Anwendung ist ein statisches React-/TypeScript-Frontend für Blacks DSA-3-Hausregeln. Änderungen an Regeln brauchen einen konkreten Rechenfall und eine Aktualisierung von [Regeln und Datenfluss](docs/regeln-und-datenfluss.md).
- Spieleingaben und Aktionen liegen in `src/domain`. Oberflächen lesen die abgeleiteten Werte vom Charakterselektor. Logik für Regeln, Guthaben oder Währungsumrechnung gehört in die Domäne.
- `src/storage` ist die Schnittstelle für IndexedDB und JSON. Eine neue Importvariante braucht eine Fixture. Erhalte manuelle Werte, unerkannte Altdaten und den aktiven Charakter bei Fehlern.
- Führe `npm test`, `npm run build` und für geänderte Spielflüsse `npm run test:e2e` aus. Verwende Node 22 ab 22.12.
- Arbeite auf einem eigenen Branch. Ein Merge nach `main` baut den Produktivstand auf Netlify.
