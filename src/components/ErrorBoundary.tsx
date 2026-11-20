import React from "react";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "A apărut o eroare neașteptată în aplicație.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Casa Esy ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf8f3] via-white to-[#f6f8fc] px-6 py-16">
        <div className="w-full max-w-lg rounded-[26px] border border-[#e5dcc3] bg-white p-8 sm:p-10 text-center shadow-[0_24px_64px_rgba(13,44,92,0.08)]">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d2c5c] text-[#f5d588] shadow-md">
            <ShieldAlert size={26} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7222]">
            Vila Casa Esy
          </p>
          <h1
            className="mt-2 text-[28px] font-semibold text-[#0d2c5c]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ceva nu a funcționat corect
          </h1>
          <p className="mt-2.5 text-[14px] text-[#5e718f] leading-relaxed">
            Am întâmpinat o mică eroare de afișare. Reîncarcă pagina și totul va reveni la normal.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#f5d588] shadow-md hover:bg-[#163c78] transition cursor-pointer"
            >
              <RefreshCw size={14} /> Reîncarcă pagina
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8e1ee] bg-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] hover:border-[#c69a3f] transition no-underline"
            >
              <Home size={14} className="text-[#c69a3f]" /> Acasă
            </a>
          </div>
        </div>
      </div>
    );
  }
}
