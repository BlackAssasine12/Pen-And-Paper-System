//TalentSections.tsx
import type { ChangeEvent } from "react";
import type { CharacterFaehigkeiten, TalentEntry } from "../../../types/character";

const sanitizeKey = (key: string) => key.replace(/\s+/g, "_");

const sectionDefinitions = [
  { key: "Assassinen_Talente", title: "Assassinen Talente" },
  { key: "Talente_1", title: "Talente 1" },
  { key: "Talente_2", title: "Talente 2" },
  { key: "Handwerkstalente", title: "Handwerkstalente" },
] as const;

type SectionKey = (typeof sectionDefinitions)[number]["key"];

type TalentSectionsProps = {
  faehigkeiten?: CharacterFaehigkeiten;
  onChange: (section: SectionKey, index: number, value: number) => void;
  minValue: number;
  maxValue: number;
  hiddenKeys?: string[];
  onHide?: (key: string) => void;
};

const renderTalentSection = (
  title: string,
  sectionId: SectionKey,
  entries: TalentEntry[] | undefined,
  onChange: (section: SectionKey, index: number, value: number) => void,
  minValue: number,
  maxValue: number,
  hiddenKeys: string[] = [], // Hinzugefügt
  onHide?: (key: string) => void // Hinzugefügt
) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }
  
  const visibleEntries = entries
    .map((entry, originalIndex) => ({ entry, originalIndex }))
    .filter(({ entry }) => entry.Name && !hiddenKeys.includes(entry.Name));

  // Wenn alle Talente einer Sektion versteckt sind, Sektion gar nicht rendern
  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <div className="FlexItemContainer" data-section={sectionId} key={sectionId}>
      <h6>{title}</h6>
      <div className={`${sectionId.toLowerCase()}-flex`}>
        {visibleEntries.map(({ entry, originalIndex }) => {
          const sanitizedName = sanitizeKey(entry.Name ?? "");
          const label = `${entry.Name} (${entry.Attribute}): `;

          return (
            <div className="FlexItem" key={`${sectionId}_${sanitizedName}_${originalIndex}`}>
              <label>{label}</label>
              <input
                className={`stg attributeInput ${sectionId}`}
                type="number"
                value={entry.Wert ?? 0}
                min={minValue}
                max={maxValue}
                id={`${sectionId}_${sanitizedName}`}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  // Hier verwenden wir den originalIndex, damit der richtige State geupdatet wird
                  onChange(sectionId, originalIndex, Number.parseInt(event.target.value, 10) || 0)
                }
              />
              <button
                type="button"
                className="hidebutton"
                onClick={() => entry.Name && onHide?.(entry.Name)}
              >
                X
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TalentSections = ({
  faehigkeiten,
  onChange,
  minValue,
  maxValue,
  hiddenKeys = [], // Standardwert leeres Array
  onHide
}: TalentSectionsProps) => (
  <div className="attributeFlexContainer">
    {sectionDefinitions.map((section) =>
      renderTalentSection(
        section.title,
        section.key,
        faehigkeiten?.[section.key],
        onChange,
        minValue,
        maxValue,
        hiddenKeys, // Prop weitergeben
        onHide      // Prop weitergeben
      )
    )}
  </div>
);

export default TalentSections;