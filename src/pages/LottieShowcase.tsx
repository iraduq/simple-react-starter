import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  RotateCcw,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  ArrowUpRight,
  Layers,
  Gauge,
  Palette,
} from "lucide-react";
import CasaEsyLottie from "../components/lottie/CasaEsyLottie";
import {
  CASA_ESY_LOTTIE_CATALOG,
  type CasaEsyLottieId,
  type CasaEsyLottieMeta,
} from "../components/lottie/casaEsyLottieData";
import { useToast } from "../components/Toast";

type CategoryFilter =
  | "all"
  | "room_service"
  | "bookings_payments"
  | "concierge_vip"
  | "operations_system";

type StageBg = "white" | "slate" | "navy";

const CATEGORY_TABS: Array<{ id: CategoryFilter; label: string; count: number }> = [
  { id: "all", label: "Toate Animațiile", count: 16 },
  { id: "room_service", label: "Room Service Live", count: 4 },
  { id: "bookings_payments", label: "Rezervări & Plăți", count: 4 },
  { id: "concierge_vip", label: "Concierge & VIP", count: 4 },
  { id: "operations_system", label: "Operațiuni & Sistem", count: 4 },
];

const ROOM_SERVICE_STEPS: Array<{
  id: CasaEsyLottieId;
  num: string;
  title: string;
  subtitle: string;
}> = [
  {
    id: "order-registered",
    num: "01",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
  },
  {
    id: "order-preparing",
    num: "02",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
  },
  {
    id: "order-delivering",
    num: "03",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
  },
  {
    id: "order-delivered",
    num: "04",
    title: "Livrată",
    subtitle: "Predată · Poftă bună",
  },
];

