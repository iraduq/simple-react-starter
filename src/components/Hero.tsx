import { Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "./DatePicker";
import { useToast } from "./Toast";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      toast("Selectează datele de check-in și check-out.", "warning");
      return;
    }
    if (checkOut <= checkIn) {
      toast("Check-out trebuie să fie după check-in.", "warning");
      return;
    }
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: String(adults),
      children: String(children),
    });
    navigate(`/disponibilitate?${params.toString()}`);
  };

  return (
    <div className="relative w-full overflow-visible">
      {/* SECTION HERO — Am crescut h-ul și am adăugat pb-40 pentru a face loc bării + valului sub ea */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[820px] pb-40 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,44,92,0.4) 0%, rgba(13,44,92,0.85) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        }}
      >
        {/* OVERLAY CINEMATIC */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(13,44,92,0.65) 0%, rgba(13,44,92,0.3) 100%)",
          }}
        />

        {/* TEXT ȘI BUTOANE MAIN */}
        <div className="relative z-[2] flex flex-col items-center text-center px-5 max-w-[800px] mt-auto mb-12">
          <p className="flex items-center gap-[15px] text-[#c69a3f] font-sans text-xs font-semibold tracking-[3px] uppercase mb-5">
            <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
            EXPERIENȚE DE NEUITAT LA MARE
            <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
          </p>

          <h1 className="text-white font-['Cormorant_Garamond',serif] text-[clamp(3rem,6vw,5rem)] font-normal leading-[1.1] mb-6 [text-shadow:0_4px_20px_rgba(0,0,0,0.3)]">
            Descoperă{" "}
            <em className="not-italic italic text-[#c69a3f]">Liniștea</em>
            <br />
            Mării Negre
          </h1>

          <p className="max-w-[600px] mx-auto mb-10 leading-[1.7] text-[1.15rem] font-light text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.2)]">
            Vila Casa Esy — refugiul tău perfect pe malul mării. Camere
            rafinate, priveliști superbe și ospitalitate caldă la fiecare pas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full sm:w-auto">
            <a
              href="#camere"
              className="w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-[#0d2c5c] bg-[#0d2c5c] text-white transition-all duration-300 hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
            >
              Rezervă acum →
            </a>
            <a
              href="#descopera"
              className="w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-white/50 text-white bg-transparent transition-all duration-300 hover:bg-white/[0.08]"
            >
              Serviciile noastre →
            </a>
          </div>
        </div>

        {/* BARA DE CĂUTARE — alungită și subțire */}
        <div className="relative z-20 bg-white rounded-2xl md:rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col md:flex-row md:items-center w-[calc(100vw-32px)] md:w-[min(1120px,calc(100vw-48px))] border border-[#e1e8f0] mx-4 md:mx-0 mb-6 md:pl-2 md:pr-2 md:py-2">
          <DatePicker
            label="Check-in"
            value={checkIn}
            minDate={today}
            onChange={handleCheckIn}
          />

          <div className="hidden md:block w-px self-stretch bg-[#e1e8f0] my-1" />

          <DatePicker
            label="Check-out"
            value={checkOut}
            minDate={checkIn || today}
            onChange={setCheckOut}
          />

          <div className="hidden md:block w-px self-stretch bg-[#e1e8f0] my-1" />

          {/* OASPEȚI — popover compact */}
          <div ref={guestsRef} className="relative flex-1 md:max-w-[240px]">
            <button
              type="button"
              onClick={() => setGuestsOpen((o) => !o)}
              className="w-full text-left px-6 py-3.5 rounded-2xl md:rounded-full transition-colors hover:bg-[#f7f9fc]"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a]">
                <Users size={11} className="text-[#c69a3f] shrink-0" />
                Oaspeți
              </span>
              <span className="mt-0.5 block text-[13.5px] font-medium text-[#3c4043]">
                {adults} {adults === 1 ? "adult" : "adulți"}
                {children > 0 &&
                  ` · ${children} ${children === 1 ? "copil" : "copii"}`}
              </span>
            </button>

            {guestsOpen && (
              <div className="absolute left-0 right-0 md:left-auto md:right-0 md:w-[280px] top-[calc(100%+10px)] z-30 rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-[0_18px_44px_rgba(13,44,92,0.18)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">
                    Adulți
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((g) => Math.max(1, g - 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-[#1a1a1a] w-4 text-center">
                      {adults}
                    </span>
                    <button
                      type="button"
                      disabled={adults >= 6}
                      onClick={() => setAdults((g) => Math.min(6, g + 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">
                    Copii
                    <span className="mt-0.5 block text-[10.5px] font-normal leading-snug text-[#8595aa]">
                      Până la 12 ani inclusiv. De la 13 ani se consideră adult.
                    </span>
                  </span>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren((g) => Math.max(0, g - 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-[#1a1a1a] w-4 text-center">
                      {children}
                    </span>
                    <button
                      type="button"
                      disabled={children >= 4}
                      onClick={() => setChildren((g) => Math.min(4, g + 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 bg-[#c69a3f] text-white border-none rounded-xl md:rounded-full px-7 py-3.5 font-sans text-[13px] font-semibold tracking-wide whitespace-nowrap shrink-0 m-2 md:m-0 md:ml-1 w-[calc(100%-16px)] md:w-auto transition-all duration-200 hover:bg-[#b8882e]"
          >
            <Search size={15} />
            Verifică disponibilitate
          </button>
        </div>


        {/* WAVE DIVIDER — Lipit de fundul absolut al secțiunii, randat frumos sub bara albă */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
            fill="#c69a3f"
            opacity="0.35"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
            fill="#0d2c5c"
            opacity="0.5"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
            fill="#ffffff"
          />
        </svg>
      </section>
    </div>
  );
}
