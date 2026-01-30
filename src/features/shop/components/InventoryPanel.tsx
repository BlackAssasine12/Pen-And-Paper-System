import { useState } from "react";
import { useShop } from "../ShopContext";

const InventoryPanel = () => {
  const { inventory, addInventoryItem, removeInventoryItem } = useShop();
  const [itemName, setItemName] = useState("");

  return (
    <div className="FlexItemContainer" id="InvContainer">
      <h6>Inventar</h6>
      <div>
        <input
          type="text"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="Artikelname"
        />
        <button
          type="button"
          onClick={() => {
            addInventoryItem(itemName);
            setItemName("");
          }}
        >
          Hinzufügen
        </button>
        <button
          type="button"
          onClick={() => {
            removeInventoryItem(itemName);
            setItemName("");
          }}
        >
          Entfernen
        </button>
      </div>
      <ul id="inventory" className="inventory-list">
        {inventory.map((entry) => (
          <li key={entry.name}>
            {entry.name} - {(entry.quantity ?? entry.count ?? 0).toString()}x
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryPanel;
