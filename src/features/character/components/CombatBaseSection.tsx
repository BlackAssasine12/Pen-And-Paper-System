import type { DerivedValues } from "../services/derivedCalculations";

type CombatBaseSectionProps = {
  derived: DerivedValues;
};

const CombatBaseSection = ({ derived }: CombatBaseSectionProps) => (
  <div className="FlexItemContainer" id="kampfBasisContainer">
    <h6>Kampf Basiswerte</h6>
    <div className="FlexItem">
      <label>Wurfwaffen Basiswert:</label>
      <input
        className="stg attributeInput KampfBasiswerte"
        type="number"
        value={derived.wurf}
        readOnly
        id="KampfBasiswerte_Wurfwaffen_Basiswert"
      />
    </div>
    <div className="FlexItem">
      <label>Schusswaffen Basiswert:</label>
      <input
        className="stg attributeInput KampfBasiswerte"
        type="number"
        value={derived.schuss}
        readOnly
        id="KampfBasiswerte_Schusswaffen_Basiswert"
      />
    </div>
    <div className="FlexItem">
      <label>Attacke Basiswert:</label>
      <input
        className="stg attributeInput KampfBasiswerte"
        type="number"
        value={derived.attacke}
        readOnly
        id="KampfBasiswerte_Attacke_Basiswert"
      />
    </div>
    <div className="FlexItem">
      <label>Parade Basiswert:</label>
      <input
        className="stg attributeInput KampfBasiswerte"
        type="number"
        value={derived.parade}
        readOnly
        id="KampfBasiswerte_Parade_Basiswert"
      />
    </div>
  </div>
);

export default CombatBaseSection;
