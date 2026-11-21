# Regeln und Datenfluss

Die veröffentlichte JavaScript-Version auf `main` bei `80bde76`, der React-Zwischenstand `DEV` bei `08d7e43` und das [Hausregelwerk](../README.md#regeln) sind die Referenzstände für den Neuaufbau. Im alten Bogen lasen und schrieben DOM-Listener, der Save-Loader und das Magiemodul dieselben Felder zu unterschiedlichen Zeitpunkten. Im Neubau gibt es einen Charakterzustand, explizite Aktionen und einen Selektor mit einem Cache je Formel.

## Gespeicherte Eingaben und Ableitungen

Das Modell speichert Profil, XP, verrechnete Ausgaben und ausdrücklich bewilligte Bonuspunkte, Attribute, Modifikatoren, Talente, manuelle Kampfwerte, aktuelle Ressourcen, Magieeinträge, Münzstückelung, Inventar und ausgeblendete Einträge. Die Benutzeroberfläche liest Level, Guthaben, Maximalwerte, Kampfbasen, Grenzen und Gesamtgeld aus dem Selektor. Die JSON-Ausgabe enthält auch abgeleitete Felder als Kompatibilitätswerte für ältere Leser.

| Ergebnis | Eingaben und Berechnung |
| --- | --- |
| Stufe | Bis 899 XP `floor(XP / 150) + 1`. Von 900 bis 4949 XP `floor((XP − 750) / 600) + 7`. Ab 4950 XP `floor((XP − 4950) / 1200) + 14`. |
| Verfügbare Steigerungspunkte | `Stufe × 30 + 100 + Bonus − Gesteigerte`. |
| Maximale LP | `LP-Modifikator × 3 + Stufe × 6 + 20 + Konstitution`. |
| Maximale Ausdauer | `Maximale LP + Willenskraft`. |
| Magiebegabung | `Summe der Stufen aller Magieeinträge + Magiemodifikator`. |
| Maximale ASP | `Stufe × 6 + ASP-Modifikator × 2 + Magiebegabung`. |
| Magieresistenz | `Math.round((Magiebegabung + Stufe + Klugheit) / 3)`. |
| Giftresistenz | `Math.round(Maximale Ausdauer / 10 + Giftmodifikator)`. |
| Wurf- und Schusswaffen-Basis | `Math.round((Intuition + Fingerfertigkeit + Körperkraft) / 4)`. Ein gemeinsames Ergebnis. |
| Attacke-Basis | `Math.round((Konstitution + Gewandtheit + Körperkraft) / 5)`. |
| Parade-Basis | `Math.round((Intuition + Gewandtheit + Körperkraft) / 5)`. |
| Schnelligkeit | `Math.round((Körperkraft + Gewandtheit + Sinnesschärfe) / 4)`. |
| Geld in Kreuzern | `1000 × Dukaten + 100 × Silberlinge + 10 × Heller + Kreuzer`. |

Jede Formel erhält die tatsächlich verwendeten Eingaben. Eine Änderung an Willenskraft kann maximale Ausdauer und Giftresistenz aktualisieren. Ein neuer Inventarposten löst keine Charakterformel aus. Ein Shopkauf berechnet den Geldstand und ändert Geld und Inventar als eine Aktion. Ansichten wechseln ohne Spielaktion. Numerische Bearbeitung verwendet bestätigte Werte und berechnet keinen leeren Zwischenstand. Aktuelle LP, Ausdauer und ASP bleiben bei einer Änderung ihrer Maximalwerte erhalten.

## Spielaktionen

- **Steigern und senken.** Eine bestätigte Differenz wird einmal pro Feld zum geltenden Klassentarif verrechnet. Der Standard beträgt 5 für Attribute und Kampf-Talentwerte, 10 für Modifikatoren und 3 für übrige Talente. Die Tarifüberschreibungen je Klasse liegen in `src/domain/advancement.ts`. Klugheit kostet bei wissenschaftlichen Klassen 3 und Körperkraft bei Nahkampfklassen 3. Die Körperkraft-Zeile der alten README-Tabelle war gegenüber dem Text und der Kostentabelle im Code verschoben.
- **Grenzen.** Attribute 7 bis Stufe + 12, Talente −3 bis Stufe + 10, jeweils maximal 21. Modifikatoren 0 bis Stufe + 2. Separate AT/PA-Werte und aktuelle Ressourcen sind eigene Eingaben. Eine Datei kann Altwerte außerhalb der Regeln mitbringen. Beim Korrigieren eines solchen Werts bleibt der alte Stand bis zur bestätigten Bearbeitung erhalten.
- **Budget.** Eine positive reguläre Steigerung braucht genügend Punkte. Senken erstattet zum aktuellen Tarif. Klassenauswahl ändert spätere Kosten. Kostenloses Steigern ist in den Einstellungen sichtbar. Manuelle Zusatzpunkte erscheinen in der Rechnung als Bonus. Die Min/Max-Ansicht zeigt Anzahl und Saldo der anschließend gemeinsam gebuchten Änderungen.
- **Kampf.** Die automatische Verteilung wird auf Klick ausgeführt. Nahkampf teilt den Talentwert in zwei Teile, bei ungeraden Werten erhält AT den Rest. Bei −3 ist die Verteilung −2 und −1. Schild verwendet für PA die Parade-Basis plus Talentwert. Wurf- und Schusswaffen verwenden für AT die jeweilige Fernkampfbasis plus Talentwert. Manuelle Felder können danach wieder einzeln bearbeitet werden.
- **Magie.** Das Anlegen einer Kombination aus Element und Spezialisierung mit Stufe 1–21 und das Löschen sind wie in der Live-Version frei. Die regulären Stufenaufstiege von 1→2 bis 20→21 kosten nacheinander `2, 4, 6, 9, 12, 15, 18, 22, 26, 30, 34, 38, 43, 48, 53, 58, 64, 70, 76, 82`. Klassenpreise, Gratissteigerungen, das Limit des älteren Elementmodells und Absprachen über Zauberproben gehören zum Regelwerk für den Spieltisch. Eigene Elemente und der Modus für kostenloses Steigern stehen für abgesprochene Sonderfälle zur Verfügung.
- **Freigabeentscheidungen.** Die bisher übersprungene Stufe 6 gilt jetzt bei 750–899 XP. Die Grenzen ab Stufe 7 gelten wie in der Abnahme festgelegt. Der negative AT/PA-Anteil addiert sich jetzt exakt zum Talentwert. Das Guthaben wird in Bogen und Magie identisch geprüft.

## Dateien und lokaler Speicher

Der Adapter in `src/storage` liest aktuelle Charakterdateien und historische Varianten. Dazu zählen die Spielstände mit Singleton-Arrays, Talent-Dictionaries, getrennten Kampfwerten, dem Feld `Magische_Elemente`, dem Inventarfeld `count` und historische reine Magiedateien. Zusätzliche Felder und nicht zuordenbare Inhalte werden als Altdaten mitgeführt. Der Testbestand enthält Beispiele aus der Projektgeschichte.

Importierte Ausgaben haben Vorrang vor einem widersprechenden Guthaben. Änderungen durch die neue XP-Kurve erscheinen in der Importvorschau. Fehlen Ausgaben, kann ein gespeicherter Rest bei der Rekonstruktion helfen. Zustand und Auswahl wechseln erst nach Bestätigung. Eine reine Magiedatei lässt sich vollständig als eigener Charakter übernehmen oder ersetzt gezielt die Magieliste des geöffneten Charakters.

IndexedDB speichert mehrere Charaktere und merkt sich den zuletzt geöffneten Stand in diesem Browser. Jede akzeptierte Änderung geht in eine einzelne Schreibfolge pro Charakter. Die erwartete Revision wird innerhalb derselben Transaktion geprüft wie der Schreibvorgang. Bei einem Konflikt kann der lokale Entwurf als neue Kopie oder JSON gesichert werden. JSON ist der Weg für Backups und Gerätewechsel. Das Leeren von Browserdaten entfernt den lokalen Bestand.

## Bauen und prüfen

- `npm ci` und `npm run dev` starten die Entwicklung mit Node 22 ab 22.12.
- `npm test` prüft Regeln, einzelne Berechnungsauslöser, Migration und Transaktionen.
- `npm run build` prüft die Typen und erzeugt die statische Anwendung in `dist/`.
- `npx playwright install chromium webkit` und `npm run test:e2e` prüfen die gebaute Oberfläche in beiden Browser-Engines. Die native Dateiauswahl auf einem Gerät bleibt Teil der Sichtabnahme.
- Netlify baut die Deploy Preview vom Pull Request und die veröffentlichte Version von `main`. Vor einem Merge die Vorschau öffnen und einen JSON-Rundlauf prüfen.
