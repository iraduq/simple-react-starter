import { type RefObject } from "react";
import { ArrowRight } from "lucide-react";

interface VerifyEmailFormProps {
  code: string[];
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
  isResending: boolean;
  resendCooldown: number;
  onCodeChange: (index: number, val: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
}

export default function VerifyEmailForm({
  code,
  inputRefs,
  isLoading,
  isResending,
  resendCooldown,
  onCodeChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
}: VerifyEmailFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex justify-between gap-2" onPaste={onPaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (inputRefs.current) inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onCodeChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              disabled={isLoading}
              className="w-12 h-14 text-center text-xl font-bold border border-[#e1e8f0] rounded-[10px] bg-[#f4f7fb] text-[#1a1a1a] outline-none transition-all duration-200 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)] disabled:opacity-60"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || code.some((d) => d === "")}
          className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? "Se verifică..." : "Verifică codul"}
          {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
        </button>
      </form>

      <div className="text-center mt-7">
        <p className="text-[13.5px] text-[#3c4043] m-0">
          Nu ai primit codul?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending || resendCooldown > 0}
            className="bg-transparent border-none p-0 font-inherit text-[#1e4d8c] font-semibold cursor-pointer hover:text-[#c69a3f] transition-colors duration-200 disabled:text-[#8595aa] disabled:cursor-not-allowed"
          >
            {isResending
              ? "Se trimite..."
              : resendCooldown > 0
                ? `Retrimite în ${resendCooldown}s`
                : "Retrimite codul"}
          </button>
        </p>
      </div>
    </>
  );
}
