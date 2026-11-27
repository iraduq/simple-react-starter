import { CircleCheck as CheckCircle2 } from "lucide-react";

interface PasswordRequirementsProps {
  passwordRules: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export default function PasswordRequirements({ passwordRules }: PasswordRequirementsProps) {
  return (
    <div className="pt-3 pb-0.5 mt-0.5 animate-[fadeIn_0.2s_ease-in-out]">
      <div className="flex gap-1 mb-3">
        {Object.values(passwordRules).map((isMet, index) => (
          <span
            key={index}
            className={`flex-1 h-[3px] rounded-sm transition-colors duration-300 ${isMet ? "bg-emerald-500" : "bg-[#e1e8f0]"}`}
          />
        ))}
      </div>

      <ul className="list-none p-0 m-0 flex flex-wrap gap-x-4 gap-y-2">
        <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.length ? "text-[#3c4043]" : "text-[#8595aa]"}`}>
          <CheckCircle2 size={13} strokeWidth={2.25} className={passwordRules.length ? "text-emerald-500" : "text-[#e1e8f0]"} />
          8-64 caractere
        </li>
        <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.lowercase ? "text-[#3c4043]" : "text-[#8595aa]"}`}>
          <CheckCircle2 size={13} strokeWidth={2.25} className={passwordRules.lowercase ? "text-emerald-500" : "text-[#e1e8f0]"} />
          O literă mică
        </li>
        <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.uppercase ? "text-[#3c4043]" : "text-[#8595aa]"}`}>
          <CheckCircle2 size={13} strokeWidth={2.25} className={passwordRules.uppercase ? "text-emerald-500" : "text-[#e1e8f0]"} />
          O literă mare
        </li>
        <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.number ? "text-[#3c4043]" : "text-[#8595aa]"}`}>
          <CheckCircle2 size={13} strokeWidth={2.25} className={passwordRules.number ? "text-emerald-500" : "text-[#e1e8f0]"} />
          Un număr
        </li>
        <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-[250ms] ${passwordRules.symbol ? "text-[#3c4043]" : "text-[#8595aa]"}`}>
          <CheckCircle2 size={13} strokeWidth={2.25} className={passwordRules.symbol ? "text-emerald-500" : "text-[#e1e8f0]"} />
          Un simbol
        </li>
      </ul>
    </div>
  );
}
