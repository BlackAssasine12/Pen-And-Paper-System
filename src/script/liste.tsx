import { setKlassenVariable } from "./adjustments";
import type { KlassenKategorien } from "../types/character";

type InfoListeData = {
    Klassen: KlassenKategorien;
    Rassen: KlassenKategorien;
};

// Laden der JSON-Daten und Initialisierung
const initializeListe = () => {
    const baseUrl = import.meta.env.BASE_URL ?? "/";
    fetch(`${baseUrl}charbogen/InfoListe.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return response.json();
        })
        .then((data: InfoListeData) => {
            const klassenSelect = document.getElementById('klassen-select');
            const rassenSelect = document.getElementById('rassen-select');
            if (!(klassenSelect instanceof HTMLSelectElement) || !(rassenSelect instanceof HTMLSelectElement)) {
                return;
            }

            // Klassen hinzufügen
            const klassen = data.Klassen;
            for (const kategorie in klassen) {
                if (klassen.hasOwnProperty(kategorie)) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = kategorie;
                    klassen[kategorie].forEach((klasse) => {
                        const option = document.createElement('option');
                        option.value = klasse;
                        option.text = klasse;
                        optgroup.appendChild(option);
                    });
                    klassenSelect.appendChild(optgroup);
                }
            }

            // Rassen hinzufügen
            const rassen = data.Rassen;
            for (const kategorie in rassen) {
                if (rassen.hasOwnProperty(kategorie)) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = kategorie;
                    rassen[kategorie].forEach((rasse) => {
                        const option = document.createElement('option');
                        option.value = rasse;
                        option.text = rasse;
                        optgroup.appendChild(option);
                    });
                    rassenSelect.appendChild(optgroup);
                }
            }

            // Event Listener für das Klassen-Dropdown
            klassenSelect.addEventListener('change', function (event) {
                const target = event.target as HTMLSelectElement | null;
                const selectedClass = target?.value ?? "";
                setKlassenVariable(selectedClass, klassen);
            });

            // Wenn bereits eine Klasse ausgewählt ist (z.B. beim Laden aus der JSON-Datei)
            const initialClass = klassenSelect.value;
            if (initialClass) {
                setKlassenVariable(initialClass, klassen);
            }
        })
        .catch(error => console.error('Error fetching JSON:', error));
};

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', initializeListe);
} else {
    initializeListe();
}
