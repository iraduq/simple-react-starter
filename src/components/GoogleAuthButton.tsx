import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

interface GoogleAuthButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: "continue_with" | "signup_with";
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const label =
    text === "signup_with"
      ? "Înregistrează-te cu Google"
      : "Continuă cu Google";

  const containerRef = useRef<HTMLDivElement>(null);
  const gsiWrapRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>(360);
  const [gsiReady, setGsiReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        // Google GIS renderButton acceptă între 200 și 400 px
        const clamped = Math.min(400, Math.max(220, Math.floor(w)));
        setButtonWidth((prev) => (Math.abs(prev - clamped) >= 8 ? clamped : prev));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Detectăm dacă iframe-ul oficial Google Identity Services a fost randat
  useEffect(() => {
    const wrap = gsiWrapRef.current;
    if (!wrap) return;
    const check = () => {
      const hasIframe = Boolean(wrap.querySelector("iframe"));
      setGsiReady(hasIframe);
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(wrap, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [buttonWidth]);

  const handleFallbackClick = () => {
    const googleId = (window as any)?.google?.accounts?.id;
    if (googleId?.prompt) {
      try {
        googleId.prompt();
        return;
      } catch {
        // fallback below
      }
    }
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[400px] mx-auto h-[46px] select-none"
    >
      {/* Buton vizual Casa Esy — întotdeauna vizibil, chiar dacă scriptul Google întârzie sau e blocat */}
      <button
        type="button"
        onClick={handleFallbackClick}
        aria-label={label}
        className="w-full h-full flex items-center justify-center gap-3 rounded-[10px] border border-[#d8e1ee] bg-white text-[#0d2c5c] text-[14px] font-semibold tracking-wide shadow-[0_2px_8px_rgba(13,44,92,0.06)] transition-all duration-200 hover:border-[#c69a3f] hover:bg-[#fffdf8] hover:shadow-[0_6px_18px_rgba(13,44,92,0.10)] cursor-pointer"
      >
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{label}</span>
      </button>

      {/* Stratul real Google Identity Services — suprapus exact peste buton când e randat */}
      <div
        ref={gsiWrapRef}
        className={`absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-[10px] ${
          gsiReady ? "opacity-[0.015] pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => {
            console.error("Google authentication error.");
            onError?.();
          }}
          theme="outline"
          size="large"
          text={text}
          shape="rectangular"
          width={`${buttonWidth}`}
          ux_mode="popup"
          useOneTap={false}
        />
      </div>
    </div>
  );
}
