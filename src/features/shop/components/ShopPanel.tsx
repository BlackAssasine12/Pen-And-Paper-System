import { useState } from "react";
import { useShop } from "../ShopContext";

const ShopPanel = () => {
  const { shopData, shopLoading, shopError, buyItem } = useShop();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="FlexItemContainer" id="ShopContainer">
      <h6>Shop</h6>
      <button type="button" onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen ? (
        <div id="shop" className="shop-container">
          {shopLoading ? <p>Shop-Daten werden geladen...</p> : null}
          {shopError ? <p>Fehler: {shopError}</p> : null}
          {!shopLoading &&
            !shopError &&
            Object.entries(shopData).map(([category, items]) => (
              <div key={category}>
                <h2 className="ShopHeader">{category}</h2>
                {items.map((item) => (
                  <div key={`${category}-${item.Item}`}>
                    <p>
                      {item.Item} - {item.Preis} {item.Währung}
                    </p>
                    <button type="button" onClick={() => buyItem(item)}>
                      Kaufen
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
};

export default ShopPanel;
