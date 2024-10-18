// Laden der JSON-Daten und Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    fetch('../charbogen/InfoListe.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok');
            }
            return response.json();
        })
        .then(data => {
            const klassenSelect = document.getElementById('klassen-select');
            const rassenSelect = document.getElementById('rassen-select');

            // Klassen hinzufügen
            const klassen = data.Klassen;
            for (const kategorie in klassen) {
                if (klassen.hasOwnProperty(kategorie)) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = kategorie;
                    klassen[kategorie].forEach(klasse => {
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
                    rassen[kategorie].forEach(rasse => {
                        const option = document.createElement('option');
                        option.value = rasse;
                        option.text = rasse;
                        optgroup.appendChild(option);
                    });
                    rassenSelect.appendChild(optgroup);
                }
            }

            // Setze die Klassenkategorien für adjustments.js
            setKlassenKategorien(klassen);

            // Event Listener für das Klassen-Dropdown
            klassenSelect.addEventListener('change', function () {
                const selectedClass = this.value;
                setKlassenVariable(selectedClass);
            });

            // Wenn bereits eine Klasse ausgewählt ist (z.B. beim Laden aus der JSON-Datei)
            const initialClass = klassenSelect.value;
            if (initialClass) {
                setKlassenVariable(initialClass);
            }
        })
        .catch(error => console.error('Error fetching JSON:', error));
});
