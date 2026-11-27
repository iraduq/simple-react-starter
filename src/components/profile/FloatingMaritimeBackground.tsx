export default function FloatingMaritimeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(198,154,63,0.07),transparent_70%)]" />
      <div className="absolute -top-12 -right-16 w-[520px] h-[520px] opacity-[0.02] text-[#0d2c5c]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="2" />
          <path
            d="M100 12 L114 86 L188 100 L114 114 L100 188 L86 114 L12 100 L86 86 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>
      <div className="absolute top-[28%] -left-20 w-[450px] h-[450px] rounded-full bg-[#c69a3f]/[0.025] blur-[140px]" />
      <div className="absolute top-[60%] -right-20 w-[500px] h-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[150px]" />
    </div>
  );
}
