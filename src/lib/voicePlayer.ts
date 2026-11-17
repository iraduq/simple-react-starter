import { API_URL } from "./config";

const API_BASE = API_URL.replace(/\/$/, "");
const TTS_URL = `${API_BASE}/api/chat/tts`;

export interface VoicePlayer {
  speak: (text: string, lang?: string, voice?: "female" | "male") => Promise<void>;
  stop: () => void;
}

function cleanTextForBrowserSpeech(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>~]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function speakBrowserFallback(
  text: string,
  lang: string,
  onDone: () => void,
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone();
    return;
  }
  const clean = cleanTextForBrowserSpeech(text);
  if (!clean) {
    onDone();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const prefix = (lang || "ro").toLowerCase().slice(0, 2);
    const matched = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (matched) utter.voice = matched;
    utter.lang = prefix === "ro" ? "ro-RO" : lang || "en-US";
    utter.rate = 1.02;
    utter.onend = onDone;
    utter.onerror = onDone;
    window.speechSynthesis.speak(utter);
  } catch {
    onDone();
  }
}

export function createVoicePlayer(onSpeakingChange?: (speaking: boolean) => void): VoicePlayer {
  let seqId = 0;
  let audioEl: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;
  let abortCtrl: AbortController | null = null;

  const notify = (speaking: boolean) => {
    onSpeakingChange?.(speaking);
  };

  const revokeUrl = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  };

  const stop = () => {
    seqId += 1;
    if (abortCtrl) {
      abortCtrl.abort();
      abortCtrl = null;
    }
    if (audioEl) {
      audioEl.onended = null;
      audioEl.onerror = null;
      audioEl.pause();
      audioEl.src = "";
      audioEl = null;
    }
    revokeUrl();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore speechSynthesis cancel errors
      }
    }
    notify(false);
  };

  const speak = async (
    text: string,
    lang: string = "ro",
    voice: "female" | "male" = "female",
  ): Promise<void> => {
    stop();
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

      const blob = await res.blob();
      if (mySeq !== seqId) return;
      if (!blob || blob.size < 64) throw new Error("Empty TTS audio");

      const url = URL.createObjectURL(blob);
      objectUrl = url;
      const audio = new Audio(url);
      audioEl = audio;

      const cleanup = () => {
        if (mySeq === seqId) {
          audioEl = null;
          revokeUrl();
          notify(false);
        }
      };
      audio.onended = cleanup;
      audio.onerror = () => {
        cleanup();
        if (mySeq === seqId) {
          speakBrowserFallback(trimmed, lang, () => {
            if (mySeq === seqId) notify(false);
          });
        }
      };

      await audio.play();
    } catch (err: any) {
      if (err?.name === "AbortError" || mySeq !== seqId) return;
      speakBrowserFallback(trimmed, lang, () => {
        if (mySeq === seqId) notify(false);
      });
    }
  };

  return { speak, stop };
}
