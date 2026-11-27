import { type RefObject } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ArrowRight } from "lucide-react";
import PhoneInput from "react-phone-number-input/max";
import "react-phone-number-input/style.css";
import CustomCountrySelect from "../CustomCountrySelect";
import PasswordRequirements from "./PasswordRequirements";

interface RegisterFormFieldsProps {
  formData: { first_name: string; last_name: string; email: string; phone: string; password: string };
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  fieldValidity: Record<string, boolean>;
  passwordRules: { length: boolean; lowercase: boolean; uppercase: boolean; number: boolean; symbol: boolean };
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  passwordFocused: boolean;
  setPasswordFocused: (f: boolean) => void;
  phoneWrapRef: RefObject<HTMLDivElement | null>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handlePhoneChange: (val: string | undefined) => void;
  handlePhoneBlur: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export default function RegisterFormFields({
  formData,
  errors,
  touched,
  fieldValidity,
  passwordRules,
  showPassword,
  setShowPassword,
  passwordFocused,
  setPasswordFocused,
  phoneWrapRef,
  handleChange,
  handleBlur,
  handlePhoneChange,
  handlePhoneBlur,
  handleSubmit,
  isLoading,
}: RegisterFormFieldsProps) {
  const inputBase =
    "w-full pl-[50px] pr-[44px] py-4 border rounded-[10px] font-sans text-[14.5px] text-[#1a1a1a] bg-[#f4f7fb] outline-none transition-all duration-300 focus:border-[#1e4d8c] focus:bg-white focus:shadow-[0_4px_15px_rgba(30,77,140,0.08)]";

  const getInputClass = (name: string) => {
    if (touched[name] && errors[name]) return `${inputBase} border-red-500 bg-red-50`;
    if (touched[name] && fieldValidity[name]) return `${inputBase} border-emerald-500 bg-emerald-50/30`;
    return `${inputBase} border-[#e1e8f0]`;
  };

  const getIconClass = (name: string) => {
    if (touched[name] && errors[name]) return "text-red-500";
    if (touched[name] && fieldValidity[name]) return "text-emerald-500";
    return "text-[#8595aa]";
  };

  const getPhoneGroupClass = () => {
    if (touched.phone && errors.phone) return "border-red-500 [&_.PhoneInputCountry]:border-r-red-300";
    if (touched.phone && fieldValidity.phone) return "border-emerald-500 [&_.PhoneInputCountry]:border-r-emerald-300";
    return "border-[#e1e8f0] [&_.PhoneInputCountry]:border-r-[#e1e8f0]";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <User className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("first_name")}`} size={18} strokeWidth={1.5} />
            <input type="text" name="first_name" placeholder="Prenume" value={formData.first_name} onChange={handleChange} onBlur={handleBlur} className={getInputClass("first_name")} />
            {touched.first_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none animate-[fadeIn_0.2s_ease-in-out]">
                {fieldValidity.first_name ? <CheckCircle2 size={17} strokeWidth={2} className="text-emerald-500" /> : <AlertCircle size={17} strokeWidth={2} className="text-red-500" />}
              </span>
            )}
          </div>
          {errors.first_name && touched.first_name && <span className="text-[11.5px] text-red-500 font-medium pl-1">{errors.first_name}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative">
            <User className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("last_name")}`} size={18} strokeWidth={1.5} />
            <input type="text" name="last_name" placeholder="Nume" value={formData.last_name} onChange={handleChange} onBlur={handleBlur} className={getInputClass("last_name")} />
            {touched.last_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                {fieldValidity.last_name ? <CheckCircle2 size={17} strokeWidth={2} className="text-emerald-500" /> : <AlertCircle size={17} strokeWidth={2} className="text-red-500" />}
              </span>
            )}
          </div>
          {errors.last_name && touched.last_name && <span className="text-[11.5px] text-red-500 font-medium pl-1">{errors.last_name}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="relative">
          <Mail className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("email")}`} size={18} strokeWidth={1.5} />
          <input type="email" name="email" placeholder="Adresa de email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={getInputClass("email")} />
          {touched.email && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              {fieldValidity.email ? <CheckCircle2 size={17} strokeWidth={2} className="text-emerald-500" /> : <AlertCircle size={17} strokeWidth={2} className="text-red-500" />}
            </span>
          )}
        </div>
        {errors.email && touched.email && <span className="text-[11.5px] text-red-500 font-medium pl-1">{errors.email}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <div
          ref={phoneWrapRef}
          className={`relative flex items-stretch overflow-hidden p-0! bg-[#f4f7fb] rounded-[10px] border ${getPhoneGroupClass()} [&_.PhoneInput]:flex [&_.PhoneInput]:items-center [&_.PhoneInput]:w-full [&_.PhoneInput]:flex-1 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:h-full [&_.PhoneInputCountry]:relative [&_.PhoneInputCountry]:border-r [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:py-4 [&_.PhoneInputInput]:pr-11 [&_.PhoneInputInput]:pl-3.5 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:font-sans [&_.PhoneInputInput]:text-[14.5px] [&_.PhoneInputInput]:text-[#1a1a1a] [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:placeholder:text-[#8595aa]`}
        >
          <PhoneInput
            international
            defaultCountry="RO"
            value={formData.phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            placeholder="Număr de telefon"
            countrySelectComponent={CustomCountrySelect}
            focusInputOnCountrySelection={false}
          />
          {touched.phone && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
              {fieldValidity.phone ? <CheckCircle2 size={17} strokeWidth={2} className="text-emerald-500" /> : <AlertCircle size={17} strokeWidth={2} className="text-red-500" />}
            </span>
          )}
        </div>
        {errors.phone && touched.phone && <span className="text-[11.5px] text-red-500 font-medium pl-1">{errors.phone}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <div className="relative">
          <Lock className={`absolute left-[18px] top-1/2 -translate-y-1/2 transition-colors duration-300 ${getIconClass("password")}`} size={18} strokeWidth={1.5} />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Creează o parolă"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={handleBlur}
            className={getInputClass("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Arată/Ascunde parola"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-1 text-[#8595aa] cursor-pointer flex items-center justify-center transition-colors duration-200 hover:text-[#1e4d8c]"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        </div>
        {(passwordFocused || formData.password.length > 0) && (
          <PasswordRequirements passwordRules={passwordRules} />
        )}
      </div>

      <label className="flex items-start gap-2.5 text-xs text-[#4f6280] leading-relaxed cursor-pointer mb-2">
        <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#0d2c5c]" />
        <span>
          Sunt de acord cu <Link to="/termeni-si-conditii" className="font-bold text-[#0d2c5c] underline">Termenii și condițiile</Link> și am luat cunoștință de <Link to="/confidentialitate" className="font-bold text-[#0d2c5c] underline">Politica de confidențialitate</Link> și <Link to="/gdpr" className="font-bold text-[#0d2c5c] underline">Drepturile GDPR</Link>.
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-3 w-full py-[18px] bg-[#0d2c5c] text-white rounded-[10px] text-sm font-bold tracking-[0.1em] uppercase shadow-[0_4px_15px_rgba(13,44,92,0.15)] transition-all duration-300 hover:not-disabled:bg-[#c69a3f] hover:not-disabled:text-[#0d2c5c] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(198,154,63,0.3)] disabled:bg-[#8595aa] disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? "Se creează contul..." : "Înregistrează-te"}
        {!isLoading && <ArrowRight size={18} strokeWidth={2} />}
      </button>
    </form>
  );
}
