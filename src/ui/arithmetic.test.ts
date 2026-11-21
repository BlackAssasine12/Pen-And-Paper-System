import { describe, expect, it } from "vitest";
import { evaluateArithmetic } from "./arithmetic";

describe("Taschenrechner", () => {
  it("berechnet Punkt vor Strich und wertet Klammern aus", () => {
    expect(evaluateArithmetic("2+3*4")).toBe(14);
    expect(evaluateArithmetic("(2+3)*4")).toBe(20);
    expect(evaluateArithmetic("8/2/2")).toBe(2);
  });

  it("rechnet mit Vorzeichen und Dezimalstellen", () => {
    expect(evaluateArithmetic("-3+2.5")).toBe(-0.5);
    expect(evaluateArithmetic("-(.5*4)+1")).toBe(-1);
  });

  it("meldet ungültige und undefinierte Ausdrücke", () => {
    expect(() => evaluateArithmetic("1+")).toThrow();
    expect(() => evaluateArithmetic("(2+3")).toThrow();
    expect(() => evaluateArithmetic("2/0")).toThrow();
  });
});
