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
};

const renderTalentSection = (
  title: string,
  sectionId: SectionKey,
  entries: TalentEntry[] | undefined,
  onChange: (section: SectionKey, index: number, value: number) => void
) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  return (
    <div className="FlexItemContainer" data-section={sectionId} key={sectionId}>
      <h6>{title}</h6>
      <div className={`${sectionId.toLowerCase()}-flex`}>
        {entries.map((entry, index) => {
          const sanitizedName = sanitizeKey(entry.Name ?? "");
          const label = `${entry.Name} (${entry.Attribute}): `;

          return (
            <div className="FlexItem" key={`${sectionId}_${sanitizedName}_${index}`}>
              <label>{label}</label>
              <input
                className={`stg attributeInput ${sectionId}`}
                type="number"
                value={entry.Wert ?? 0}
                id={`${sectionId}_${sanitizedName}`}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onChange(sectionId, index, Number.parseInt(event.target.value, 10) || 0)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TalentSections = ({ faehigkeiten, onChange }: TalentSectionsProps) => (
  <div className="attributeFlexContainer">
    {sectionDefinitions.map((section) =>
      renderTalentSection(section.title, section.key, faehigkeiten?.[section.key], onChange)
    )}
  </div>
);

export default TalentSections;
