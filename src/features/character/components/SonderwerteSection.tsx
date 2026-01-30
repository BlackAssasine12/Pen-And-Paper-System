import type { DerivedValues } from "../services/derivedCalculations";

type SonderwerteSectionProps = {
  derived: DerivedValues;
};

const SonderwerteSection = ({ derived }: SonderwerteSectionProps) => (
  <div className="FlexItemContainer" id="sonderwerteContainer">
    <h6>Sonderwerte</h6>
    <div className="sonderwerte-flex">
      <div className="FlexItem">
        <label>Aktuelle LP:</label>
        <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Aktuelle_LP" />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Maximale LP:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.lpMax}
          readOnly
          id="sonderwerte_Maximale_LP"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Ausdauer:</label>
        <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Ausdauer" />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Maximale Ausdauer:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.ausdauerMax}
          readOnly
          id="sonderwerte_Maximale_Ausdauer"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Astralenergie:</label>
        <input className="stg attributeInput sonderwerte" type="number" defaultValue={0} id="sonderwerte_Astralenergie" />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Maximale Astralenergie:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.maxAstralenergie}
          readOnly
          id="sonderwerte_Maximale_Astralenergie"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Magiebegabung:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.magiebegabung}
          readOnly
          id="sonderwerte_Magiebegabung"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Magieresistenz:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.magieresistenz}
          readOnly
          id="sonderwerte_Magieresistenz"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Giftresistenz:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.giftresistenz}
          readOnly
          id="sonderwerte_Giftresistenz"
        />
        <span className="readonly-value">×</span>
      </div>
      <div className="FlexItem">
        <label>Schnelligkeit:</label>
        <input
          className="stg attributeInput sonderwerte"
          type="number"
          value={derived.schnelligkeit}
          readOnly
          id="sonderwerte_Schnelligkeit"
        />
        <span className="readonly-value">×</span>
      </div>
    </div>
  </div>
);

export default SonderwerteSection;
