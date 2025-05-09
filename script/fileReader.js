// fileReader.js - Fehler beim Laden behoben

let myData;
let fileName;
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                myData = data;
                fileName = file.name;
                
                // Überprüfe die Struktur der Datei
                if (!data.charakter) {
                    throw new Error("Die Datei enthält keine gültige Charakterstruktur");
                }
                
                // Datenmigration für das neue Magiesystem
                migrateToNewMagieSystem(data);
                
                // Lade die verschiedenen Bereiche
                initializeWallet(data);
                generateCharakterAttributes(data);
                genCharInfo(data);
                bindHideButtons();
                
                // Inventar laden
                if (data.inventory) {
                    inventory = data.inventory; // Inventory-Objekt aktualisieren
                    loadInventory(data.inventory);
                }
                
                // Magiesystem laden
                loadMagieSystemData(data);
                
                // Berechnung aktualisieren erst nach dem Laden aller Daten
                updateCharakterCalculation();
                
                console.log("Datei erfolgreich geladen:", fileName);
            } catch (error) {
                console.error("Fehler beim Laden der Datei:", error);
                alert("Fehler beim Laden der Datei: " + error.message);
            }
        };
        reader.readAsText(file);
    }
    const filenameInput = document.getElementById('filenameInput');
    if (filenameInput && file) {
        filenameInput.value = file.name;
    }
});

// Funktion zur Migration alter Daten auf das neue Magiesystem
function migrateToNewMagieSystem(data) {
    try {
        // Stelle sicher, dass magieSystem existiert
        if (!data.magieSystem) {
            data.magieSystem = {
                advancementPoints: 0,
                magicAbilities: []
            };
        }
        
        // Falls alte Struktur vorhanden
        if (data.charakter && data.charakter.Magische_Elemente) {
            // Setze Steigerungspunkte, falls noch nicht gesetzt
            if (data.magieSystem.advancementPoints === 0 && data.charakter.werte && 
                data.charakter.werte.Steigerungspunkte !== undefined) {
                data.magieSystem.advancementPoints = data.charakter.werte.Steigerungspunkte;
            }
            
            // Konvertiere die alten Magischen Elemente, falls das neue Array leer ist
            if (data.magieSystem.magicAbilities.length === 0) {
                for (const [element, level] of Object.entries(data.charakter.Magische_Elemente)) {
                    if (level > 0) {
                        data.magieSystem.magicAbilities.push({
                            element,
                            type: 'Angriff', // Standard-Typ für die Konvertierung
                            level
                        });
                    }
                }
                
                // Alte Struktur entfernen
                delete data.charakter.Magische_Elemente;
                
                console.log('Magiesystem erfolgreich migriert');
            }
        }
    } catch (error) {
        console.error("Fehler bei der Migration des Magiesystems:", error);
    }
}

function loadInventory(inventory) {
    try {
        window.inventory = inventory.map(item => {
            return {
                name: item.name,
                quantity: item.quantity || item.count || 0
            };
        });
        renderInventory();
    } catch (error) {
        console.error("Fehler beim Laden des Inventars:", error);
    }
}

// Funktion zum Laden der Magiesystem-Daten
function loadMagieSystemData(data) {
    try {
        if (data.magieSystem) {
            // Globale Variablen für das Magiesystem setzen
            window.characterMagic = Array.isArray(data.magieSystem.magicAbilities) ? 
                data.magieSystem.magicAbilities : [];
            
            window.advancementPoints = data.magieSystem.advancementPoints || 0;
            
            console.log("Magie-Fähigkeiten geladen:", window.characterMagic.length);
            console.log("Steigerungspunkte geladen:", window.advancementPoints);
            
            // UI aktualisieren, falls die Funktionen bereits definiert sind
            if (typeof window.renderMagicList === 'function') {
                window.renderMagicList();
                console.log("Magic-Liste gerendert");
            }
            
            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
                console.log("Preview aktualisiert");
            }
            
            // Aktualisiere die Steigerungspunkte-Anzeige im Magie-Tab
            const advancementPointsSpan = document.getElementById('advancement-points');
            if (advancementPointsSpan) {
                advancementPointsSpan.textContent = window.advancementPoints;
                console.log("Steigerungspunkte-Anzeige aktualisiert");
            }
        } else {
            console.warn("Keine Magie-Daten in der geladenen Datei gefunden");
        }
    } catch (error) {
        console.error("Fehler beim Laden der Magie-Daten:", error);
    }
}