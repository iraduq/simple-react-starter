import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import type { MenuCategory } from "../types/places";
import { lei } from "../services/placesService";

export default function PlaceMenu({ categories }: { categories: MenuCategory[] }) {
  const withItems = categories.filter((c) => (c.items?.length ?? 0) > 0);
  const [active, setActive] = useState<number | null>(null);
  const current = withItems.find((c) => c.id === active) ?? withItems[0];

  if (withItems.length === 0) {
    return (
      <div className="py-14 text-center">
        <UtensilsCrossed className="mx-auto mb-3 text-[#c69a3f]" size={26} strokeWidth={1.4} />
        <p className="text-[15px] font-semibold text-[#0d2c5c]">Meniul nu este disponibil încă</p>
        <p className="mt-1 text-[13px] text-[#4f6280]">Revino curând pentru oferta acestei locații.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {withItems.map((c) => {
          const on = c.id === current?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                on ? "bg-[#0d2c5c] text-white" : "bg-[#eef2f7] text-[#0d2c5c] hover:bg-[#e1e8f0]"
              }`}
            >
              {c.name}
              <span className={`ml-2 ${on ? "text-white/60" : "text-[#6b7c99]"}`}>{c.items?.length}</span>
            </button>
          );
        })}
      </div>

      {current?.description && (
        <p className="mt-4 text-[14px] leading-relaxed text-[#4f6280]">{current.description}</p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {current?.items?.map((it) => (
          <li
            key={it.id}
            className={`flex gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-3 ${
              it.is_available ? "" : "opacity-60"
            }`}
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#eef2f7]">
              {it.image_url ? (
                <img src={it.image_url} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <UtensilsCrossed className="absolute inset-0 m-auto text-[#9aa8bd]" size={22} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[15px] font-semibold leading-snug text-[#0d2c5c]">{it.title}</h4>
                <span className="shrink-0 text-[15px] font-bold text-[#0d2c5c]">{lei(it.price)}</span>
              </div>
              {it.description && (
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#4f6280]">{it.description}</p>
              )}
              {it.ingredients && (
                <p className="mt-1 text-[11.5px] text-[#6b7c99]">
                  <span className="font-semibold">Ingrediente:</span> {it.ingredients}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {it.volume_or_weight && (
                  <span className="rounded-full bg-[#eef2f7] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0d2c5c]">
                    {it.volume_or_weight}
                  </span>
                )}
                {it.is_available ? (
                  <span className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#1f6b45]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1f6b45]" /> În stoc
                  </span>
                ) : (
                  <span className="rounded-full bg-[#8c2f39] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    Epuizat
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
