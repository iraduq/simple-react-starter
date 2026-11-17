import { API_URL } from "./config";

const API_BASE = API_URL.replace(/\/$/, "");
const TTS_URL = `${API_BASE}/api/chat/tts`;

export interface VoicePlayer {
  speak: (text: string, lang?: string, voice?: "female" | "male") => Promise<void>;
  stop: () => void;
}

export interface AudioSpectrumSnapshot {
  active: boolean;
  rms: number;
  bands: [number, number, number, number];
}

const BAND_RANGES: ReadonlyArray<readonly [number, number]> = [
  [2, 8],   // Fundamentală joasă (~170-650 Hz)
  [8, 19],  // Vocale și formanți principali (~750-1700 Hz)
  [19, 37], // Formanți înalți & claritate (~1800-3400 Hz)
  [37, 69], // Consoane & sibilanță (~3500-6400 Hz)
];

let sharedAudioCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedAudioEl: HTMLAudioElement | null = null;
let mediaSourceNode: MediaElementAudioSourceNode | null = null;
let sharedFreqData: Uint8Array<ArrayBuffer> | null = null;
let sharedTimeData: Uint8Array<ArrayBuffer> | null = null;
let unlockerInstalled = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new Ctx();
    sharedAnalyser = null;
    mediaSourceNode = null;
  }
  return sharedAudioCtx;
}

export function configureAnalyserNode(analyser: AnalyserNode): AnalyserNode {
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.75;
  return analyser;
}

function getSharedAnalyser(ctx: AudioContext): AnalyserNode {
  if (!sharedAnalyser) {
    sharedAnalyser = configureAnalyserNode(ctx.createAnalyser());
    sharedAnalyser.connect(ctx.destination);
    sharedFreqData = new Uint8Array(sharedAnalyser.frequencyBinCount);
    sharedTimeData = new Uint8Array(sharedAnalyser.fftSize);
  }
  return sharedAnalyser;
}

export function extractAnalyserSpectrum(
  analyser: AnalyserNode | null,
  freqData?: Uint8Array<ArrayBuffer>,
  timeData?: Uint8Array<ArrayBuffer>,
): AudioSpectrumSnapshot {
  if (!analyser) {
    return { active: false, rms: 0, bands: [0, 0, 0, 0] };
  }
  const fBuf = freqData ?? new Uint8Array(analyser.frequencyBinCount);
  const tBuf = timeData ?? new Uint8Array(analyser.fftSize);

  analyser.getByteFrequencyData(fBuf);
  analyser.getByteTimeDomainData(tBuf);

  let sumSq = 0;
  for (let i = 0; i < tBuf.length; i++) {
    const centered = (tBuf[i] - 128) / 128;
    sumSq += centered * centered;
  }
  const rms = Math.min(1, Math.sqrt(sumSq / Math.max(tBuf.length, 1)) * 3.8);

  const bands: [number, number, number, number] = [0, 0, 0, 0];
  for (let b = 0; b < BAND_RANGES.length; b++) {
    const [startBin, endBin] = BAND_RANGES[b];
    const limit = Math.min(endBin, fBuf.length);
    let acc = 0;
    let count = 0;
    for (let i = startBin; i < limit; i++) {
      acc += fBuf[i];
      count += 1;
    }
    bands[b] = count > 0 ? Math.min(1, (acc / count / 255) * 1.45) : 0;
  }

  const active = rms > 0.012 || bands.some((v) => v > 0.03);
  return { active, rms, bands };
}

export function readLiveAudioSpectrum(): AudioSpectrumSnapshot {
  if (!sharedAnalyser || !sharedAudioCtx || sharedAudioCtx.state !== "running") {
    return { active: false, rms: 0, bands: [0, 0, 0, 0] };
  }
  return extractAnalyserSpectrum(
    sharedAnalyser,
    sharedFreqData ?? undefined,
    sharedTimeData ?? undefined,
  );
}

function getSharedAudioEl(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioEl) {
    sharedAudioEl = new Audio();
  }
  return sharedAudioEl;
}

