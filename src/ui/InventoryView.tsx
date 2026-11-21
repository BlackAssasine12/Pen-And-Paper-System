import { useState } from "react";
import type { FormEvent } from "react";
import shopCatalog from "../../shopData.json";
import { currencies } from "../domain";
import type { Currency } from "../domain";
import type { PlayCharacterProps } from "./CharacterView";
import { ConfirmButton, formatNumber, parseWholeNumber, StatList } from "./fields";

const currencyLabels: Record<Currency, string> = {
  dukaten: "Dukaten",
  silber: "Silberlinge",
  heller: "Heller",
  kreuzer: "Kreuzer",
};

const catalogCurrencies: Readonly<Record<string, Currency>> = {
  Dukaten: "dukaten",
  Silber: "silber",
  Heller: "heller",
  Kreuzer: "kreuzer",
};

function Wallet({ character, derived, onAction }: PlayCharacterProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("dukaten");
  const [error, setError] = useState("");

  function moveFunds(direction: 1 | -1) {
    const value = parseWholeNumber(amount);
    if (value === undefined || value < 1) {
      setError("Bitte einen Betrag größer als null eingeben.");
      return;
    }
    setError("");
    if (onAction({ type: "change-funds", amount: direction * value, currency })) setAmount("");
  }

  return (
    <section className="panel" aria-labelledby="wallet-heading">
      <h3 id="wallet-heading">Geldbeutel</h3>
      <StatList
        className="stats-grid--wallet"
        entries={currencies.map((coin) => [currencyLabels[coin], character.wallet[coin]] as const)}
      />
      <p>Insgesamt <strong>{formatNumber(derived.walletTotal)} Kreuzer</strong></p>
      <form className="form-stack" onSubmit={(event) => {
        event.preventDefault();
        moveFunds(1);
      }}>
        <div className="form-grid">
          <label className="field">
            <span>Betrag</span>
            <input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="field">
            <span>Münzart</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
              {currencies.map((coin) => <option key={coin} value={coin}>{currencyLabels[coin]}</option>)}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button className="button button--primary" type="submit">Einzahlen</button>
          <button className="button" type="button" onClick={() => moveFunds(-1)}>Abziehen</button>
          <button className="button" type="button" onClick={() => onAction({ type: "convert-wallet" })}>Münzen umrechnen</button>
        </div>
        {error && <p className="feedback feedback--error" role="alert">{error}</p>}
      </form>
      <ConfirmButton label="Geldbeutel zurücksetzen" prompt="Alle Münzen dieses Charakters entfernen?" confirmLabel="Münzen entfernen"
        onConfirm={() => onAction({ type: "reset-wallet" })} />
    </section>
  );
}

function Inventory({ character, onAction }: PlayCharacterProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Artikelnamen eingeben.");
      return;
    }
    setError("");
    if (onAction({ type: "add-inventory", item: { id: crypto.randomUUID(), name: name.trim(), quantity: 1 } })) setName("");
  }

  return (
    <section className="panel" aria-labelledby="inventory-items-heading">
      <h3 id="inventory-items-heading">Inventar</h3>
      <form className="inline-form" onSubmit={addItem}>
        <label className="field">
          <span>Artikelname</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button className="button button--primary" type="submit">Artikel hinzufügen</button>
      </form>
      {error && <p className="feedback feedback--error" role="alert">{error}</p>}
      {character.inventory.length === 0 && <p className="muted">Dein Inventar ist leer.</p>}
      <div>
        {character.inventory.map((item) => (
          <div className="item-row" key={item.id}>
            <span className="item-row__name">{item.name}</span>
            <div className="item-row__actions">
              <button className="number-step" type="button" aria-label={`Ein Stück ${item.name} entfernen`}
                onClick={() => onAction({ type: "change-inventory", id: item.id, delta: -1 })}>
                −
              </button>
              <output className="inventory-count" aria-label={`Menge ${item.name}`}>{formatNumber(item.quantity)}</output>
              <button className="number-step" type="button" aria-label={`Ein Stück ${item.name} hinzufügen`}
                onClick={() => onAction({ type: "change-inventory", id: item.id, delta: 1 })}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Shop({ onAction }: Pick<PlayCharacterProps, "onAction">) {
  const [lastPurchase, setLastPurchase] = useState("");

  return (
    <section className="panel panel--wide" aria-labelledby="shop-heading">
      <h3 id="shop-heading">Shop</h3>
      {lastPurchase && <p className="feedback" role="status">{lastPurchase} wurde ins Inventar gelegt.</p>}
      {Object.entries(shopCatalog).map(([category, items]) => (
        <details key={category}>
          <summary>{category}</summary>
          <div className="item-grid">
            {items.map((item, index) => {
              const currency = catalogCurrencies[item.Währung];
              const title = item.Item;
              return (
                <div className="item-row" key={`${title}:${index}`}>
                  <div>
                    <span className="item-row__name">{title}</span>
                    <small className="muted">{formatNumber(item.Preis)} {currency ? currencyLabels[currency] : item.Währung}</small>
                  </div>
                  <div>
                    <button
                      className="button"
                      type="button"
                      aria-label={`${title} kaufen`}
                      disabled={!currency}
                      onClick={() => {
                        const bought = onAction({ type: "buy-item", id: crypto.randomUUID(), name: title, price: item.Preis, currency });
                        setLastPurchase(bought ? title : "");
                      }}
                    >
                      Kaufen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </section>
  );
}

export function InventoryView(props: PlayCharacterProps) {
  return (
    <section className="play-view" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading">Inventar &amp; Shop</h2>
      <div className="play-grid">
        <Wallet {...props} />
        <Inventory {...props} />
        <Shop onAction={props.onAction} />
      </div>
    </section>
  );
}
