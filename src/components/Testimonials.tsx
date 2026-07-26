import { useState, useEffect } from "react";
import { Star, MapPin, ArrowRight } from "lucide-react";

// Definim interfețele pentru TypeScript
interface Review {
  rating: number;
  text: string;
  profile_photo_url?: string;
  author_name: string;
  relative_time_description: string;
}

interface TestimonialData {
  rating: number;
  reviewCount: number;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

export default function Testimonials() {
  const [data, setData] = useState<TestimonialData>({
    rating: 0,
    reviewCount: 0,
    reviews: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchGoogleData = async () => {
      try {
        const response = await fetch("/api/google-reviews");

        if (!response.ok) throw new Error("Nu am putut prelua recenziile");

        const result = await response.json();

        setData({
          rating: result.rating,
          reviewCount: result.user_ratings_total,
          reviews: result.reviews.slice(0, 3),
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        // Am corectat tipul 'unknown' pentru eroare
        console.error("Eroare la preluarea datelor Google:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Eroare necunoscută";
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    fetchGoogleData();
  }, []);

  return (
    <section className="py-24 md:py-32 px-5 md:px-10 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
          <div className="max-w-2xl">
            <p className="font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c69a3f]/60" />
              Ce spun oaspeții noștri
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl lg:text-6xl font-normal text-zinc-900 leading-tight">
              Experiențe <em className="italic text-[#c69a3f]">Reale</em>
            </h2>
          </div>

          {/* Google Summary Badge Dinamic */}
          <div
            className={`flex flex-col items-start md:items-end transition-opacity duration-500 ${
              data.isLoading ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-2xl font-semibold text-zinc-900">
                {data.rating > 0
                  ? data.rating.toFixed(1).replace(".", ",")
                  : "4,8"}
              </span>
              <div className="flex gap-0.5 ml-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < Math.round(data.rating || 5) ? "#FBBC05" : "#E4E4E7"
                    }
                    color={
                      i < Math.round(data.rating || 5) ? "#FBBC05" : "#E4E4E7"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-500 font-light">
              Bazat pe <strong>{data.reviewCount || 88} recenzii</strong> pe
              Google Maps
            </p>
          </div>
        </div>

        {/* Layout Editorial pentru Recenzii (Generat dinamic) */}
        {!data.isLoading && data.reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-16">
            {data.reviews.map((r, index) => (
              <article
                key={index}
                className={`flex flex-col relative ${
                  index !== data.reviews.length - 1
                    ? 'md:after:content-[""] md:after:absolute md:after:-right-6 lg:after:-right-8 md:after:top-0 md:after:h-full md:after:w-px md:after:bg-zinc-100'
                    : ""
                }`}
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#FBBC05" color="#FBBC05" />
                  ))}
                </div>

                <p className="text-base md:text-lg text-zinc-700 leading-relaxed font-light italic flex-grow mb-8 line-clamp-6">
                  &ldquo;{r.text}&rdquo;
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <img
                    src={
                      r.profile_photo_url ||
                      "https://ui-avatars.com/api/?name=" + r.author_name
                    }
                    alt={r.author_name}
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <strong className="block text-sm font-semibold text-zinc-900">
                      {r.author_name}
                    </strong>
                    <span className="block text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      {r.relative_time_description}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-20 md:mt-24 pt-10 border-t border-zinc-100 flex justify-center">
          <a
            href="https://www.google.com/maps/search/casa+esy+eforie+nord"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-4 px-8 py-4 bg-zinc-900 text-white rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#c69a3f] hover:shadow-lg hover:shadow-[#c69a3f]/20"
          >
            <MapPin size={18} />
            <span>Vezi toate recenziile pe Google</span>
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
