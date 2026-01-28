import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  it("renders the main controls and tabs", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Automatische Umrechnung" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Charakter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Magie" })).toBeInTheDocument();
  });
});
