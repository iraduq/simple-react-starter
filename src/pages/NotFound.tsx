import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BedDouble } from "lucide-react";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-[82vh] bg-white flex items-center justify-center px-6 pt-28 pb-16">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
        {/* Stânga: Mascota 3D Casa Esy pe fundal alb pur */}
        <div className="flex items-center justify-center">
          <img
            src="/images/not-found-mascot.jpg"
            alt="Mascota Vila Casa Esy 404"
            className="w-full max-w-[380px] sm:max-w-[430px] h-auto select-none object-contain mix-blend-multiply"
          />
        </div>

        {/* Dreapta: Tipografie curată stil Pixar, fără card, fără border, fără italic */}
        <div className="text-center flex flex-col items-center">
          <h1
            className="text-[36px] sm:text-[46px] font-semibold tracking-tight text-[#0d2c5c] leading-tight font-['Outfit',sans-serif]"
          >
            Pierdut printre valuri...
          </h1>

          <p className="mt-3 text-[16px] sm:text-[18px] font-medium text-[#4f6280]">
            Ups, nu te întrista — este doar o eroare{" "}
            <span className="font-bold text-[#dc2626]">404</span>!
          </p>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#5e718f]">
            Camera sau pagina pe care o cauți s-a rătăcit probabil pe plajă în Eforie Nord.
          </p>

          {pathname && pathname !== "/" && (
            <p className="mt-3 text-[12.5px] font-mono text-[#b91c1c]/80">
              {pathname}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#163c78] no-underline"
            >
              <ArrowLeft size={15} />
              Înapoi Acasă
            </Link>

            <Link
              to="/camere"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8e1ee] bg-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] transition hover:border-[#0d2c5c] hover:bg-[#f8fafd] no-underline"
            >
              <BedDouble size={15} className="text-[#c69a3f]" />
              Vezi Camerele
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
