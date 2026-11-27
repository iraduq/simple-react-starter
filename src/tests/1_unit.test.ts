import { describe, it, expect } from "bun:test";
import { ron, toISODate, dayLabel, nightsBetween } from "../lib/format";

describe("1. UNIT TESTS (Frontend) - Utilitare pure & calcule", () => {
  it("ron() formatează corect sumele în lei (RON)", () => {
    const formatted = ron(350);
    expect(formatted).toContain("350");
    expect(formatted).toContain("RON");
  });

  it("ron() tratează valorile nule sau invalide", () => {
    expect(ron(null)).toContain("0");
    expect(ron(undefined)).toContain("0");
    // @ts-ignore
    expect(ron("invalid_number")).toBe("—");
  });

  it("toISODate() transformă data în format YYYY-MM-DD", () => {
    const d = new Date(2026, 7, 21);
    const iso = toISODate(d);
    expect(iso).toBe("2026-08-21");
  });

  it("dayLabel() formatează data conform convenției românești", () => {
    const label = dayLabel("2026-08-21");
    expect(label).toContain("2026");
    expect(label).toContain("21");
  });

  it("nightsBetween() calculează corect nopțile dintre check-in și check-out", () => {
    const nights = nightsBetween("2026-08-21", "2026-08-24");
    expect(nights).toHaveLength(3);
    expect(nights[0]).toBe("2026-08-21");
    expect(nights[1]).toBe("2026-08-22");
    expect(nights[2]).toBe("2026-08-23");
  });

  it("nightsBetween() returnează array vid pentru date invalide sau inversate", () => {
    expect(nightsBetween("2026-08-25", "2026-08-20")).toHaveLength(0);
    expect(nightsBetween(undefined, undefined)).toHaveLength(0);
  });
});
