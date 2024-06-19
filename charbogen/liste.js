document.addEventListener('DOMContentLoaded', () => {
    fetch('./charbogen/InfoListe.json')
        .then(response => response.json())
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

            // Event Listener für das Klassen-Dropdown
            klassenSelect.addEventListener('change', function() {
                const selectedClass = this.value;
                const variable = setKlassenVariable(selectedClass, data.Klassen);
                console.log(`Die Variable für die Klasse "${selectedClass}"`);
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
});
