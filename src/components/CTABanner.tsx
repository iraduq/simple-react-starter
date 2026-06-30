export default function CTABanner() {
  return (
    <section
      className="relative py-[70px] px-6 md:py-[100px] md:px-10 text-center bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,28,64,0.82), rgba(10,28,64,0.88)), url(https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1920&h=700&fit=crop)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(30,77,140,0.4) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-[2] max-w-[680px] mx-auto">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
          Ofertă specială
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal text-white mb-5 leading-[1.15]">
          Rezervă acum și economisește <em className="italic text-[#c69a3f]">15%</em>
        </h2>
        <p className="text-[15.5px] leading-[1.7] text-white/82 mb-10">
          Folosește codul <strong className="text-[#c69a3f] font-bold">CASAESY15</strong> la
          rezervarea directă și bucură-te de reducere. Ofertă valabilă pentru
          sejururi în sezon.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center flex-wrap">
          <a
            href="/login"
            className="inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-[0_4px_15px_rgba(13,44,92,0.18)] transition-all duration-300 hover:bg-[#c69a3f] hover:text-[#0d2c5c] hover:border-[#c69a3f] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(198,154,63,0.3)]"
          >
            Rezervă acum →
          </a>
          <a
            href="/contact"
            className="inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-white/50 text-white bg-transparent transition-all duration-300 hover:border-white hover:bg-white/[0.08] hover:-translate-y-0.5"
          >
            Contactează-ne
          </a>
        </div>
      </div>
    </section>
  );
}
