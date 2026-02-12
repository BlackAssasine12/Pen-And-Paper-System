import type { ChangeEvent } from "react";
import type { CoreAttributes } from "../services/derivedCalculations";

type AttributesSectionProps = {
  attributes: CoreAttributes;
  onChange: (key: keyof CoreAttributes, value: number) => void;
  minValue: number;
  maxValue: number;
  hiddenKeys?: Array<keyof CoreAttributes>;
  onHide?: (key: keyof CoreAttributes) => void;
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

const AttributesSection = ({
  attributes,
  onChange,
  minValue,
  maxValue,
  hiddenKeys = [],
  onHide,
}: AttributesSectionProps) => {
  const handleChange =
    (key: keyof CoreAttributes) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10) || 0;
      onChange(key, value);
    };

  const visibleKeys = (Object.keys(attributes) as Array<keyof CoreAttributes>).filter(
    (key) => !hiddenKeys.includes(key)
  );

  return (
    <div className="FlexItemContainer" id="attributeContainer">
      <h6>Attribute</h6>
      <div className="attribute-flex">
        {visibleKeys.map((key) => (
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
            <button type="button" className="hidebutton" onClick={() => onHide?.(key)}>
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributesSection;
