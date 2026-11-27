import { UtensilsCrossed, Crown } from "lucide-react";
import type { OrderData } from "../../../types/orderProgress";
import { lei } from "../../../types/orderProgress";

export default function OrderItemsCard({ order }: { order: OrderData }) {
  return (
    <div className="lg:col-span-7 rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#e1e8f0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e1e8f0] flex items-center justify-center text-[#0d2c5c]">
            <UtensilsCrossed size={18} className="text-[#c69a3f]" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
              Coș Room Service
            </p>
            <h2 className="font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c]">
              Produse Comandate
            </h2>
          </div>
        </div>

        <span className="inline-flex items-center rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3.5 py-1 text-xs font-bold text-[#0d2c5c]">
          {order.items.reduce((acc: number, it: any) => acc + it.qty, 0)} produse
        </span>
      </div>

      <div className="divide-y divide-[#e1e8f0] mt-2">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <span className="flex h-9 min-w-9 px-2.5 items-center justify-center rounded-xl bg-[#f8fafc] border border-[#e1e8f0] text-[#0d2c5c] text-xs font-bold shrink-0">
                {item.qty}×
              </span>
              <div className="min-w-0">
                <div className="font-bold text-[15px] text-[#0d2c5c] truncate">
                  {item.title}
                </div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Preț unitar: {lei(item.price)}
                </div>
              </div>
            </div>
            <span className="font-['Outfit',sans-serif] font-bold text-[16px] text-[#0d2c5c] shrink-0">
              {lei(item.price * item.qty)}
            </span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mt-5 rounded-2xl bg-[#f8fafc] border border-[#e1e8f0] px-4 py-3.5 text-xs text-[#334155]">
          <strong className="uppercase tracking-[0.12em] text-[#0d2c5c] mr-1.5">
            Mențiuni bucătărie:
          </strong>
          „{order.notes}”
        </div>
      )}

      {order.discount_amount && order.discount_amount > 0 ? (
        <div className="mt-5 rounded-2xl border border-[#c69a3f]/35 bg-[#fdf8ec] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#c69a3f]">
                <Crown size={17} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">
                  Privilegiu VIP {order.vip_tier || ""}
                  {order.discount_percent ? ` · -${order.discount_percent}%` : ""}
                </div>
                <p className="text-xs text-[#576985] mt-0.5">
                  {order.discount_reason ||
                    `Reducere aplicată automat pentru statutul VIP ${order.vip_tier || ""}.`}
                </p>
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="inline-block rounded-full bg-white border border-[#c69a3f]/40 px-3 py-1 text-xs font-bold text-[#9c7624]">
                −{lei(order.discount_amount)} economisiți
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
