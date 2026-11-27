import { describe, it, expect } from "bun:test";
import { ron, nightsBetween } from "../lib/format";

describe("6. PERFORMANCE TESTS (Frontend) - Benchmarking & timpi de execuție", () => {
  it("timpul de formatare pentru 2,000 de prețuri este sub 100ms", () => {
    // Warm-up JIT
    for (let i = 0; i < 50; i++) ron(i);

    const start = performance.now();
    for (let i = 0; i < 2000; i++) {
      ron(i * 12.5);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it("calculul a 1,000 de intervale de sejur este sub 35ms", () => {
    const start = performance.now();
    for (let i = 1; i <= 1000; i++) {
      nightsBetween("2026-08-01", "2026-08-10");
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(35);
  });

  it("filtrarea și sortarea în memorie a unei liste de 5,000 de elemente este sub 20ms", () => {
    const dataset = Array.from({ length: 5000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Camera ${i}`,
      price: (i % 500) + 100,
      category: i % 2 === 0 ? "deluxe" : "standard",
    }));

    const start = performance.now();
    const result = dataset
      .filter(item => item.category === "deluxe")
      .sort((a, b) => a.price - b.price);
    const elapsed = performance.now() - start;

    expect(result.length).toBe(2500);
    expect(elapsed).toBeLessThan(20);
  });
});
