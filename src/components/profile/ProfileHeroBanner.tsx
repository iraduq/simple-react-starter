export default function ProfileHeroBanner() {
  return (
    <div className="relative w-full h-[270px] sm:h-[330px] lg:h-[380px] xl:h-[420px] overflow-hidden border-b border-[#e1e8f0] pt-16 sm:pt-20">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover saturate-60 contrast-110 brightness-95"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0d2c5c]/60 mix-blend-color" />
      <div className="absolute inset-0 bg-[#0b2146]/35 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/85 via-[#0d2c5c]/25 to-[#0d2c5c]/95" />
      <span aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#c69a3f]/25 blur-[85px]" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-[#c69a3f]/20 blur-[90px]" />

      <div className="relative z-10 w-full h-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col justify-between pt-4 sm:pt-6 pb-24 sm:pb-28">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d2c5c]/70 backdrop-blur-md border border-white/20 text-white text-[12px] font-medium shadow-lg">
            <span className="text-[#c69a3f] text-[11px] tracking-widest font-serif font-semibold">★★★</span>
            <span className="font-sans font-semibold tracking-wide">Casa Esy • Mamaia Resort & Spa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
