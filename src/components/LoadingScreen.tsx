import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Am mărit puțin timpul la 2.8 secunde ca să se poată bucura de efect
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Așteptăm mai mult (800ms) pentru animația spectaculoasă de exit (zoom & fade)
      setTimeout(() => setIsLoading(false), 800);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
      {/* --- ELEMENTELE MAGICE DE FUNDAL --- */}

      {/* 1. Lumina ambientală centrală */}
      <div className="ls-ambient-glow"></div>

      {/* 2. Geometria de lux (Soare/Busolă abstractă din linii fine SVG) */}
      <svg
        className="ls-bg-pattern"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          stroke="var(--color-accent)"
          strokeWidth="1"
          fill="none"
          opacity="0.08"
        >
          <circle cx="400" cy="400" r="350" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="300" />
          <circle cx="400" cy="400" r="280" opacity="0.5" />
          {/* Liniile intersectate */}
          <path d="M400,20 L400,780 M20,400 L780,400 M131,131 L669,669 M131,669 L669,131" />
          <circle cx="400" cy="400" r="120" />
          {/* Steaua interioară a modelului */}
          <path
            d="M400,250 L430,370 L550,400 L430,430 L400,550 L370,430 L250,400 L370,370 Z"
            fill="var(--color-accent)"
            opacity="0.05"
          />
        </g>
      </svg>

      {/* 3. Praful de aur plutitor (Particule) */}
      <div className="ls-particles">
        <div className="ls-particle p1"></div>
        <div className="ls-particle p2"></div>
        <div className="ls-particle p3"></div>
        <div className="ls-particle p4"></div>
        <div className="ls-particle p5"></div>
        <div className="ls-particle p6"></div>
      </div>

      {/* --- CONȚINUTUL CENTRAL --- */}
      <div className="loading-brand">
        <div className="loading-stars">
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
        </div>
        <span className="loading-name">CASA ESY</span>
        <span className="loading-sub">HOTEL · MAMAIA</span>
      </div>
    </div>
  );
}
