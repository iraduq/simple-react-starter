import { Link } from "react-router-dom";
import { AlertCircle, ShieldAlert } from "lucide-react";

interface LoginErrorAlertProps {
  loginError: { message: string; deactivated: boolean };
}

export default function LoginErrorAlert({ loginError }: LoginErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 px-4 py-3.5 rounded-[10px] border text-[13.5px] mb-5 ${
        loginError.deactivated
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {loginError.deactivated ? (
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}
      <div>
        {loginError.deactivated && (
          <p className="font-bold mb-0.5">Cont dezactivat</p>
        )}
        <p className="leading-snug font-medium">{loginError.message}</p>
        {loginError.deactivated && (
          <Link to="/contact" className="inline-block mt-2 font-bold underline">
            Contactează-ne
          </Link>
        )}
      </div>
    </div>
  );
}
