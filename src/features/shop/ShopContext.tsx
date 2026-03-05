import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { InventoryItem, ShopData, ShopItem, WalletState } from "../../types/character";
import {
  createEmptyWallet,
  getShopSnapshot,
  setShopSnapshot,
  subscribeShopSnapshot,
} from "./store";

type WalletCurrency = "dukaten" | "silber" | "heller" | "kreuzer";

type ShopContextValue = {
  wallet: WalletState;
  inventory: InventoryItem[];
  shopData: ShopData;
  shopLoading: boolean;
  shopError: string | null;
  addFunds: (amount: number, currency: WalletCurrency) => void;
  convertWallet: () => void;
  resetWallet: () => void;
  buyItem: (item: ShopItem) => void;
  addInventoryItem: (name: string, quantity?: number) => void;
  removeInventoryItem: (name: string, quantity?: number) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const currencyValues: Record<Capitalize<WalletCurrency>, number> = {
  Dukaten: 1000,
  Silber: 100,
  Heller: 10,
  Kreuzer: 1,
};

const getTotalInKreuzer = (wallet: WalletState) =>
  wallet.dukaten * 1000 + wallet.silber * 100 + wallet.heller * 10 + wallet.kreuzer;

const distributeWallet = (totalKreuzer: number): WalletState => {
  const nextWallet = createEmptyWallet();
  let remainder = Math.max(0, Math.floor(totalKreuzer));

  nextWallet.dukaten = Math.floor(remainder / 1000);
  remainder %= 1000;
  nextWallet.silber = Math.floor(remainder / 100);
  remainder %= 100;
  nextWallet.heller = Math.floor(remainder / 10);
  remainder %= 10;
  nextWallet.kreuzer = Math.floor(remainder);
  nextWallet.wInsg = totalKreuzer;

  return nextWallet;
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const initialSnapshot = getShopSnapshot();
  const [wallet, setWallet] = useState<WalletState>(initialSnapshot.wallet);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialSnapshot.inventory);
  const [shopData, setShopData] = useState<ShopData>({});
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState<string | null>(null);
  const isApplyingSnapshot = useRef(false);

  useEffect(() => {
    return subscribeShopSnapshot((nextSnapshot) => {
      isApplyingSnapshot.current = true;
      setWallet(nextSnapshot.wallet);
      setInventory(nextSnapshot.inventory);
    });
  }, []);

  useEffect(() => {
    if (isApplyingSnapshot.current) {
      isApplyingSnapshot.current = false;
      return;
    }
    setShopSnapshot({ wallet, inventory });
  }, [wallet, inventory]);

  useEffect(() => {
    const loadShopData = async () => {
      setShopLoading(true);
      setShopError(null);
      try {
        const baseUrl = import.meta.env?.BASE_URL ?? "/";
        const response = await fetch(`${baseUrl}shopData.json`);
        if (!response.ok) {
          throw new Error(`Fehler beim Laden der Shop-Daten: ${response.statusText}`);
        }
        const data = (await response.json()) as ShopData;
        setShopData(data ?? {});
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Fehler beim Laden der Shop-Daten:", error);
        setShopError(message);
      } finally {
        setShopLoading(false);
      }
    };

    void loadShopData();
  }, []);

  const addFunds = (amount: number, currency: WalletCurrency) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Bitte eine gültige Zahl eingeben.");
      return;
    }
    setWallet((current) => ({
      ...current,
      [currency]: current[currency] + amount,
      wInsg: current.wInsg + amount * (currencyValues[capitalize(currency) as keyof typeof currencyValues] ?? 0),
    }));
  };

  const convertWallet = () => {
    setWallet((current) => distributeWallet(getTotalInKreuzer(current)));
  };

  const resetWallet = () => {
    const response = prompt("Bitte 'reset' eingeben, um dein Geld zurückzusetzen");
    if (response === "reset") {
      setWallet(createEmptyWallet());
    } else {
      alert("Falsche Eingabe");
    }
  };

  const addInventoryItem = (name: string, quantity = 1) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Bitte einen gültigen Artikelnamen eingeben.");
      return;
    }
    setInventory((current) => {
      const existing = current.find((entry) => entry.name === trimmed);
      if (existing) {
        return current.map((entry) =>
          entry.name === trimmed ? { ...entry, quantity: (entry.quantity ?? 0) + quantity } : entry
        );
      }
      return [...current, { name: trimmed, quantity }];
    });
  };

  const removeInventoryItem = (name: string, quantity = 1) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Bitte einen gültigen Artikelnamen eingeben.");
      return;
    }
    setInventory((current) => {
      const existing = current.find((entry) => entry.name === trimmed);
      if (!existing) {
        alert("Artikel nicht im Inventar gefunden.");
        return current;
      }
      const currentQuantity = existing.quantity ?? 0;
      if (currentQuantity > quantity) {
        return current.map((entry) =>
          entry.name === trimmed ? { ...entry, quantity: currentQuantity - quantity } : entry
        );
      }
      return current.filter((entry) => entry.name !== trimmed);
    });
  };

  const buyItem = (item: ShopItem) => {
    const price = Number(item.Preis) || 0;
    const currencyValue = currencyValues[item.Währung as keyof typeof currencyValues];
    const priceInKreuzer = Math.round(price * (currencyValue ?? 0));
    const totalKreuzer = getTotalInKreuzer(wallet);

    if (totalKreuzer < priceInKreuzer) {
      alert("Nicht genug Geld! Der Kauf wurde abgebrochen.");
      return;
    }

    const remaining = totalKreuzer - priceInKreuzer;
    setWallet(distributeWallet(remaining));
    addInventoryItem(item.Item, 1);
  };

  const value = useMemo(
    () => ({
      wallet,
      inventory,
      shopData,
      shopLoading,
      shopError,
      addFunds,
      convertWallet,
      resetWallet,
      buyItem,
      addInventoryItem,
      removeInventoryItem,
    }),
    [wallet, inventory, shopData, shopLoading, shopError]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return context;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
