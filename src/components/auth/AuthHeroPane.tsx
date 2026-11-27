import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface AuthHeroPaneProps {
  title: string;
  subtitle: string;
  bgImage?: string;
}

export default function AuthHeroPane({
  title,
  subtitle,
  bgImage = "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
}: AuthHeroPaneProps) {
  return (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center min-[900px]:relative min-[900px]:z-0 min-[900px]:flex-[1.2] overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(13,44,92,0.4) 0%, rgba(13,44,92,0.85) 100%)",
        }}
      />

      <svg
        className="absolute bottom-0 -right-px w-[15%] h-full z-[2] max-[899px]:hidden"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon fill="#ffffff" points="0,100 100,0 100,100" />
      </svg>
      <div className="relative z-[3] h-full flex-col justify-between p-[50px_80px_80px_50px] text-white hidden min-[900px]:flex">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/80 hover:text-white transition-all duration-200 hover:-translate-x-1 self-start"
        >
          <ArrowLeft size={16} /> Înapoi acasă
        </Link>
        <div>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,4vw,3.5rem)] font-normal leading-[1.1] mb-5 max-w-[500px]">
            {title}
          </h2>
          <p className="text-[1.1rem] leading-[1.6] text-white/85 max-w-[450px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
