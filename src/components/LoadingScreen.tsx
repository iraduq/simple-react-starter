import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsLoading(false), 800);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-[opacity,transform] duration-[800ms] ${
        fadeOut
          ? "opacity-0 scale-110 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at center, #113263 0%, #0d2c5c 100%)",
      }}
    >
      <style>{`
        @keyframes ls-pulseGlow {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          to   { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes ls-spinPattern {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ls-floatUp {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          20%  { transform: translateY(-50px) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-300px) scale(0.5); opacity: 0; }
        }
        @keyframes ls-swoopInLeft {
          0%   { opacity: 0; transform: translate(-150px,-100px) rotate(-1080deg) scale(0); filter: blur(8px); }
          60%  { opacity: 1; transform: translate(10px,10px) rotate(30deg) scale(1.3); filter: blur(0); text-shadow: 0 0 20px #c69a3f; }
          100% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); text-shadow: 0 0 12px rgba(198,154,63,0.5); }
        }
        @keyframes ls-swoopInCenter {
          0%   { opacity: 0; transform: translate(0,-150px) rotate(-1080deg) scale(0); filter: blur(8px); }
          60%  { opacity: 1; transform: translate(0,15px) rotate(30deg) scale(1.4); filter: blur(0); text-shadow: 0 0 25px #c69a3f; }
          100% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); text-shadow: 0 0 15px rgba(198,154,63,0.6); }
        }
        @keyframes ls-swoopInRight {
          0%   { opacity: 0; transform: translate(150px,-100px) rotate(1080deg) scale(0); filter: blur(8px); }
          60%  { opacity: 1; transform: translate(-10px,10px) rotate(-30deg) scale(1.3); filter: blur(0); text-shadow: 0 0 20px #c69a3f; }
          100% { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); text-shadow: 0 0 12px rgba(198,154,63,0.5); }
        }
        @keyframes ls-cinematicText {
          0%   { opacity: 0; letter-spacing: 0.5em; transform: translateY(20px); filter: blur(10px); }
          100% { opacity: 1; letter-spacing: 0.15em; transform: translateY(0); filter: blur(0); }
        }
        @keyframes ls-cinematicTextSub {
          0%   { opacity: 0; letter-spacing: 0.8em; transform: translateY(15px); filter: blur(8px); }
          100% { opacity: 1; letter-spacing: 0.35em; transform: translateY(0); filter: blur(0); }
        }
      `}</style>

      {/* 1. Lumina ambientală centrală */}
      <div
        className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(198,154,63,0.15) 0%, transparent 60%)",
          animation: "ls-pulseGlow 4s ease-in-out infinite alternate",
        }}
      />

      {/* 2. Geometria de lux */}
      <svg
        className="absolute top-1/2 left-1/2 w-[140vw] max-w-[1200px] h-auto -translate-x-1/2 -translate-y-1/2"
        style={{ animation: "ls-spinPattern 40s linear infinite" }}
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#c69a3f" strokeWidth="1" fill="none" opacity="0.08">
          <circle cx="400" cy="400" r="350" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="300" />
          <circle cx="400" cy="400" r="280" opacity="0.5" />
          <path d="M400,20 L400,780 M20,400 L780,400 M131,131 L669,669 M131,669 L669,131" />
          <circle cx="400" cy="400" r="120" />
          <path
            d="M400,250 L430,370 L550,400 L430,430 L400,550 L370,430 L250,400 L370,370 Z"
            fill="#c69a3f"
            opacity="0.05"
          />
        </g>
      </svg>

      {/* 3. Praful de aur plutitor */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: "20%", duration: "3.5s", delay: "0.2s", size: 3 },
          { left: "45%", duration: "4.2s", delay: "1.5s", size: 4 },
          { left: "75%", duration: "3.8s", delay: "0.8s", size: 3 },
          { left: "30%", duration: "4.5s", delay: "2.1s", size: 3 },
          { left: "85%", duration: "3.2s", delay: "0.5s", size: 2 },
          { left: "60%", duration: "4s", delay: "1.1s", size: 3 },
        ].map((p, i) => (
          <div
            key={i}
            className="absolute -bottom-5 rounded-full opacity-0"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: "#c69a3f",
              boxShadow: "0 0 8px 2px rgba(198,154,63,0.6)",
              animation: `ls-floatUp ${p.duration} ease-in infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* --- CONȚINUTUL CENTRAL --- */}
      <div className="relative z-[2] flex flex-col items-center gap-2">
        <div className="flex gap-3 text-[#c69a3f] text-2xl leading-none">
          <span
            className="inline-block opacity-0"
            style={{
              transformOrigin: "center 45%",
              animation:
                "ls-swoopInLeft 1.4s cubic-bezier(0.2,0.8,0.2,1) forwards",
              animationDelay: "0.2s",
            }}
          >
            ★
          </span>
          <span
            className="inline-block opacity-0"
            style={{
              transformOrigin: "center 45%",
              animation:
                "ls-swoopInCenter 1.4s cubic-bezier(0.2,0.8,0.2,1) forwards",
              animationDelay: "0.35s",
            }}
          >
            ★
          </span>
          <span
            className="inline-block opacity-0"
            style={{
              transformOrigin: "center 45%",
              animation:
                "ls-swoopInRight 1.4s cubic-bezier(0.2,0.8,0.2,1) forwards",
              animationDelay: "0.5s",
            }}
          >
            ★
          </span>
        </div>

        <span
          className="font-['Cormorant_Garamond',serif] text-[40px] font-semibold text-white mt-2 opacity-0"
          style={{
            animation:
              "ls-cinematicText 1.6s cubic-bezier(0.2,0.8,0.2,1) forwards",
            animationDelay: "0.7s",
          }}
        >
          CASA ESY
        </span>

        <span
          className="font-sans text-xs font-semibold uppercase text-white/75 tracking-[0.4em] opacity-0"
          style={{
            animation:
              "ls-cinematicTextSub 1.6s cubic-bezier(0.2,0.8,0.2,1) forwards",
            animationDelay: "0.9s",
          }}
        >
          HOTEL · MAMAIA
        </span>
      </div>
    </div>
  );
}
