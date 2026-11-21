import { createEmptyWallet } from "./catalogs";
import { calculateWalletTotal, currencyValues } from "./calculations";
import { currencies } from "./types";
import type { ActionResult, CharacterState, Currency, InventoryItem, Wallet } from "./types";

function splitWallet(total: number): Wallet {
  const sign = Math.sign(total);
  let remaining = Math.abs(Math.trunc(total));
  const wallet = createEmptyWallet();
  for (const currency of currencies) {
    const unit = currencyValues[currency];
    const count = Math.floor(remaining / unit);
    wallet[currency] = count === 0 ? 0 : count * sign;
    remaining %= unit;
  }
  return wallet;
}

function replaceWallet(state: CharacterState, wallet: Wallet): ActionResult {
  return currencies.every((currency) => state.wallet[currency] === wallet[currency])
    ? { state }
    : { state: { ...state, wallet } };
}

function extendInventory(inventory: InventoryItem[], item: InventoryItem): InventoryItem[] | undefined {
  const name = item.name.trim();
  if (!name || !item.id || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
    return undefined;
  }
  const existing = inventory.find((entry) => entry.name === name);
  if (existing) {
    const quantity = existing.quantity + item.quantity;
    return Number.isSafeInteger(quantity)
      ? inventory.map((entry) => entry.id === existing.id ? { ...entry, quantity } : entry)
      : undefined;
  }
  return inventory.some(({ id }) => id === item.id) ? undefined : [...inventory, { ...item, name }];
}

export function changeFunds(state: CharacterState, currency: Currency, amount: number): ActionResult {
  const value = state.wallet[currency] + amount;
  const wallet = { ...state.wallet, [currency]: value };
  if (!Number.isFinite(value) || !Number.isFinite(calculateWalletTotal(wallet))) {
    return { state, error: "Bitte einen gültigen Geldbetrag eingeben." };
  }
  return replaceWallet(state, wallet);
}

export const convertWallet = (state: CharacterState) =>
  replaceWallet(state, splitWallet(calculateWalletTotal(state.wallet)));

export const resetWallet = (state: CharacterState) => replaceWallet(state, createEmptyWallet());

export function addInventory(state: CharacterState, item: InventoryItem): ActionResult {
  const inventory = extendInventory(state.inventory, item);
  return inventory
    ? { state: { ...state, inventory } }
    : { state, error: "Artikelname oder Menge ist ungültig." };
}

export function changeInventory(state: CharacterState, id: string, delta: number): ActionResult {
  const item = state.inventory.find((entry) => entry.id === id);
  if (!item || !Number.isSafeInteger(delta) || !Number.isSafeInteger(item.quantity + delta)) {
    return { state, error: "Artikel oder Menge ist ungültig." };
  }
  if (delta === 0) {
    return { state };
  }
  const quantity = item.quantity + delta;
  const inventory = quantity <= 0
    ? state.inventory.filter((entry) => entry.id !== id)
    : state.inventory.map((entry) => entry.id === id ? { ...entry, quantity } : entry);
  return { state: { ...state, inventory } };
}

export function buyItem(
  state: CharacterState,
  id: string,
  name: string,
  price: number,
  currency: Currency,
): ActionResult {
  const priceInKreuzer = Math.round(price * currencyValues[currency]);
  if (price < 0 || !Number.isSafeInteger(priceInKreuzer)) {
    return { state, error: "Der Artikelpreis ist ungültig." };
  }
  const balance = calculateWalletTotal(state.wallet);
  if (balance < priceInKreuzer) {
    return { state, error: "Nicht genug Geld für diesen Kauf." };
  }
  const inventory = extendInventory(state.inventory, { id, name, quantity: 1 });
  if (!inventory) {
    return { state, error: "Der Artikel konnte dem Inventar nicht hinzugefügt werden." };
  }
  const wallet = splitWallet(balance - priceInKreuzer);
  return { state: { ...state, inventory, wallet } };
}