export function unlockAudioPlayback(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().catch(() => {
      // ignore resume before user gesture
    });
  }
}

function installGlobalAudioUnlocker(): void {
  if (typeof window === "undefined" || unlockerInstalled) return;
  unlockerInstalled = true;
  const onGesture = () => {
    unlockAudioPlayback();
  };
  window.addEventListener("pointerdown", onGesture, { passive: true });
  window.addEventListener("keydown", onGesture, { passive: true });
  window.addEventListener("touchstart", onGesture, { passive: true });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

installGlobalAudioUnlocker();

export function createVoicePlayer(onSpeakingChange?: (speaking: boolean) => void): VoicePlayer {
  let seqId = 0;
  let bufferSource: AudioBufferSourceNode | null = null;
  let activeAudioEl: HTMLAudioElement | null = null;
  let abortCtrl: AbortController | null = null;

  const notify = (speaking: boolean) => {
    onSpeakingChange?.(speaking);
  };

  const stop = () => {
    seqId += 1;
    if (abortCtrl) {
      abortCtrl.abort();
      abortCtrl = null;
    }
    if (bufferSource) {
      try {
        bufferSource.onended = null;
        bufferSource.stop();
        bufferSource.disconnect();
      } catch {
        // ignore stop if already stopped
      }
      bufferSource = null;
    }
    if (activeAudioEl) {
      activeAudioEl.onended = null;
      activeAudioEl.onerror = null;
      activeAudioEl.pause();
      activeAudioEl.removeAttribute("src");
      activeAudioEl = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    notify(false);
  };

  const playViaDataUri = async (arrayBuffer: ArrayBuffer, mySeq: number): Promise<void> => {
    const audio = getSharedAudioEl();
    if (!audio || mySeq !== seqId) {
      notify(false);
      return;
    }

    const ctx = getAudioContext();
    if (ctx) {
      try {
        if (ctx.state === "suspended") await ctx.resume();
        const analyser = getSharedAnalyser(ctx);
        if (!mediaSourceNode) {
          mediaSourceNode = ctx.createMediaElementSource(audio);
          mediaSourceNode.connect(analyser);
        }
      } catch {
        // Ignore if createMediaElementSource cannot attach
      }
    }

    const base64 = arrayBufferToBase64(arrayBuffer);
    activeAudioEl = audio;

    const cleanup = () => {
      if (mySeq === seqId) {
        activeAudioEl = null;
        notify(false);
      }
    };
    audio.onended = cleanup;
    audio.onerror = cleanup;
    audio.src = `data:audio/mpeg;base64,${base64}`;
    await audio.play();
  };

  const speak = async (
    text: string,
    lang: string = "ro",
    voice: "female" | "male" = "female",
  ): Promise<void> => {
    stop();
    unlockAudioPlayback();
    const trimmed = text?.trim();
    if (!trimmed) return;

    const mySeq = seqId;
    const ctrl = new AbortController();
    abortCtrl = ctrl;
    notify(true);

    try {
      const res = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, lang: lang || "ro", voice }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

      const arrayBuffer = await res.arrayBuffer();
      if (mySeq !== seqId || arrayBuffer.byteLength < 64) {
        if (mySeq === seqId) notify(false);
        return;
      }

      const ctx = getAudioContext();
      if (ctx) {
        try {
          if (ctx.state === "suspended") {
            await ctx.resume();
          }
          const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
          if (mySeq !== seqId) return;

          const analyser = getSharedAnalyser(ctx);
          const src = ctx.createBufferSource();
          src.buffer = decoded;
          src.connect(analyser);
          bufferSource = src;
          src.onended = () => {
            if (mySeq === seqId) {
              try {
                src.disconnect();
              } catch {
                // ignore
              }
              bufferSource = null;
              notify(false);
            }
          };
          src.start(0);
          return;
        } catch {
          // If Web Audio decode or resume fails, fall back cleanly to data: URI audio element (never speechSynthesis)
        }
      }

      await playViaDataUri(arrayBuffer, mySeq);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError" || mySeq !== seqId) return;
      notify(false);
    }
  };

  return { speak, stop };
}
