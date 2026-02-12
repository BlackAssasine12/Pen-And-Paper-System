import type { InventoryItem, WalletState } from "../../types/character";

export type ShopSnapshot = {
  wallet: WalletState;
  inventory: InventoryItem[];
};

export const createEmptyWallet = (): WalletState => ({
  dukaten: 0,
  silber: 0,
  heller: 0,
  kreuzer: 0,
  wInsg: 0,
});

const normalizeWallet = (wallet: WalletState): WalletState => ({
  dukaten: Number(wallet.dukaten) || 0,
  silber: Number(wallet.silber) || 0,
  heller: Number(wallet.heller) || 0,
  kreuzer: Number(wallet.kreuzer) || 0,
  wInsg: Number(wallet.wInsg) || 0,
});

export const normalizeInventoryItems = (inventory: InventoryItem[]): InventoryItem[] =>
  inventory.map((item) => ({
    name: item.name,
    quantity: item.quantity ?? item.count ?? 0,
  }));

let snapshot: ShopSnapshot = {
  wallet: createEmptyWallet(),
  inventory: [],
};

const listeners = new Set<(value: ShopSnapshot) => void>();

export const getShopSnapshot = () => snapshot;

export const setShopSnapshot = (next: ShopSnapshot) => {
  snapshot = {
    wallet: normalizeWallet(next.wallet),
    inventory: normalizeInventoryItems(next.inventory ?? []),
  };
  listeners.forEach((listener) => listener(snapshot));
};

export const subscribeShopSnapshot = (listener: (value: ShopSnapshot) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
