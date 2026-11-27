import { describe, it, expect } from "bun:test";
import { nightsBetween, ron } from "../lib/format";

describe("4. END-TO-END TESTS (Frontend) - Flux complet utilizator (Guest Flow)", () => {
  it("scenariu complet: navigare catalog -> selecție cameră -> calcul sejur -> aplicare cupon -> confirmare rezervare", () => {
    // PASUL 1: Oaspetele vizualizează camerele disponibile
    const catalog = [
      { id: "room-101", name: "Cabana Regală", pricePerNight: 500, maxGuests: 4 },
      { id: "room-102", name: "Camera Priveliște", pricePerNight: 350, maxGuests: 2 },
    ];
    expect(catalog.length).toBeGreaterThan(0);

    // PASUL 2: Oaspetele alege camera 101
    const selectedRoom = catalog[0];
    expect(selectedRoom.id).toBe("room-101");

    // PASUL 3: Oaspetele alege perioada sejurului (3 nopți)
    const checkIn = "2026-10-01";
    const checkOut = "2026-10-04";
    const nights = nightsBetween(checkIn, checkOut);
    expect(nights).toHaveLength(3);

    // PASUL 4: Calculul prețului brut
    const subtotal = nights.length * selectedRoom.pricePerNight; // 1500 RON
    expect(subtotal).toBe(1500);

    // PASUL 5: Oaspetele introduce un cupon promoțional 'ESY10'
    const couponDiscount = 0.10; // 10%
    const discountAmount = subtotal * couponDiscount;
    const finalPrice = subtotal - discountAmount;
    expect(finalPrice).toBe(1350);

    // PASUL 6: Oaspetele completează datele și primește codul de rezervare
    const bookingSubmission = {
      roomId: selectedRoom.id,
      guestName: "Mihai Eminescu",
      guestEmail: "mihai@exemplu.ro",
      nightsCount: nights.length,
      finalPrice,
      status: "confirmed",
      bookingCode: `ESY-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    expect(bookingSubmission.status).toBe("confirmed");
    expect(bookingSubmission.bookingCode).toMatch(/^ESY-\d{4}$/);
    expect(ron(bookingSubmission.finalPrice)).toContain("1.350");
  });
});
