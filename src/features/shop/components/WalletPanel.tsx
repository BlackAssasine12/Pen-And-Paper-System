import { useState } from "react";
import { useShop } from "../ShopContext";

const WalletPanel = () => {
  const { wallet, addFunds, convertWallet, resetWallet } = useShop();
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<"dukaten" | "silber" | "heller" | "kreuzer">("dukaten");

  return (
    <div className="WalletContainer FlexItemContainer" id="WalletContainer">
      <h6>Geldbeutel</h6>
      <form
        id="inputField"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input
          type="number"
          placeholder="Enter a number"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
        />
        <select
          name="Währund"
          value={currency}
          onChange={(event) => setCurrency(event.target.value as typeof currency)}
        >
          <option value="dukaten">Dukaten</option>
          <option value="silber">Silberlinge</option>
          <option value="heller">Heller</option>
          <option value="kreuzer">Kreuzer</option>
        </select>
        <button
          type="button"
          onClick={() => {
            addFunds(amount, currency);
            setAmount(0);
          }}
        >
          Add Wallet
        </button>
        <button type="button" onClick={convertWallet}>
          Convert Wallet
        </button>

        <div style={{ marginTop: "20px" }}>
          <div>
            Dukaten: <p>{wallet.dukaten}</p>
          </div>
          <div>
            Silberlinge: <p>{wallet.silber}</p>
          </div>
          <div>
            Heller: <p>{wallet.heller}</p>
          </div>
          <div>
            Kreuzer: <p>{wallet.kreuzer}</p>
          </div>
        </div>
        <button type="button" onClick={resetWallet} style={{ marginTop: "20px" }}>
          Reset Wallet
        </button>
      </form>
    </div>
  );
};

export default WalletPanel;
