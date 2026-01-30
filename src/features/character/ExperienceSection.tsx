import type { ChangeEvent } from "react";
import { useCharacter } from "./CharacterContext";

const ExperienceSection = () => {
  const { experience, setLevel, setXp, setSteigerungspunkte } = useCharacter();

  return (
    <div className="FlexItemContainer" id="erfahrungContainer">
      <h6>Erfahrung</h6>
      <div className="FlexItem">
        <label>Level:</label>
        <input
          className="stg attributeInput erfahrung"
          type="number"
          value={experience.level}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setLevel(Number.parseInt(event.target.value, 10) || 0)}
          id="erfahrung_level"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>XP:</label>
        <input
          className="stg attributeInput erfahrung"
          type="number"
          value={experience.xp}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setXp(Number.parseInt(event.target.value, 10) || 0)}
          id="erfahrung_xp"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Steigerungspunkte:</label>
        <input
          className="stg attributeInput erfahrung"
          type="number"
          value={experience.steigerungspunkte}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setSteigerungspunkte(Number.parseInt(event.target.value, 10) || 0)
          }
          id="erfahrung_Steigerungspunkte"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Gesteigerte:</label>
        <input
          className="stg attributeInput erfahrung"
          type="number"
          value={experience.gesteigerte}
          readOnly
          id="erfahrung_Gesteigerte"
        />
        <span className="readonly-value">×</span>
      </div>
    </div>
  );
};

export default ExperienceSection;
