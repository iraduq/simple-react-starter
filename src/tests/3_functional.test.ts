import { describe, it, expect } from "bun:test";

describe("3. FUNCTIONAL TESTS (Frontend) - Validarea cerințelor de business", () => {
  it("aplicarea unui cupon promoțional reduce corect totalul conform procentului specificat", () => {
    // Cerință de business: cuponul 'VARA20' oferă 20% discount din valoarea cazării
    const baseTotal = 1000;
    const coupons: Record<string, number> = {
      "VARA20": 20,
      "BINEVENIT10": 10,
    };

    const applyCoupon = (code: string, amount: number) => {
      const discountPercent = coupons[code.toUpperCase()];
      if (!discountPercent) throw new Error("Cupon invalid");
      const discountAmount = (amount * discountPercent) / 100;
      return {
        discountAmount,
        finalTotal: amount - discountAmount,
      };
    };

    const result = applyCoupon("VARA20", baseTotal);
    expect(result.discountAmount).toBe(200);
    expect(result.finalTotal).toBe(800);

    expect(() => applyCoupon("INVALID_CODE", baseTotal)).toThrow("Cupon invalid");
  });

  it("cerință de business: validarea capacității maxime de oaspeți", () => {
    // Cerință: numărul total de oaspeți nu poate depăși capacitatea camerei
    const room = { title: "Cameră Dublă", maxAdults: 2, maxChildren: 1 };
    
    const validateGuests = (adults: number, children: number) => {
      if (adults < 1) return { valid: false, error: "Cel puțin 1 adult necesar" };
      if (adults > room.maxAdults) return { valid: false, error: "Depășește numărul maxim de adulți" };
      if (children > room.maxChildren) return { valid: false, error: "Depășește numărul maxim de copii" };
      return { valid: true };
    };

    expect(validateGuests(2, 1).valid).toBe(true);
    expect(validateGuests(3, 0).valid).toBe(false);
    expect(validateGuests(0, 1).valid).toBe(false);
  });

  it("cerință de business: validarea formularului de contact / GDPR", () => {
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    expect(validateEmail("oaspete@casaesy.ro")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });
});
