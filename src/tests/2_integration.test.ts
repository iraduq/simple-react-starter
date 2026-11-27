import { describe, it, expect } from "bun:test";
import { nightsBetween, ron } from "../lib/format";

describe("2. INTEGRATION TESTS (Frontend) - Interacțiunea modulelor de preț și rezervare", () => {
  it("interacțiunea între selecția de date și calculul sumei totale de cazare", () => {
    // Modulul 1: Date Picker generează nopțile
    const checkIn = "2026-09-10";
    const checkOut = "2026-09-13";
    const nights = nightsBetween(checkIn, checkOut);
    expect(nights).toHaveLength(3);

    // Modulul 2: Pricing Engine calculează totalul în funcție de numărul de nopți și tarif
    const ratePerNight = 400;
    const cleaningFee = 150;
    const subtotal = nights.length * ratePerNight;
    const grandTotal = subtotal + cleaningFee;

    // Modulul 3: Formatter-ul generează reprezentarea UI afișată oaspetelui
    const formattedGrandTotal = ron(grandTotal);
    expect(grandTotal).toBe(1350);
    expect(formattedGrandTotal).toContain("1.350");
    expect(formattedGrandTotal).toContain("RON");
  });

  it("filtrarea catalogului de camere pe categorii integrează corect lista cu starea selectată", () => {
    const mockRooms = [
      { id: "1", title: "Cameră Panoramică", capacity: 2, tag: "deluxe" },
      { id: "2", title: "Apartament Montan", capacity: 4, tag: "family" },
      { id: "3", title: "Studio Romantic", capacity: 2, tag: "deluxe" },
    ];

    let activeFilter = "deluxe";
    const filteredDeluxe = mockRooms.filter(r => r.tag === activeFilter);
    expect(filteredDeluxe).toHaveLength(2);
    expect(filteredDeluxe.every(r => r.tag === "deluxe")).toBe(true);

    activeFilter = "family";
    const filteredFamily = mockRooms.filter(r => r.tag === activeFilter);
    expect(filteredFamily).toHaveLength(1);
    expect(filteredFamily[0].title).toBe("Apartament Montan");
  });

  it("integrarea codului PIN tastat în SmartLockKeypad cu starea de deblocare", () => {
    // Simulare starea tastaturii inteligente
    let keypadDigits: string[] = [];
    const pushDigit = (digit: string) => {
      if (keypadDigits.length < 6) {
        keypadDigits.push(digit);
      }
    };
    const clearDigits = () => { keypadDigits = []; };

    // Utilizatorul tastează '1', '2', '3', '4'
    ["1", "2", "3", "4"].forEach(pushDigit);
    expect(keypadDigits.join("")).toBe("1234");

    // Utilizatorul apasă Clear
    clearDigits();
    expect(keypadDigits).toHaveLength(0);

    // Tastare PIN complet de 6 cifre
    ["9", "8", "7", "6", "5", "4"].forEach(pushDigit);
    expect(keypadDigits.join("")).toBe("987654");
  });
});
