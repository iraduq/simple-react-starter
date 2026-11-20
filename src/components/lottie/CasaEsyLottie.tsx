import { LottieLight } from "lottie-react";
import {
  CASA_ESY_LOTTIE_BY_ID,
  type CasaEsyLottieId,
} from "./casaEsyLottieData";

interface CasaEsyLottieProps {
  id: CasaEsyLottieId;
  size?: number;
  loop?: boolean | number;
  autoplay?: boolean;
  speed?: number;
  className?: string;
  playKey?: number | string;
}

export default function CasaEsyLottie({
  id,
  size = 88,
  loop = true,
  autoplay = true,
  speed = 1,
  className = "",
  playKey,
}: CasaEsyLottieProps) {
  const item = CASA_ESY_LOTTIE_BY_ID[id];
  if (!item) return null;

  return (
    <LottieLight
      key={playKey !== undefined ? `${id}-${playKey}` : id}
      src={item.animationData}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={`select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
