import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface GoogleAuthButtonProps {
  onSuccess: (credentialResponse: { credential: string }) => void;
  onError?: (reason?: string) => void;
  text?: "continue_with" | "signup_with";
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
  text = "continue_with",
}: GoogleAuthButtonProps) {
  const [opening, setOpening] = useState(false);

  const label =
    text === "signup_with"
      ? "Înregistrează-te cu Google"
      : "Continuă cu Google";

  const triggerGooglePopup = useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    onSuccess: (tokenResponse) => {
      setOpening(false);
      if (tokenResponse?.access_token) {
        onSuccess({ credential: tokenResponse.access_token });
      } else {
        onError?.("missing_access_token");
      }
    },
    onError: (err) => {
      setOpening(false);
      console.error("Google OAuth error:", err);
      onError?.(err?.error_description || err?.error || "oauth_error");
    },
    onNonOAuthError: (nonOAuthErr) => {
      setOpening(false);
      // Utilizatorul a închis fereastra popup manual — nu arătăm eroare
      if (nonOAuthErr?.type === "popup_closed") return;
      console.error("Google non-OAuth error:", nonOAuthErr);
      onError?.(nonOAuthErr?.type || "popup_error");
    },
  });

  const handleClick = () => {
    const oauth2 = (window as any)?.google?.accounts?.oauth2;
    if (!oauth2) {
      console.error(
        "Google Identity Services nu s-a încărcat (posibil blocat de extensie/ad-blocker).",
      );
      onError?.("script_blocked");
      return;
    }
    setOpening(true);
    try {
      triggerGooglePopup();
    } catch (err) {
      setOpening(false);
      console.error("Eroare la deschiderea popup-ului Google:", err);
      onError?.("popup_exception");
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={opening}
        aria-label={label}
        className="w-full h-[48px] flex items-center justify-center gap-3 rounded-[10px] border border-[#d8e1ee] bg-white text-[#0d2c5c] text-[14.5px] font-semibold tracking-wide shadow-[0_2px_8px_rgba(13,44,92,0.06)] transition-all duration-200 hover:border-[#c69a3f] hover:bg-[#fffdf8] hover:shadow-[0_6px_18px_rgba(13,44,92,0.10)] disabled:opacity-65 disabled:cursor-wait cursor-pointer"
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
        <span>{opening ? "Se deschide Google..." : label}</span>
      </button>
    </div>
  );
}
