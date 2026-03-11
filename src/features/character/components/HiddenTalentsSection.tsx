// Wir definieren zuerst, welche Daten (Props) unsere Komponente von außen (aus der Tabs.tsx) erwartet.
// - hiddenTalents: Ein Array aus Strings (die Namen der Talente, z.B. "Schmieden").
// - onRestore: Eine Funktion, die aufgerufen wird, wenn man auf "Wiederherstellen" klickt.
type HiddenTalentsSectionProps = {
  hiddenTalents: string[];
  onRestore: (name: string) => void;
};

const HiddenTalentsSection = ({
  hiddenTalents,
  onRestore,
}: HiddenTalentsSectionProps) => {
  // Wenn das Array leer ist, gibt es nichts zum Wiederherstellen. 
  // Wir geben einfach eine kleine Textmeldung aus und brechen hier ab (Early Return).
  if (hiddenTalents.length === 0) {
    return <p>Keine ausgeblendeten Talente.</p>;
  }

  // Wenn Talente im Array sind, bauen wir eine Liste auf.
  return (
    <div className="hidden-attributes">
      {/* Wir gehen jedes versteckte Talent im Array durch (map) */}
      {hiddenTalents.map((name) => (
        // Das key-Attribut ist für React extrem wichtig, damit es weiß, 
        // welches Element bei Änderungen neu gezeichnet werden muss.
        <div className="FlexItem" key={name}>
          <label>{name}</label>
          <button
            type="button"
            className="hidebutton"
            // Beim Klick rufen wir die onRestore-Funktion auf und übergeben ihr den Namen dieses Talents
            onClick={() => onRestore(name)}
          >
            {"<"} Wiederherstellen
          </button>
        </div>
      ))}
    </div>
  );
};

export default HiddenTalentsSection;