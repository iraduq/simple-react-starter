import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  formData: { email: string; password: string };
  setFormData: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onForgotPasswordClick: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function LoginForm({
  formData,
  setFormData,
  isLoading,
  showPassword,
  setShowPassword,
  onForgotPasswordClick,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <Mail
          className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#8595aa]"
          size={18}
          strokeWidth={1.5}
        />
        <input
          type="email"
          placeholder="Adresa de email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
        />
      </div>

      <div className="relative">
        <Lock
          className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[#8595aa]"
          size={18}
          strokeWidth={1.5}
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Parola"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
          className="absolute right-[14px] top-1/2 -translate-y-1/2 p-1 text-[#8595aa] hover:text-[#0d2c5c] transition-colors"
        >
          {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <div className="flex items-center justify-between text-[13.5px] -mt-1.5 mb-2">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="bg-transparent border-none p-0 font-inherit text-[#1e4d8c] font-semibold cursor-pointer hover:text-[#c69a3f] transition-colors duration-200"
        >
          Ai uitat parola?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? "Se încarcă..." : "Intră în cont"}
        {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
      </button>
    </form>
  );
}
