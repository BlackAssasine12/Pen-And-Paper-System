import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Tabs from "../components/Tabs";
import { CharacterProvider } from "../features/character";

describe("Tabs", () => {
  it("shows the tab navigation and default content", () => {
    render(
      <CharacterProvider>
        <Tabs
          listenersEnabled
          hiddenItemsVisible={false}
          magicState={{ advancementPoints: 0, magicAbilities: [] }}
          onMagicChange={vi.fn()}
        />
      </CharacterProvider>
    );

    expect(screen.getByRole("button", { name: "Charakter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inventar & Shop" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Charakterinformation" })).toBeInTheDocument();
  });
});
