import type { ChangeEvent } from "react";
import type { CombatTalents } from "../services/autoSkillDistribution";

const sanitizeKey = (key: string) => key.replace(/\s+/g, "_");

type CombatTalentsSectionProps = {
  talents?: CombatTalents;
  onChange: (talentName: string, index: number, value: number) => void;
  minValue: number;
  maxValue: number;
};

const CombatTalentsSection = ({ talents, onChange, minValue, maxValue }: CombatTalentsSectionProps) => {
  const entries = Object.entries(talents ?? {});

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="FlexItemContainer BigFlexItemContainer" id="kampfTalenteContainer">
      <h6>Kampf Talente (AT/PA/Skillwert)</h6>
      <div className="kampf-talente-flex">
        {entries.map(([key, values]) => {
          const sanitizedKey = sanitizeKey(key);
          const safeValues = Array.isArray(values) ? values : [];

          return (
            <div className="BigFlexItem ArrayContainer" key={key}>
              <label>{`${key.charAt(0).toUpperCase() + key.slice(1)}:`}</label>
              {Array.from({ length: 3 }).map((_, index) => (
                <input
                  key={`${key}-${index}`}
                  className={`stg ArrAttributeInput Kampf_Talente Kampf_Talente_${index}`}
                  type="number"
                  value={safeValues[index] ?? 0}
                  min={minValue}
                  max={maxValue}
                  id={`Kampf_Talente_${sanitizedKey}_${index}`}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onChange(key, index, Number.parseInt(event.target.value, 10) || 0)
                  }
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CombatTalentsSection;
