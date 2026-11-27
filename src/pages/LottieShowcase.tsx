import { useEffect, useMemo, useState } from "react";
import { CASA_ESY_LOTTIE_CATALOG, type CasaEsyLottieMeta } from "../components/lottie/casaEsyLottieData";
import { useToast } from "../components/Toast";
import { type CategoryFilter, type StageBg, ROOM_SERVICE_STEPS } from "./LottieShowcase/types";
import LottieShowcaseHeader from "./LottieShowcase/components/LottieShowcaseHeader";
import LottieOrderStepperDemo from "./LottieShowcase/components/LottieOrderStepperDemo";
import LottieFilterBar from "./LottieShowcase/components/LottieFilterBar";
import LottieCatalogCard from "./LottieShowcase/components/LottieCatalogCard";

export default function LottieShowcase() {
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [speed, setSpeed] = useState<number>(1);
  const [stageBg, setStageBg] = useState<StageBg>("white");
  const [globalReplayKey, setGlobalReplayKey] = useState<number>(0);
  const [cardReplayKeys, setCardReplayKeys] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
    setCardReplayKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c] pt-28 sm:pt-32 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LottieShowcaseHeader onReplayAll={() => setGlobalReplayKey((k) => k + 1)} />
        <LottieOrderStepperDemo
          activeStepIdx={activeStepIdx}
          setActiveStepIdx={setActiveStepIdx}
          autoCycle={autoCycle}
          setAutoCycle={setAutoCycle}
          speed={speed}
          globalReplayKey={globalReplayKey}
        />
        <LottieFilterBar
          category={category}
          setCategory={setCategory}
          speed={speed}
          setSpeed={setSpeed}
          stageBg={stageBg}
          setStageBg={setStageBg}
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <LottieCatalogCard
              key={item.id}
              item={item}
              speed={speed}
              stageBg={stageBg}
              cardKey={`${globalReplayKey}-${cardReplayKeys[item.id] || 0}`}
              isCopied={copiedId === item.id}
              onReplayCard={replayCard}
              onDownloadJson={handleDownloadJson}
              onCopySnippet={handleCopySnippet}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
