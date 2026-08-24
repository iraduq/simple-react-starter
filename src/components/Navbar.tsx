import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  CircleUser,
  X,
  Sparkles,
  LogOut,
  Menu,
} from "lucide-react";

import {
  clearSession,
  fetchSession,
  getCachedUser,
  hasSession,
  onSessionChange,
  type SessionUser,
} from "../lib/auth";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";

const LANGS = [
  { code: "RO", label: "Română", flagUrl: "https://flagcdn.com/w20/ro.png" },
  { code: "EN", label: "English", flagUrl: "https://flagcdn.com/w20/gb.png" },
  { code: "DE", label: "Deutsch", flagUrl: "https://flagcdn.com/w20/de.png" },
];

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Acasă", end: true },
  { to: "/camere", label: "Camere" },
  { to: "/places", label: "Locații" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("RO");
  const [langOpen, setLangOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession);
  const [currentUser, setCurrentUser] = useState<SessionUser>(getCachedUser());

  const langRef = useRef<HTMLDivElement>(null);
  const acctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLangOpen(false);
      if (acctRef.current && !acctRef.current.contains(e.target as Node))
        setAcctOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!hasSession()) {
      fetchSession().then(() => {
        setIsAuthenticated(hasSession());
        setCurrentUser(getCachedUser());
      });
    } else {
      setCurrentUser(getCachedUser());
    }
    return onSessionChange(() => {
      setIsAuthenticated(hasSession());
      setCurrentUser(getCachedUser());
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText("CASAESY15");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore — proceed with local logout
    }
    clearSession();
    setAcctOpen(false);
    toast("Te-ai delogheat cu succes.", "success");
    navigate("/");
  };

  const activeLang = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <>
      {/* ── ANNOUNCEMENT STRIP ── */}
      {!promoDismissed && (
        <div className="relative flex items-center justify-center px-12 py-2 bg-white border-b border-[#c69a3f]/25">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c69a3f]/70 to-transparent"
          />
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <Sparkles size={13} className="text-[#c69a3f] shrink-0" />
            <span className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f]">
              Vila Casa Esy
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-[#c69a3f]/40" />
            <span className="font-sans text-[12.5px] text-[#0d2c5c]">
              Rezervări directe la{" "}
              <strong className="font-bold text-[#0d2c5c]">
                cel mai bun preț garantat
              </strong>{" "}
              — check-in prietenos, la doi pași de mare.
            </span>
          </div>

          <button
            onClick={() => setPromoDismissed(true)}
            aria-label="Închide"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d2c5c]/40 hover:text-[#0d2c5c] p-1 transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      )}


      {/* ── HEADER ── */}
      <header
        className={`sticky top-0 z-50 relative border-b transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-[#c69a3f] before:to-transparent ${
          scrolled
            ? "bg-white/[0.94] backdrop-blur-[18px] border-[#c69a3f]/20 shadow-[0_1px_0_rgba(198,154,63,0.18),0_8px_32px_rgba(13,44,92,0.1),0_2px_8px_rgba(13,44,92,0.06)]"
            : "bg-white border-[#e1e8f0]"
        }`}
      >
        <div className="max-w-[1320px] mx-auto h-[68px] sm:h-20 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
          {/* LOGO */}
          <Link
            to="/"
            className="flex flex-col items-center gap-0.5 group"
            aria-label="Vila Casa Esy"
          >
            <span
              className="text-xs tracking-[0.3em] leading-none text-[#c69a3f]"
              aria-label="3 stele"
            >
              ★ ★ ★
            </span>
            <span className="font-['Cormorant_Garamond',serif] text-[22px] font-semibold leading-none tracking-wide text-[#1a1a1a] group-hover:opacity-80 transition-opacity">
              CASA ESY
            </span>
            <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-gray-500 mt-px">
              HOTEL · MAMAIA
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative font-sans text-[15px] py-1 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[#c69a3f] after:transition-all after:duration-300 ${
                    isActive
                      ? "text-[#c69a3f] font-semibold after:w-full"
                      : "text-[#3c4043] hover:text-[#1a1a1a] after:w-0"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* TOOLS + CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 -mt-0.5">
            {/* LANG SELECTOR */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setLangOpen((v) => !v);
                  setAcctOpen(false);
                }}
                aria-haspopup="true"
                aria-expanded={langOpen}
                aria-label="Schimbă limba"
                className={`inline-flex items-center gap-2 px-3 py-2 rounded border transition-all duration-200 hover:bg-black/[0.04] ${
                  langOpen ? "border-[#1a1a1a]" : "border-transparent"
                }`}
              >
                <img
                  src={activeLang.flagUrl}
                  alt="flag"
                  className="w-6 h-4 object-cover rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] translate-y-px"
                />
                <span className="text-[15px] font-medium">{lang}</span>
                <ChevronDown
                  size={14}
                  className={`text-[#1a1a1a] mt-0.5 transition-transform duration-200 ${
                    langOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {langOpen && (
                <ul
                  role="menu"
                  className="absolute top-[calc(100%+10px)] right-0 bg-white border border-[#e1e8f0] rounded-[10px] shadow-[0_4px_6px_rgba(13,44,92,0.04),0_12px_40px_rgba(13,44,92,0.12)] p-1.5 min-w-[160px] z-[200] before:content-[''] before:absolute before:-top-[5px] before:right-[14px] before:w-2.5 before:h-2.5 before:bg-white before:border-t before:border-l before:border-[#e1e8f0] before:rotate-45"
                >
                  {LANGS.map((l) => (
                    <li
                      key={l.code}
                      role="menuitem"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md cursor-pointer transition-colors duration-150 ${
                        l.code === lang ? "bg-[#e6efff]" : "hover:bg-[#e6efff]"
                      }`}
                    >
                      <img
                        src={l.flagUrl}
                        alt={`${l.code} flag`}
                        className="w-[22px] h-4 object-cover rounded-[2px]"
                      />
                      <span className="text-[11px] font-bold tracking-wide text-[#0d2c5c] min-w-[28px]">
                        {l.code}
                      </span>
                      <span
                        className={`text-[13px] ${
                          l.code === lang ? "text-[#0d2c5c]" : "text-[#3c4043]"
                        }`}
                      >
                        {l.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ACCOUNT SELECTOR */}
            <div className="relative" ref={acctRef}>
              <button
                onClick={() => {
                  setAcctOpen((v) => !v);
                  setLangOpen(false);
                }}
                aria-haspopup="true"
                aria-expanded={acctOpen}
                aria-label="Cont utilizator"
                className="p-1.5 text-[#1a1a1a] hover:opacity-80 transition-opacity"
              >
                <CircleUser size={22} strokeWidth={1.5} />
              </button>

              {acctOpen && (
                <div
                  role="menu"
                  className="absolute top-[calc(100%+10px)] right-0 bg-white border border-[#e1e8f0] rounded-[10px] shadow-[0_4px_6px_rgba(13,44,92,0.04),0_12px_40px_rgba(13,44,92,0.12)] p-5 min-w-[256px] flex flex-col gap-2.5 z-[200] before:content-[''] before:absolute before:-top-[5px] before:right-[14px] before:w-2.5 before:h-2.5 before:bg-white before:border-t before:border-l before:border-[#e1e8f0] before:rotate-45"
                >
                  {isAuthenticated ? (
                    <>
                      <p className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#0d2c5c] m-0">
                        {currentUser?.role === "admin"
                          ? `Salut, ${currentUser?.first_name || "Admin"}`
                          : "Ești conectat"}
                      </p>
                      {currentUser?.role === "admin" ? (
                        <Link
                          to="/admin"
                          onClick={() => setAcctOpen(false)}
                          className="flex items-center justify-center px-4 py-[11px] rounded text-xs font-bold tracking-wide uppercase bg-[#0d2c5c] text-white hover:bg-[#1e4d8c] transition-colors duration-200"
                        >
                          Administrează
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          onClick={() => setAcctOpen(false)}
                          className="flex items-center justify-center px-4 py-[11px] rounded text-xs font-bold tracking-wide uppercase bg-[#0d2c5c] text-white hover:bg-[#1e4d8c] transition-colors duration-200"
                        >
                          Vezi profilul
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-4 py-[11px] rounded text-xs font-bold tracking-wide uppercase text-[#3c4043] border border-[#e1e8f0] hover:border-red-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <LogOut size={14} /> Deloghează-te
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-['Cormorant_Garamond',serif] text-lg font-medium text-[#0d2c5c] m-0">
                        Bun venit la Casa Esy
                      </p>
                      <p className="text-[12.5px] text-[#3c4043] leading-relaxed m-0">
                        Intră în cont pentru a-ți gestiona rezervările.
                      </p>
                      <Link
                        to="/login"
                        onClick={() => setAcctOpen(false)}
                        className="flex items-center justify-center px-4 py-[11px] rounded text-xs font-bold tracking-wide uppercase bg-[#0d2c5c] text-white hover:bg-[#1e4d8c] transition-colors duration-200"
                      >
                        Intră în cont
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setAcctOpen(false)}
                        className="flex items-center justify-center px-4 py-[11px] rounded text-xs font-bold tracking-wide uppercase text-[#3c4043] border border-[#e1e8f0] hover:border-[#1e4d8c] hover:text-[#0d2c5c] transition-colors duration-200"
                      >
                        Creează cont nou
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* CTA BUTTON */}
            <Link
              to="/disponibilitate"
              className="group relative hidden sm:inline-flex items-center overflow-hidden ml-1 lg:ml-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-[#c69a3f] hover:bg-[#b58933] text-white text-[13px] lg:text-[14.5px] font-medium rounded transition-all duration-200 hover:-translate-y-px"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[550ms] ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]" />
              <span className="relative whitespace-nowrap">Rezervă Acum</span>
            </Link>

            {/* HAMBURGER */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded text-[#0d2c5c] transition-colors hover:bg-black/[0.04]"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE PANEL */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#e1e8f0] bg-white px-4 pb-5 pt-2 shadow-[0_18px_40px_-24px_rgba(13,44,92,0.35)]">
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-[#eef2f7] py-3.5 text-[15px] last:border-0 ${
                      isActive
                        ? "font-semibold text-[#c69a3f]"
                        : "text-[#3c4043]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Link
              to="/disponibilitate"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center rounded bg-[#c69a3f] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white"
            >
              Rezervă Acum
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