export default function LottieShowcase() {
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [speed, setSpeed] = useState<number>(1);
  const [stageBg, setStageBg] = useState<StageBg>("white");
  const [globalReplayKey, setGlobalReplayKey] = useState<number>(0);
  const [cardReplayKeys, setCardReplayKeys] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Room Service Stepper Demo state
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [autoCycle, setAutoCycle] = useState<boolean>(true);

  useEffect(() => {
    if (!autoCycle) return;
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % ROOM_SERVICE_STEPS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [autoCycle]);

  const filteredItems = useMemo(() => {
    if (category === "all") return CASA_ESY_LOTTIE_CATALOG;
    return CASA_ESY_LOTTIE_CATALOG.filter((item) => item.category === category);
  }, [category]);

  const progressPct = (activeStepIdx / (ROOM_SERVICE_STEPS.length - 1)) * 100;

  const handleDownloadJson = (item: CasaEsyLottieMeta) => {
    const jsonString = JSON.stringify(item.animationData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casa-esy-${item.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Fișierul casa-esy-${item.id}.json a fost descărcat!`, "success");
  };

  const handleCopySnippet = (item: CasaEsyLottieMeta) => {
    const snippet = `<CasaEsyLottie id="${item.id}" size={72} loop autoplay />`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiedId(item.id);
      toast("Codul componentei Lottie a fost copiat!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const replayCard = (id: string) => {
    setCardReplayKeys((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const stageBgClass =
    stageBg === "navy"
      ? "bg-[#0d2c5c] border-[#163c78]"
      : stageBg === "slate"
        ? "bg-[#f8fafc] border-[#e1e8f0]"
        : "bg-white border-[#e1e8f0]";

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c] pt-28 sm:pt-32 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── HEADER PE FUNDAL ALB PUR ── */}
        <div className="pb-8 border-b border-[#e1e8f0] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/35 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9c7624]">
              <Sparkles size={13} className="text-[#c69a3f]" />
              Galerie Oficială Lottie · Vila Casa Esy
            </div>
            <h1 className="mt-3 font-['Outfit',sans-serif] text-[32px] sm:text-[42px] font-bold tracking-tight text-[#0d2c5c] leading-tight">
              Animații Lottie în stilul{" "}
              <span className="text-[#c69a3f]">Vila Casa Esy</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[14.5px] text-[#64748b] leading-relaxed">
              16 animații vectoriale Bodymovin/Lottie (60 FPS) create în paleta aplicației (
              <code className="text-xs font-bold text-[#0d2c5c]">#0d2c5c</code> Royal Navy,{" "}
              <code className="text-xs font-bold text-[#c69a3f]">#c69a3f</code> Warm Gold și{" "}
              <code className="text-xs font-bold text-emerald-600">#10b981</code> Emerald), gata de previzualizare, descărcare <code className="text-xs font-bold">.json</code> și integrare în paginile cheie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setGlobalReplayKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] hover:bg-[#163c78] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition cursor-pointer shadow-sm"
            >
              <RotateCcw size={14} className="text-[#c69a3f]" />
              Replay Toate
            </button>
            <Link
              to="/comanda/ORD-7783"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0d2c5c] no-underline transition"
            >
              Vezi în Pagina de Comandă
              <ArrowUpRight size={14} className="text-[#c69a3f]" />
            </Link>
          </div>
        </div>

        {/* ── SECȚIUNEA 1: SIMULATOR LIVE PENTRU TRACKER-UL DE COMANDĂ (DIN SCREENSHOT) ── */}
        <div className="mt-9 rounded-[26px] border border-[#e1e8f0] bg-white p-6 sm:p-10 shadow-[0_12px_45px_rgba(13,44,92,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-7 border-b border-[#e1e8f0]">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
                <span className="h-2 w-2 rounded-full bg-[#c69a3f]" />
                Demo Interactiv Live · Room Service Stepper
              </div>
              <h2 className="mt-1 font-['Outfit',sans-serif] text-2xl sm:text-3xl font-bold text-[#0d2c5c]">
                Progresul Comenzii cu Iconițe Lottie Animate
              </h2>
              <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
                Dă click pe oricare dintre cei 4 pași de mai jos sau lasă simularea automată să parcurgă fluxul comenzii.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setAutoCycle((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] border transition cursor-pointer ${
                  autoCycle
                    ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                    : "bg-white text-[#0d2c5c] border-[#e1e8f0] hover:border-[#0d2c5c]"
                }`}
              >
                {autoCycle ? (
                  <>
                    <Pause size={13} className="text-[#c69a3f]" />
                    Auto-Demo Pornit
                  </>
                ) : (
                  <>
                    <Play size={13} className="text-[#c69a3f]" />
                    Pornește Auto-Demo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cei 4 pași exact ca în captura ta, dar cu Lottie-urile animate */}
          <div className="mt-10 relative">
            {/* Linia orizontală de legătură */}
            <div
              className="hidden sm:block absolute top-11 left-[12.5%] right-[12.5%] h-[2.5px] rounded-full bg-[#e6ecf5]"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#10b981] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
              {ROOM_SERVICE_STEPS.map((step, idx) => {
                const isCurrent = idx === activeStepIdx;
                const isDone = idx < activeStepIdx;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setAutoCycle(false);
                      setActiveStepIdx(idx);
                    }}
                    className="group flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3.5 bg-transparent border-0 p-2 rounded-2xl hover:bg-[#f8fafc] transition cursor-pointer text-left sm:text-center"
                  >
                    <div
                      className={`relative w-[88px] h-[88px] rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                        isCurrent
                          ? "bg-white ring-4 ring-[#c69a3f]/35 shadow-[0_14px_34px_-10px_rgba(13,44,92,0.35)] scale-105"
                          : isDone
                            ? "bg-white ring-2 ring-[#0d2c5c]/20 opacity-95"
                            : "bg-[#f8fafc] border border-[#e1e8f0] opacity-75 group-hover:opacity-100"
                      }`}
                    >
                      <CasaEsyLottie
                        id={step.id}
                        size={78}
                        speed={speed}
                        playKey={`${globalReplayKey}-${activeStepIdx === idx ? "active" : "idle"}`}
                      />
                    </div>

                    <div>
                      <div
                        className={`text-[11px] font-bold uppercase tracking-[0.22em] ${
                          isCurrent
                            ? "text-[#c69a3f]"
                            : isDone
                              ? "text-emerald-600"
                              : "text-[#94a3b8]"
                        }`}
                      >
                        {step.num}
                      </div>
                      <div
                        className={`font-['Outfit',sans-serif] text-[19px] font-bold leading-tight mt-0.5 ${
                          isCurrent || isDone ? "text-[#0d2c5c]" : "text-[#94a3b8]"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">
                        {step.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── BARA DE FILTRE & CONTROALE PENTRU CATALOGUL COMPLET (16 LOTTIE-URI) ── */}
        <div className="mt-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#e1e8f0]">
          {/* Categorii */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((tab) => {
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#0d2c5c] text-white shadow-xs"
                      : "bg-white border border-[#e1e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                  }`}
                >
                  <Layers
                    size={13}
                    className={active ? "text-[#c69a3f]" : "text-[#94a3b8]"}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                      active
                        ? "bg-white/15 text-[#e6b85c]"
                        : "bg-[#f8fafc] text-[#64748b]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controale Viteză & Fundal Scenă */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white p-1">
              <span className="inline-flex items-center gap-1 pl-2.5 pr-1 text-[11px] font-bold text-[#64748b]">
                <Gauge size={13} className="text-[#c69a3f]" />
                Viteză:
              </span>
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    speed === s
                      ? "bg-[#0d2c5c] text-white"
                      : "text-[#475569] hover:bg-[#f8fafc]"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white p-1">
              <span className="inline-flex items-center gap-1 pl-2.5 pr-1 text-[11px] font-bold text-[#64748b]">
                <Palette size={13} className="text-[#c69a3f]" />
                Scenă:
              </span>
              {(
                [
                  { id: "white", label: "Alb" },
                  { id: "slate", label: "Soft" },
                  { id: "navy", label: "Navy" },
                ] as const
              ).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setStageBg(bg.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    stageBg === bg.id
                      ? "bg-[#0d2c5c] text-white"
                      : "text-[#475569] hover:bg-[#f8fafc]"
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── GRIDUL CELOR 16 ANIMAȚII LOTTIE ── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const cardKey = `${globalReplayKey}-${cardReplayKeys[item.id] || 0}`;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-[24px] border border-[#e1e8f0] bg-white p-6 shadow-[0_10px_35px_rgba(13,44,92,0.05)] hover:border-[#c69a3f]/60 hover:shadow-[0_16px_45px_rgba(13,44,92,0.09)] transition-all"
              >
                <div>
                  {/* Card Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      #{item.stepNumber} · {item.categoryLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => replayCard(item.id)}
                      title="Reia animația"
                      className="w-8 h-8 rounded-full border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] text-[#0d2c5c] flex items-center justify-center transition cursor-pointer"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>

                  {/* Lottie Stage */}
                  <div
                    className={`mt-4 h-44 rounded-2xl border flex items-center justify-center transition-colors ${stageBgClass}`}
                  >
                    <CasaEsyLottie
                      id={item.id}
                      size={128}
                      speed={speed}
                      playKey={cardKey}
                    />
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c69a3f]">
                      {item.subtitle}
                    </div>
                    <h3 className="mt-0.5 font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#64748b] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Where to use + Actions */}
                <div className="mt-5 pt-4 border-t border-[#e1e8f0] space-y-3">
                  <div className="rounded-xl bg-[#f8fafc] border border-[#e1e8f0] px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
                      Unde merită integrat:
                    </div>
                    <div className="text-xs font-bold text-[#0d2c5c] mt-0.5 leading-snug">
                      {item.whereToUse}
                    </div>
                    <Link
                      to={
                        item.routeExample === "/comanda/:orderCode"
                          ? "/comanda/ORD-7783"
                          : item.routeExample === "/checkin/:bookingCode"
                            ? "/checkin/ESY-DEMO"
                            : item.routeExample
                      }
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#c69a3f] hover:text-[#0d2c5c] no-underline"
                    >
                      <span>{item.routeExample}</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadJson(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-white hover:border-[#0d2c5c] px-3 py-2 text-[11px] font-bold text-[#0d2c5c] transition cursor-pointer"
                    >
                      <Download size={13} className="text-[#c69a3f]" />
                      JSON Lottie
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopySnippet(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] px-3 py-2 text-[11px] font-bold text-white transition cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          Copiat
                        </>
                      ) : (
                        <>
                          <Copy size={13} className="text-[#c69a3f]" />
                          Cod React
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
