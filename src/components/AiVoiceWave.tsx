import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Square } from "lucide-react";
import {
  configureAnalyserNode,
  extractAnalyserSpectrum,
  getAudioContext,
  readLiveAudioSpectrum,
} from "../lib/voicePlayer";

interface AiVoiceWaveProps {
  active: boolean;
  mode?: "speaking" | "listening";
  label?: string;
  onStop?: () => void;
  compact?: boolean;
  wrapperClassName?: string;
}

interface WaveLayer {
  freq: number;
  speed: number;
  phase: number;
  ampRatio: number;
  harmonicFreq: number;
  harmonicAmp: number;
  leftColor: string;
  midColor: string;
  rightColor: string;
}

const WAVE_LAYERS: WaveLayer[] = [
  {
    freq: 3.1,
    speed: 2.3,
    phase: 0.2,
    ampRatio: 0.92,
    harmonicFreq: 6.2,
    harmonicAmp: 0.34,
    leftColor: "rgba(34, 211, 238, 0.36)",
    midColor: "rgba(56, 189, 248, 0.30)",
    rightColor: "rgba(139, 92, 246, 0.34)",
  },
  {
    freq: 4.4,
    speed: -2.8,
    phase: 1.5,
    ampRatio: 0.84,
    harmonicFreq: 8.1,
    harmonicAmp: 0.28,
    leftColor: "rgba(59, 130, 246, 0.38)",
    midColor: "rgba(99, 102, 241, 0.36)",
    rightColor: "rgba(168, 85, 247, 0.38)",
  },
  {
    freq: 5.7,
    speed: 3.4,
    phase: 2.8,
    ampRatio: 0.72,
    harmonicFreq: 9.8,
    harmonicAmp: 0.24,
    leftColor: "rgba(96, 165, 250, 0.34)",
    midColor: "rgba(139, 92, 246, 0.38)",
    rightColor: "rgba(217, 70, 239, 0.34)",
  },
  {
    freq: 6.9,
    speed: -3.9,
    phase: 4.1,
    ampRatio: 0.56,
    harmonicFreq: 11.4,
    harmonicAmp: 0.2,
    leftColor: "rgba(103, 232, 249, 0.28)",
    midColor: "rgba(167, 139, 250, 0.34)",
    rightColor: "rgba(192, 132, 252, 0.32)",
  },
];

