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
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>(380);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const clientWidth = el.getBoundingClientRect().width;
      if (clientWidth > 0) {
        // Google button accepts width between 200 and 400 px
        const clamped = Math.min(400, Math.max(220, Math.floor(clientWidth)));
        setButtonWidth(clamped);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[400px] mx-auto flex items-center justify-center min-h-[44px] transition-transform duration-200 hover:scale-[1.01]"
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
        width={buttonWidth ? `${buttonWidth}` : "380"}
        useOneTap={false}
      />
    </div>
  );
}
