// Wir definieren zuerst, welche Daten (Props) unsere Komponente von außen (aus der Tabs.tsx) erwartet.
// - hiddenTalents: Ein Array aus Strings (die Namen der Talente, z.B. "Schmieden").
// - onRestore: Eine Funktion, die aufgerufen wird, wenn man auf "Wiederherstellen" klickt.
type HiddenTalentsSectionProps = {
  hiddenTalents: string[];
  onRestore: (name: string) => void;
};

const HiddenTalentsSection = ({ hiddenTalents, onRestore }: HiddenTalentsSectionProps) => {
  if (hiddenTalents.length === 0) return null;

  return (
    <div className="hidden-attributes">
      {hiddenTalents.map((name) => (
        <div className="FlexItem" key={name}>
          <label>{name}</label>
          <button type="button" className="hidebutton" onClick={() => onRestore(name)}>
            {"<"} Wiederherstellen
          </button>
        </div>
      ))}
    </div>
  );
};

export default HiddenTalentsSection;