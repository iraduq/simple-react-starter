import { useEffect, useState } from "react";
import { ArrowLeft, BedDouble, Ruler, Users, Check, Loader as Loader2 } from "lucide-react";
import { Link } from "@/lib/router-compat";
import BookingForm from "../components/booking/BookingForm";
import { getRoom } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { imageUrl } from "../lib/admin";
import { ron } from "../lib/format";
import type { Room } from "../types/rooms";

/** GET /rooms/{room_id} + formular de rezervare cu dynamic pricing. */
export default function RoomDetail({ roomId }: { roomId: string | number }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let on = true;
    setLoading(true);
    setError(null);
    getRoom(roomId)
      .then((r) => on && setRoom(r))
      .catch((e) => on && setError(httpErrorMessage(e, "Camera nu a putut fi încărcată.")))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, [roomId]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-[#8595aa]">
        <Loader2 size={16} className="animate-spin" /> Se încarcă camera…
      </div>
    );

  if (error || !room)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-[15px] text-red-600">{error ?? "Camera nu a fost găsită."}</p>
        <Link to="/camere" className="mt-4 inline-block text-[13px] font-semibold text-[#0d2c5c] underline">
          Înapoi la camere
        </Link>
      </div>
    );

  const images = room.images ?? [];
  const facilities = room.facilities ?? [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 lg:py-14">
      <Link
        to="/camere"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7c99] hover:text-[#0d2c5c]"
      >
        <ArrowLeft size={14} /> Toate camerele
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-[#eef2f7]">
            {images.length > 0 ? (
              <img
                src={imageUrl(images[Math.min(active, images.length - 1)])}
                alt={`${room.name} — imagine ${active + 1}`}
                className="h-[300px] w-full object-cover sm:h-[420px]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-[13px] text-[#8595aa]">
                Fără imagini
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={String(img.id)}
                  onClick={() => setActive(i)}
                  aria-label={`Imaginea ${i + 1}`}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === active ? "border-[#c69a3f]" : "border-transparent"
                  }`}
                >
                  <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          <h1
            className="mt-7 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-[#0d2c5c]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {room.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#3d4f6b]">
            {room.capacity != null && (
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} className="text-[#c69a3f]" /> {room.capacity} persoane
              </span>
            )}
            {room.bed && (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble size={15} className="text-[#c69a3f]" /> {room.bed}
              </span>
            )}
            {room.size_sqm != null && (
              <span className="inline-flex items-center gap-1.5">
                <Ruler size={15} className="text-[#c69a3f]" /> {room.size_sqm} m²
              </span>
            )}
            {room.base_price != null && (
              <span className="font-semibold text-[#0d2c5c]">de la {ron(room.base_price)} / noapte</span>
            )}
          </div>

          {room.description && (
            <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-[#3d4f6b]">{room.description}</p>
          )}

          {facilities.length > 0 && (
            <section className="mt-8">
              <h2
                className="text-[19px] text-[#0d2c5c]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Facilități
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {facilities.map((f) => (
                  <li key={String(f.id)} className="flex items-center gap-2 text-[13.5px] text-[#3d4f6b]">
                    <Check size={15} className="text-[#c69a3f]" /> {f.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingForm room={room} />
        </aside>
      </div>
    </div>
  );
}
