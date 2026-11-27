import "./setup";
import { describe, it, expect } from "bun:test";
import { API_URL } from "../lib/config";

describe("7. SMOKE TESTS (Frontend) - Semne vitale & Sanity Checks", () => {
  it("variabila de configurare a API-ului (API_URL) este definită și validă", () => {
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe("string");
    expect(API_URL.length).toBeGreaterThan(0);
  });

  it("exporturile principale ale utilitarelor de bază există și sunt funcții", () => {
    const { ron, toISODate, dayLabel, nightsBetween } = require("../lib/format");
    expect(typeof ron).toBe("function");
    expect(typeof toISODate).toBe("function");
    expect(typeof dayLabel).toBe("function");
    expect(typeof nightsBetween).toBe("function");
  });

  it("exporturile componentelor esențiale sunt definite și valide", () => {
    const Auth = require("../components/auth/LoginForm");
    const BookingHero = require("../components/booking/BookingSuccessHero");
    const PlacesHero = require("../components/places/PlacesHero");

    expect(Auth).toBeDefined();
    expect(BookingHero).toBeDefined();
    expect(PlacesHero).toBeDefined();
  });
});
