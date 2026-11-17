import { API_URL } from "./config";

const API_BASE = API_URL.replace(/\/$/, "");
const TTS_URL = `${API_BASE}/api/chat/tts`;

export interface VoicePlayer {
  speak: (text: string, lang?: string, voice?: "female" | "male") => Promise<void>;
  stop: () => void;
}

let sharedAudioCtx: AudioContext | null = null;
let sharedAudioEl: HTMLAudioElement | null = null;
let unlockerInstalled = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new Ctx();
  }
  return sharedAudioCtx;
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

          const src = ctx.createBufferSource();
          src.buffer = decoded;
          src.connect(ctx.destination);
          bufferSource = src;
          src.onended = () => {
            if (mySeq === seqId) {
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
