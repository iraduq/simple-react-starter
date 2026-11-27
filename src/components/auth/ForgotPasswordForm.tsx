import { Mail, ArrowRight } from "lucide-react";

interface ForgotPasswordFormProps {
  resetEmail: string;
  setResetEmail: (email: string) => void;
  resetMessage: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({
  resetEmail,
  setResetEmail,
  resetMessage,
  isLoading,
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  return (
    <>
      <div className="text-center mb-10">
        <h1 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#1a1a1a] mb-2.5 font-medium">
          Recuperare Parolă
        </h1>
        <p className="text-[#8595aa] text-[14.5px] m-0">
          Introdu adresa de email și îți vom trimite un link de resetare.
        </p>
      </div>

      {resetMessage && (
        <div className="flex items-center gap-2.5 bg-blue-50 text-blue-900 border border-blue-200 px-4 py-3 rounded-[10px] text-[13.5px] font-medium mb-5">
          <span>{resetMessage}</span>
        </div>
      )}

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
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full pl-[50px] pr-[44px] py-4 border border-[#e1e8f0] rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? "Se trimite..." : "Trimite link-ul"}
          {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
        </button>
      </form>

      <div className="flex items-center text-center my-8 text-[#8595aa] text-[11px] font-bold tracking-[0.15em] before:content-[''] before:flex-1 before:border-b before:border-[#e1e8f0] after:content-[''] after:flex-1 after:border-b after:border-[#e1e8f0]" />

      <p className="text-center mt-9 text-sm text-[#3c4043]">
        Ți-ai amintit parola?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className="bg-transparent border-none text-[#0d2c5c] font-bold cursor-pointer text-inherit p-0 underline"
        >
          Întoarce-te la Login
        </button>
      </p>
    </>
  );
}
