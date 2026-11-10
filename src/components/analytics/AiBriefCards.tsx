import { ClipboardList, TrendingUp } from "lucide-react";
import { Skeleton, Card } from "../admin/ui";
import { AiText } from "./shared";

function ReportCard({
  icon: Icon,
  badge,
  title,
  subtitle,
  text,
  loading,
}: {
  icon: typeof ClipboardList;
  badge: string;
  title: string;
  subtitle: string;
  text?: string;
  loading: boolean;
}) {
  return (
    <Card className="p-6 flex flex-col justify-between border border-[#e1e8f0] shadow-sm">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#e6b85c]">
              <Icon size={18} />
            </span>
            <div>
              <h3 className="text-[20px] font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
                {title}
              </h3>
              <p className="text-[12px] text-[#6b7c99]">{subtitle}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#f4f6f9] border border-[#e1e8f0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0d2c5c]">
            {badge}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2.5 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-[#fafbfc] border border-[#edf2f7] p-4">
            <AiText text={text} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function AiBriefCards({
  brief,
  narrative,
  loading,
}: {
  brief?: string;
  narrative?: string;
  loading: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReportCard
        icon={ClipboardList}
        badge="Sinteză Lunară"
        title="Raport de Activitate & Vânzări"
        subtitle="Analiza performanței veniturilor și a gradului de ocupare"
        text={brief}
        loading={loading}
      />
      <ReportCard
        icon={TrendingUp}
        badge="Comparație"
        title="Tendințe & Evoluție Sezonieră"
        subtitle="Comparație cu luna anterioară și măsuri recomandate"
        text={narrative}
        loading={loading}
      />
    </div>
  );
}
