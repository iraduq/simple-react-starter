import { Activity, Sparkles } from "lucide-react";
import { Skeleton } from "../admin/ui";
import { AiText } from "./shared";

function GradientCard({ icon: Icon, title, text, loading }: {
  icon: typeof Sparkles; title: string; text?: string; loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0d2c5c] via-[#1a3a6e] to-[#c69a3f] p-[1.5px]">
      <div className="h-full rounded-[15px] bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#e6b85c]">
            <Icon size={17} />
          </span>
          <h3 className="text-[22px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        </div>
        {loading ? <div className="space-y-2"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /></div> : <AiText text={text} />}
      </div>
    </div>
  );
}

export default function AiBriefCards({ brief, narrative, loading }: { brief?: string; narrative?: string; loading: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GradientCard icon={Sparkles} title="Sinteză Strategică Executivă" text={brief} loading={loading} />
      <GradientCard icon={Activity} title="Dinamica Comparativă Lună vs. Lună" text={narrative} loading={loading} />
    </div>
  );
}