export default function AiVoiceWave({
  active,
  mode = "speaking",
  label,
  onStop,
  compact = false,
  wrapperClassName = "",
}: AiVoiceWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;
    const startMs = performance.now();

    let micStream: MediaStream | null = null;
    let micSource: MediaStreamAudioSourceNode | null = null;
    let micAnalyser: AnalyserNode | null = null;
    let micFreqBuf: Uint8Array<ArrayBuffer> | undefined;
    let micTimeBuf: Uint8Array<ArrayBuffer> | undefined;

    if (
      mode === "listening" &&
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      void navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((tr) => tr.stop());
            return;
          }
          const audioCtx = getAudioContext();
          if (!audioCtx) {
            stream.getTracks().forEach((tr) => tr.stop());
            return;
          }
          if (audioCtx.state === "suspended") {
            void audioCtx.resume().catch(() => {});
          }
          micStream = stream;
          micAnalyser = configureAnalyserNode(audioCtx.createAnalyser());
          micSource = audioCtx.createMediaStreamSource(stream);
          // Notă: NU conectăm la destination pentru a evita microfonia/ecoul
          micSource.connect(micAnalyser);
          micFreqBuf = new Uint8Array(micAnalyser.frequencyBinCount);
          micTimeBuf = new Uint8Array(micAnalyser.fftSize);
        })
        .catch(() => {
          // Permisiune microfon refuzată sau indisponibilă — fallback liniștit
        });
    }

    let smoothRms = 0;
    const smoothBands: [number, number, number, number] = [0, 0, 0, 0];

    const renderFrame = (nowMs: number) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 220);
      const height = Math.max(rect.height, compact ? 54 : 74);
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const spectrum =
        mode === "listening" && micAnalyser
          ? extractAnalyserSpectrum(micAnalyser, micFreqBuf, micTimeBuf)
          : readLiveAudioSpectrum();

      const rmsRate = spectrum.rms > smoothRms ? 0.38 : 0.16;
      smoothRms += (spectrum.rms - smoothRms) * rmsRate;
      for (let b = 0; b < 4; b++) {
        const rate = spectrum.bands[b] > smoothBands[b] ? 0.38 : 0.16;
        smoothBands[b] += (spectrum.bands[b] - smoothBands[b]) * rate;
      }

      const t = (nowMs - startMs) / 1000;
      const centerY = height / 2;
      const maxAmp = height * 0.44;
      const hasLiveSignal = spectrum.active || smoothRms > 0.015;
      const idleCadence = 0.24 + 0.08 * Math.sin(t * 3.0);
      const padX = 8;
      const drawW = width - padX * 2;
      const samples = 96;

      WAVE_LAYERS.forEach((layer, layerIdx) => {
        const pointsTop: Array<{ x: number; y: number }> = [];
        const pointsBottom: Array<{ x: number; y: number }> = [];

        const liveBand = smoothBands[layerIdx] ?? smoothRms;
        const bandDrive = hasLiveSignal
          ? 0.12 + liveBand * 1.15 + smoothRms * 0.45
          : idleCadence;

        for (let i = 0; i <= samples; i++) {
          const u = i / samples;
          const x = padX + u * drawW;
          const envelope = Math.pow(Math.sin(Math.PI * u), 2.35);

          const spatialShift = hasLiveSignal ? liveBand * 2.2 : 0;
          const primary = Math.sin(u * Math.PI * layer.freq + t * layer.speed + layer.phase + spatialShift);
          const secondary =
            layer.harmonicAmp *
            Math.sin(u * Math.PI * layer.harmonicFreq - t * layer.speed * 0.75 + layerIdx);
          const rippleBoost = hasLiveSignal ? 0.22 + smoothRms * 0.24 : 0.26;
          const displacement = Math.abs(primary * 0.68 + secondary) + rippleBoost;
          const amp = Math.min(maxAmp, maxAmp * layer.ampRatio * bandDrive * envelope * displacement);

          pointsTop.push({ x, y: centerY - amp });
          pointsBottom.push({ x, y: centerY + amp });
        }

        ctx.beginPath();
        ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
        for (let i = 1; i < pointsTop.length; i++) {
          const prev = pointsTop[i - 1];
          const curr = pointsTop[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.lineTo(pointsTop[pointsTop.length - 1].x, centerY);

        for (let i = pointsBottom.length - 1; i >= 1; i--) {
          const curr = pointsBottom[i];
          const prev = pointsBottom[i - 1];
          const midX = (curr.x + prev.x) / 2;
          const midY = (curr.y + prev.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(padX, centerY, width - padX, centerY);
        grad.addColorStop(0, layer.leftColor);
        grad.addColorStop(0.5, layer.midColor);
        grad.addColorStop(1, layer.rightColor);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      const lineGrad = ctx.createLinearGradient(padX, centerY, width - padX, centerY);
      lineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      lineGrad.addColorStop(0.22, "rgba(186, 230, 253, 0.92)");
      lineGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.98)");
      lineGrad.addColorStop(0.78, "rgba(216, 180, 254, 0.92)");
      lineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(padX, centerY);
      ctx.lineTo(width - padX, centerY);
      ctx.strokeStyle = lineGrad;
      ctx.shadowColor = "rgba(139, 92, 246, 0.75)";
      ctx.shadowBlur = 4 + smoothRms * 14;
      ctx.lineWidth = 1.4 + smoothRms * 2.2;
      ctx.stroke();
      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (micSource) {
        try {
          micSource.disconnect();
        } catch {
          // ignore
        }
      }
      if (micStream) {
        micStream.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, [active, compact, mode]);

  const statusText =
    label ||
    (mode === "listening" ? "Te ascult... vorbește acum" : "Esy · Concierge AI vorbește");

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 8, height: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`overflow-hidden ${wrapperClassName}`}
        >
          <div
            className={`relative rounded-2xl border border-[#dbeafe] shadow-sm ${
              compact ? "px-3 py-2" : "px-3.5 py-2.5"
            }`}
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,248,255,0.98) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-xs"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #38bdf8 100%)",
                  }}
                >
                  <span className="flex items-center gap-[2px] h-3">
                    {[0.45, 0.9, 1, 0.75, 0.45].map((scale, idx) => (
                      <motion.span
                        key={idx}
                        className="w-[2px] rounded-full bg-white"
                        animate={{ height: [`${Math.round(scale * 4)}px`, `${Math.round(scale * 11)}px`, `${Math.round(scale * 4)}px`] }}
                        transition={{
                          duration: 0.65,
                          repeat: Infinity,
                          delay: idx * 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </span>
                </span>
                <span
                  className="truncate text-[11.5px] font-semibold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #2563eb 0%, #6366f1 55%, #0ea5e9 100%)",
                  }}
                >
                  {statusText}
                </span>
              </div>

              {onStop && (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-2.5 py-1 text-[10.5px] font-semibold text-slate-600 transition cursor-pointer"
                >
                  <Square size={9} fill="currentColor" /> Oprește
                </button>
              )}
            </div>

            <canvas
              ref={canvasRef}
              className={`block w-full ${compact ? "h-[52px]" : "h-[70px]"}`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
