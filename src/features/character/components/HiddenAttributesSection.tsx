import type { ChangeEvent } from "react";
import type { CoreAttributes } from "../services/derivedCalculations";

type HiddenAttributesSectionProps = {
  attributes: CoreAttributes;
  hiddenKeys: Array<keyof CoreAttributes>;
  minValue: number;
  maxValue: number;
  onChange: (key: keyof CoreAttributes, value: number) => void;
  onRestore: (key: keyof CoreAttributes) => void;
};

const labelMap: Record<keyof CoreAttributes, string> = {
  konstitution: "Konstitution",
  körperkraft: "Körperkraft",
  gewandheit: "Gewandheit",
  klugheit: "Klugheit",
  intuition: "Intuition",
  fingerfertigkeit: "Fingerfertigkeit",
  charisma: "Charisma",
  geschicklichkeit: "Geschicklichkeit",
  tarnung: "Tarnung",
  sinnesschärfe: "Sinnesschärfe",
  willenskraft: "Willenskraft",
};

const idMap: Record<keyof CoreAttributes, string> = {
  konstitution: "attribute_Konstitution",
  körperkraft: "attribute_Körperkraft",
  gewandheit: "attribute_Gewandheit",
  klugheit: "attribute_Klugheit",
  intuition: "attribute_Intuition",
  fingerfertigkeit: "attribute_Fingerfertigkeit",
  charisma: "attribute_Charisma",
  geschicklichkeit: "attribute_Geschicklichkeit",
  tarnung: "attribute_Tarnung",
  sinnesschärfe: "attribute_Sinnesschärfe",
  willenskraft: "attribute_Willenskraft",
};

const HiddenAttributesSection = ({
  attributes,
  hiddenKeys,
  minValue,
  maxValue,
  onChange,
  onRestore,
}: HiddenAttributesSectionProps) => {
  if (hiddenKeys.length === 0) {
    return <p>Keine ausgeblendeten Attribute.</p>;
  }

  const handleChange =
    (key: keyof CoreAttributes) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10) || 0;
      onChange(key, value);
    };

  return (
    <div className="hidden-attributes">
      {hiddenKeys.map((key) => (
        <div className="FlexItem" key={key}>
          <label>{labelMap[key]}:</label>
          <input
            className="stg attributeInput attribute"
            type="number"
            value={attributes[key]}
            min={minValue}
            max={maxValue}
            onChange={handleChange(key)}
            id={idMap[key]}
          />
          <button type="button" className="hidebutton" onClick={() => onRestore(key)}>
            {"<"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default HiddenAttributesSection;
