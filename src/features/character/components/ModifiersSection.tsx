import type { ChangeEvent } from "react";
import type { CoreModifiers } from "../services/derivedCalculations";

type ModifiersSectionProps = {
  modifiers: CoreModifiers;
  onChange: (key: keyof CoreModifiers, value: number) => void;
  minValue: number;
  maxValue: number;
};

const ModifiersSection = ({ modifiers, onChange, minValue, maxValue }: ModifiersSectionProps) => {
  const handleChange =
    (key: keyof CoreModifiers) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10) || 0;
      onChange(key, value);
    };

  return (
    <div className="FlexItemContainer" id="modifierContainer">
      <h6>Modifier</h6>
      <div className="modifier-flex">
        <div className="FlexItem">
          <label>Magie:</label>
          <input
            className="stg attributeInput modifier modifier_magie"
            type="number"
            value={modifiers.magie}
            min={minValue}
            max={maxValue}
            onChange={handleChange("magie")}
            id="modifier_magie"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>ASP:</label>
          <input
            className="stg attributeInput modifier modifier_asp"
            type="number"
            value={modifiers.asp}
            min={minValue}
            max={maxValue}
            onChange={handleChange("asp")}
            id="modifier_asp"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>LP:</label>
          <input
            className="stg attributeInput modifier modifier_lp"
            type="number"
            value={modifiers.lp}
            min={minValue}
            max={maxValue}
            onChange={handleChange("lp")}
            id="modifier_lp"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>Fernkampf:</label>
          <input
            className="stg attributeInput modifier modifier_fernkampf"
            type="number"
            value={modifiers.fernkampf}
            min={minValue}
            max={maxValue}
            onChange={handleChange("fernkampf")}
            id="modifier_fernkampf"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>Nahkampf:</label>
          <input
            className="stg attributeInput modifier modifier_nahkampf"
            type="number"
            value={modifiers.nahkampf}
            min={minValue}
            max={maxValue}
            onChange={handleChange("nahkampf")}
            id="modifier_nahkampf"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>Gift:</label>
          <input
            className="stg attributeInput modifier modifier_gift"
            type="number"
            value={modifiers.gift}
            min={minValue}
            max={maxValue}
            onChange={handleChange("gift")}
            id="modifier_gift"
          />
          <span className="readonly-value">×</span>
        </div>
        <div className="FlexItem">
          <label>Stealth:</label>
          <input
            className="stg attributeInput modifier modifier_stealth"
            type="number"
            value={modifiers.stealth}
            min={minValue}
            max={maxValue}
            onChange={handleChange("stealth")}
            id="modifier_stealth"
          />
          <span className="readonly-value">×</span>
        </div>
      </div>
    </div>
  );
};

export default ModifiersSection;
