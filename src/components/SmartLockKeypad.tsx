import { useState, useEffect, useMemo } from "react";
import { KeyRound, ShieldCheck, ShieldAlert, RotateCcw, Lock, Unlock } from "lucide-react";
import { API_URL } from "../lib/config";
import { useToast } from "./Toast";

interface SmartLockKeypadProps {
  initialUnitNumber?: string;
  onUnlocked?: (data: Record<string, unknown>) => void;
  units?: string[];
}

export default function SmartLockKeypad({
  initialUnitNumber = "101",
  onUnlocked,
  units = ["101", "102", "201", "202"],
}: SmartLockKeypadProps) {
  const { toast } = useToast();
  const [unitNumber, setUnitNumber] = useState(initialUnitNumber);
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockStatus, setLockStatus] = useState<"locked" | "unlocked" | "error">("locked");
  const [statusMessage, setStatusMessage] = useState<string>("Tastați codul PIN de 6 cifre urmat de #");
  const [unlockedGuest, setUnlockedGuest] = useState<string | null>(null);

  // Sync unit selection when parent component changes it
  useEffect(() => {
    if (initialUnitNumber) {
      setUnitNumber(initialUnitNumber);
      setPin("");
      setLockStatus("locked");
    }
  }, [initialUnitNumber]);

  // Ensure unique unit numbers to eliminate duplicate React key warnings
  const uniqueUnits = useMemo(() => {
    const list = Array.from(new Set((units || []).map((u) => String(u).trim()).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [units]);

  const handleKeyPress = (char: string) => {
    if (lockStatus === "unlocked") return;

    if (char === "C") {
      setPin("");
      setLockStatus("locked");
      setStatusMessage("Tastați codul PIN de 6 cifre urmat de #");
      return;
    }

    if (char === "#") {
      void handleUnlockAttempt();
      return;
    }

    if (pin.length < 8) {
      setPin((prev) => prev + char);
    }
  };

  const handleUnlockAttempt = async () => {
    if (pin.length < 4) {
      toast("Introduceți un cod PIN de minimum 4 cifre.", "warning");
      return;
    }

    setIsVerifying(true);
    setStatusMessage("Verificare cod de acces...");

    try {
      let res = await fetch(`${API_URL}/api/smart-lock/simulate-unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_number: unitNumber,
          pin: pin,
        }),
      });

      if (!res.ok) {
        res = await fetch(`${API_URL}/smart-lock/simulate-unlock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unit_number: unitNumber,
            pin: pin,
          }),
        });
      }

      const data = (await res.json()) as Record<string, unknown>;

      if (res.ok) {
        setLockStatus("unlocked");
        const guest = typeof data.guest_name === "string" ? data.guest_name : "Oaspete";
        setUnlockedGuest(guest);
        setStatusMessage(`Acces Autorizat! Ușa ${unitNumber} este deschisă.`);
        toast(`Ușa camerei ${unitNumber} s-a descuiat! Bun venit, ${guest}!`, "success");
        if (onUnlocked) onUnlocked(data);

        // Auto re-lock after 8s
        setTimeout(() => {
          setLockStatus("locked");
          setPin("");
          setUnlockedGuest(null);
          setStatusMessage("Ușa s-a încuiat automat. Tastați PIN urmat de #.");
        }, 8000);
      } else {
        setLockStatus("error");
        const errMsg = typeof data.message === "string" ? data.message : "Codul PIN este incorect sau nu există cazare activă.";
        setStatusMessage(errMsg);
        toast(errMsg, "error");

        setTimeout(() => {
          setLockStatus("locked");
        }, 3000);
      }
    } catch {
      setLockStatus("error");
      setStatusMessage("Eroare de comunicare cu clanța.");
      toast("Eroare la contactarea clanței inteligente.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-[340px] rounded-3xl bg-[#0c1523] p-6 text-white shadow-2xl border border-white/10 select-none">
      {/* KEYPAD HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8595aa] mb-1">
            Camera / Unitatea
          </span>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f] animate-pulse" />
            <span>Unitatea {unitNumber}</span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors ${
            lockStatus === "unlocked"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
        >
          {lockStatus === "unlocked" ? (
            <>
              <Unlock size={14} /> DESCHIS
            </>
          ) : (
            <>
              <Lock size={14} /> ÎNCUIAT
            </>
          )}
        </div>
      </div>

      {/* LUMINOUS LCD DISPLAY */}
      <div className="my-5 rounded-2xl bg-black/50 border border-white/10 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 text-[11px] font-mono tracking-widest text-[#c69a3f]">
          <KeyRound size={13} />
          {unlockedGuest ? `BUN VENIT, ${unlockedGuest.toUpperCase()}` : `TASTATURĂ DIGITALĂ CAM ${unitNumber}`}
        </div>

        <div className="h-10 flex items-center justify-center">
          {pin.length === 0 ? (
            <span className="text-sm text-white/30 tracking-widest animate-pulse font-mono">
              _ _ _ _ _ _
            </span>
          ) : (
            <span className="text-2xl font-mono tracking-[0.35em] text-[#e6b85c] font-black">
              {"•".repeat(pin.length)}
            </span>
          )}
        </div>

        <p className="mt-2 text-[10px] text-[#8595aa] line-clamp-1">{statusMessage}</p>
      </div>

      {/* NUMERIC TOUCHPAD (3x4) */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "#"].map((btn) => {
          const isClear = btn === "C";
          const isEnter = btn === "#";

          return (
            <button
              key={btn}
              type="button"
              onClick={() => handleKeyPress(btn)}
              disabled={isVerifying}
              className={`h-13 py-3 rounded-2xl font-mono text-lg font-bold transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 ${
                isClear
                  ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                  : isEnter
                  ? "bg-[#c69a3f] text-[#0c1523] font-black shadow-[0_0_15px_rgba(198,154,63,0.4)] hover:bg-[#d8ab4d]"
                  : "bg-white/5 border border-white/10 text-white hover:bg-white/15"
              }`}
            >
              {isClear ? <RotateCcw size={18} /> : btn}
            </button>
          );
        })}
      </div>

      {/* FOOTER STATUS */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8595aa]">
        <div className="flex items-center gap-1">
          {lockStatus === "unlocked" ? (
            <ShieldCheck size={12} className="text-emerald-400" />
          ) : lockStatus === "error" ? (
            <ShieldAlert size={12} className="text-red-400" />
          ) : (
            <ShieldCheck size={12} />
          )}
          <span>IoT Smart Lock v2.4</span>
        </div>
        <span>Auto-lock: 8s</span>
      </div>
    </div>
  );
}
