import { useState } from "react";

export const sheetSections = {
  "sheet-progress": "Fortschritt",
  "sheet-profile": "Profil",
  "sheet-resources": "Sonderwerte",
  "sheet-combat": "Kampf",
  "sheet-attributes": "Attribute",
  "sheet-modifiers": "Modifikatoren",
  "sheet-talents": "Talente",
  "sheet-notes": "Notizen",
  "sheet-hidden": "Ausgeblendete Werte",
} as const;

export type SheetSection = keyof typeof sheetSections;
const defaultOrder = Object.keys(sheetSections) as SheetSection[];
const navigationSections = new Set<SheetSection>(["sheet-profile", "sheet-attributes", "sheet-combat", "sheet-talents", "sheet-notes", "sheet-hidden"]);
const storageKey = "dsa3-sheet-section-order";

function readOrder() {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(raw)) return [...new Set<SheetSection>([...raw.filter((id) => defaultOrder.includes(id)), ...defaultOrder])];
  } catch {
    return defaultOrder;
  }
  return defaultOrder;
}

export function useSheetOrder() {
  const [order, setOrder] = useState(readOrder);
  function writeOrder(next: SheetSection[]) {
    setOrder(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  }
  return { order, writeOrder };
}

export function SheetNavigation({ order, onOrder }: {
  order: SheetSection[];
  onOrder: (order: SheetSection[]) => boolean;
}) {
  const [status, setStatus] = useState("");

  function save(next: SheetSection[], success: string) {
    setStatus(onOrder(next) ? success : "Die Reihenfolge gilt für diesen Tab. Der Browserspeicher ist nicht verfügbar.");
  }

  function move(index: number, offset: number) {
    const next = [...order];
    const other = index + offset;
    [next[index], next[other]] = [next[other], next[index]];
    save(next, sheetSections[order[index]] + " steht an Position " + (other + 1) + ".");
  }

  return (
    <>
      <nav className="sheet-nav" aria-label="Bereiche des Charakterbogens">
        {order.filter((id) => navigationSections.has(id)).map((id) => (
          <button type="button" key={id} onClick={() => {
            const heading = document.getElementById(id);
            heading?.focus({ preventScroll: true });
            heading?.scrollIntoView({ block: "start" });
          }}>
            {id === "sheet-hidden" ? "Ausgeblendete" : sheetSections[id]}
          </button>
        ))}
      </nav>
      <details>
        <summary>Abschnitte anordnen</summary>
        <ol className="sheet-order">
          {order.map((id, index) => (
            <li key={id}>
              <span>{sheetSections[id]}</span>
              <div className="button-row">
                <button className="button" type="button" disabled={index === 0}
                  aria-label={sheetSections[id] + " nach oben verschieben"} onClick={() => move(index, -1)}>Nach oben</button>
                <button className="button" type="button" disabled={index === order.length - 1}
                  aria-label={sheetSections[id] + " nach unten verschieben"} onClick={() => move(index, 1)}>Nach unten</button>
              </div>
            </li>
          ))}
        </ol>
        <button type="button" className="button" onClick={() => save(defaultOrder, "Standardreihenfolge wiederhergestellt.")}>
          Reihenfolge zurücksetzen
        </button>
        <p className="muted" role="status">{status}</p>
      </details>
    </>
  );
}
