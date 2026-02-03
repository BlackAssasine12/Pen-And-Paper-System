import assert from "node:assert/strict";
import test from "node:test";

type ListenerMap = Record<string, Array<(event: Event) => void>>;

class MockInput {
  id = "";
  value = "";
  type = "number";
  classList = new Set<string>();
  private listeners: ListenerMap = {};
  private attributes = new Map<string, string>();

  constructor(id: string, value: number, classes: string[] = []) {
    this.id = id;
    this.value = String(value);
    classes.forEach((cls) => this.classList.add(cls));
  }

  addEventListener(type: string, handler: (event: Event) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  removeEventListener(type: string, handler: (event: Event) => void) {
    if (!this.listeners[type]) {
      return;
    }
    this.listeners[type] = this.listeners[type].filter((listener) => listener !== handler);
  }

  dispatchEvent(event: Event) {
    const handlers = this.listeners[event.type] ?? [];
    handlers.forEach((handler) => handler(event));
    return true;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

test("input listeners deduct advancement points and dispatch input events", async () => {
  const statInput = new MockInput("stat-input", 1, ["stg", "modifier_magie"]);
  const mainInput = new MockInput("erfahrung_Steigerungspunkte", 100, ["stg"]);
  let mainInputEvents = 0;
  mainInput.addEventListener("input", () => {
    mainInputEvents += 1;
  });

  (globalThis as { document?: unknown; HTMLInputElement?: unknown; Event?: unknown }).document = {
    querySelectorAll: (selector: string) => {
      if (selector === ".stg") {
        return [statInput, mainInput];
      }
      if (selector === ".modifier_magie") {
        return [statInput];
      }
      return [];
    },
    getElementById: (id: string) => {
      if (id === "erfahrung_Steigerungspunkte") {
        return mainInput;
      }
      return null;
    },
  };
  (globalThis as { HTMLInputElement?: unknown }).HTMLInputElement = MockInput;
  (globalThis as { Event?: unknown }).Event = class {
    type: string;
    bubbles: boolean;
    constructor(type: string, options?: { bubbles?: boolean }) {
      this.type = type;
      this.bubbles = options?.bubbles ?? false;
    }
  };

  const listenerModule = await import("../src/features/character/services/inputListeners.js");
  listenerModule.addInputChangeListeners();

  statInput.value = "2";
  statInput.dispatchEvent({ type: "input", target: statInput } as unknown as Event);

  assert.equal(mainInput.value, "90");
  assert.equal(mainInputEvents, 1);
});

test("input listeners refund advancement points when values decrease", async () => {
  const statInput = new MockInput("stat-input", 2, ["stg", "modifier_magie"]);
  const mainInput = new MockInput("erfahrung_Steigerungspunkte", 90, ["stg"]);

  (globalThis as { document?: unknown; HTMLInputElement?: unknown; Event?: unknown }).document = {
    querySelectorAll: (selector: string) => {
      if (selector === ".stg") {
        return [statInput, mainInput];
      }
      if (selector === ".modifier_magie") {
        return [statInput];
      }
      return [];
    },
    getElementById: (id: string) => {
      if (id === "erfahrung_Steigerungspunkte") {
        return mainInput;
      }
      return null;
    },
  };
  (globalThis as { HTMLInputElement?: unknown }).HTMLInputElement = MockInput;
  (globalThis as { Event?: unknown }).Event = class {
    type: string;
    bubbles: boolean;
    constructor(type: string, options?: { bubbles?: boolean }) {
      this.type = type;
      this.bubbles = options?.bubbles ?? false;
    }
  };

  const listenerModule = await import("../src/features/character/services/inputListeners.js");
  listenerModule.addInputChangeListeners();

  statInput.value = "1";
  statInput.dispatchEvent({ type: "input", target: statInput } as unknown as Event);

  assert.equal(mainInput.value, "100");
});
