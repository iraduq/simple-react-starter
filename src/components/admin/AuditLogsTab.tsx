import { useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  TableSkeleton,
  EmptyState,
  SearchBox,
  Pagination,
  usePaged,
} from "./ui";
import { get, list, dateTimeFmt, errMsg, type AuditLog } from "../../lib/admin";
import { useToast } from "../Toast";

type SortKey = "timestamp" | "user" | "action" | "resource" | "ip";
type SortDir = "asc" | "desc";

export default function AuditLogsTab() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/admin/audit-logs/");
      setLogs(list<AuditLog>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    const getVal = (log: AuditLog, key: SortKey): string => {
      switch (key) {
        case "timestamp": return log.timestamp || log.created_at || "";
        case "user": return log.user_email || String(log.user_id || "");
        case "action": return log.action || "";
        case "resource": return log.resource || log.resource_type || "";
        case "ip": return log.ip_address || log.ip || "";
      }
    };
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((log) => {
        const fields = [log.user_email, log.action, log.resource, log.resource_type, log.ip_address, log.ip, String(log.user_id || "")];
        return fields.some((f) => (f || "").toLowerCase().includes(q));
      });
    }
    result.sort((a, b) => {
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [logs, sortKey, sortDir, search]);

  const paged = usePaged(sorted, 15);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : (
      <span className="opacity-20"><ChevronDown size={12} /></span>
    );

  const actionTone = (action?: string | null) => {
    if (!action) return "muted" as const;
    const a = action.toLowerCase();
    if (a.includes("delete") || a.includes("remove")) return "red" as const;
    if (a.includes("create") || a.includes("add")) return "green" as const;
    if (a.includes("update") || a.includes("edit") || a.includes("patch")) return "navy" as const;
    return "muted" as const;
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Securitate"
        title="Jurnal de audit"
        action={
          <Button variant="ghost" size="sm" onClick={() => void load()}>Reîmprospătează</Button>
        }
      />

      <div className="mb-4">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Caută după utilizator, acțiune, resursă, IP…"
          className="sm:max-w-md"
        />
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={8} />
        ) : sorted.length === 0 ? (
          <EmptyState title="Nicio acțiune înregistrată" hint="Jurnalul va popula pe măsură ce se efectuează acțiuni." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#4f6280]">
                  <th className="px-5 py-3 font-bold">
                    <button onClick={() => toggleSort("timestamp")} className="flex items-center gap-1 hover:text-[#0d2c5c]">
                      Timestamp <SortIcon col="timestamp" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold">
                    <button onClick={() => toggleSort("user")} className="flex items-center gap-1 hover:text-[#0d2c5c]">
                      Utilizator <SortIcon col="user" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold">
                    <button onClick={() => toggleSort("action")} className="flex items-center gap-1 hover:text-[#0d2c5c]">
                      Acțiune <SortIcon col="action" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold">
                    <button onClick={() => toggleSort("resource")} className="flex items-center gap-1 hover:text-[#0d2c5c]">
                      Resursă <SortIcon col="resource" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-bold">
                    <button onClick={() => toggleSort("ip")} className="flex items-center gap-1 hover:text-[#0d2c5c]">
                      IP <SortIcon col="ip" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((log) => (
                  <tr key={log.id} className="border-b border-[#f4f6f9] last:border-0">
                    <td className="px-5 py-3.5 text-[12.5px] text-[#2a3b52]">{dateTimeFmt(log.timestamp || log.created_at)}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">{log.user_email || `#${log.user_id}` || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={actionTone(log.action)}>{log.action || "—"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[#2a3b52]">
                      {log.resource || log.resource_type || "—"}
                      {log.resource_id && <span className="ml-1 text-[12px] text-[#6b7c99]">#{log.resource_id}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] text-[#4f6280]">{log.ip_address || log.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={paged.page}
              pages={paged.pages}
              total={paged.total}
              perPage={paged.perPage}
              onPage={paged.setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
