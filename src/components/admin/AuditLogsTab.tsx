import { useEffect, useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  Power,
  Plus,
} from "lucide-react";
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
  inputCls,
} from "./ui";
import { get, post, del, list, dateTimeFmt, errMsg, type AuditLog } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";

type SortKey = "timestamp" | "user" | "action" | "resource" | "ip";
type SortDir = "asc" | "desc";

interface BlockedIpEntry {
  ip: string;
  reason?: string | null;
  created_at?: string | null;
}

interface SecurityStateResponse {
  maintenance: boolean;
  current_client_ip: string;
  blocked_ips: BlockedIpEntry[];
}

export default function AuditLogsTab() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Firewall & Maintenance state
  const [maintenance, setMaintenance] = useState(false);
  const [currentClientIp, setCurrentClientIp] = useState("");
  const [blockedIps, setBlockedIps] = useState<BlockedIpEntry[]>([]);
  const [newBlockIp, setNewBlockIp] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [secBusy, setSecBusy] = useState(false);

  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "audit",
    onSync: () => void load(true),
  });
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [logsData, secData] = await Promise.all([
        get<unknown>("/admin/audit-logs/"),
        get<SecurityStateResponse>("/admin/audit-logs/security").catch(() => null),
      ]);
      setLogs(list<AuditLog>(logsData));
      if (secData) {
        setMaintenance(Boolean(secData.maintenance));
        setCurrentClientIp(secData.current_client_ip || "");
        setBlockedIps(Array.isArray(secData.blocked_ips) ? secData.blocked_ips : []);
      }
    } catch (e) {
      if (!silent) toast(errMsg(e), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleToggleMaintenance = async () => {
    const nextState = !maintenance;
    setSecBusy(true);
    try {
      await post("/admin/audit-logs/security/maintenance", { enabled: nextState });
      setMaintenance(nextState);
      toast(
        nextState
          ? "Modul Mentenanță a fost ACTIVAT (cererile publice primesc 503)."
          : "Modul Mentenanță a fost DEZACTIVAT. Platforma este din nou online!",
        nextState ? "info" : "success",
      );
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSecBusy(false);
    }
  };

  const handleBlockIp = async (ipToBlock: string, reasonToUse?: string) => {
    const ipClean = ipToBlock.trim();
    if (!ipClean) return;
    setSecBusy(true);
    try {
      await post("/admin/audit-logs/security/block-ip", {
        ip: ipClean,
        reason: (reasonToUse || newBlockReason || "Blocat din Panoul Admin").trim(),
      });
      toast(`Adresa IP ${ipClean} a fost adăugată în Firewall Blacklist.`, "success");
      setNewBlockIp("");
      setNewBlockReason("");
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSecBusy(false);
    }
  };

  const handleUnblockIp = async (ipToUnblock: string) => {
    setSecBusy(true);
    try {
      await del(`/admin/audit-logs/security/block-ip?ip=${encodeURIComponent(ipToUnblock)}`);
      toast(`Adresa IP ${ipToUnblock} a fost deblocată.`, "success");
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSecBusy(false);
    }
  };

  const blockedSet = useMemo(() => new Set(blockedIps.map((b) => b.ip)), [blockedIps]);

  const sorted = useMemo(() => {
    const getVal = (log: AuditLog, key: SortKey): string => {
      switch (key) {
        case "timestamp":
          return log.timestamp || log.created_at || "";
        case "user":
          return log.user_email || String(log.user_id || "");
        case "action":
          return log.action || "";
        case "resource":
          return log.resource || log.resource_type || "";
        case "ip":
          return log.ip_address || log.ip || "";
      }
    };
    let result = [...logs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((log) => {
        const fields = [
          log.user_email,
          log.action,
          log.resource,
          log.resource_type,
          log.ip_address,
          log.ip,
          String(log.user_id || ""),
        ];
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
      sortDir === "asc" ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      )
    ) : (
      <span className="opacity-20">
        <ChevronDown size={12} />
      </span>
    );

  const actionTone = (action?: string | null) => {
    if (!action) return "muted" as const;
    const a = action.toLowerCase();
    if (a.includes("delete") || a.includes("remove") || a.includes("block")) return "red" as const;
    if (a.includes("create") || a.includes("add") || a.includes("unblock")) return "green" as const;
    if (a.includes("update") || a.includes("edit") || a.includes("patch")) return "navy" as const;
    return "muted" as const;
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Securitate, Firewall & Audit"
        title="Panou Firewall, Mentenanță & Jurnal de Securitate"
        action={<LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />}
      />

      {/* ── PANOU FIREWALL, MENTENANȚĂ & IP BLACKLIST ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Card Mentenanță */}
        <Card className="p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    maintenance ? "bg-red-100 text-red-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {maintenance ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
                </span>
                <div>
                  <h3 className="text-[18px] font-bold text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                    Mod Mentenanță Platformă
                  </h3>
                  <p className="text-[12px] text-[#6b7c99]">
                    IP-ul tău curent: <code className="font-bold text-[#0d2c5c]">{currentClientIp || "—"}</code>
                  </p>
                </div>
              </div>
              <Badge tone={maintenance ? "red" : "green"}>
                {maintenance ? "Mentenanță Activă" : "Sistem Online"}
              </Badge>
            </div>

            <p className="text-[13px] text-[#4f6280] leading-relaxed mt-2">
              Când Modul Mentenanță este activat, vizitatorii publici primesc răspunsul <code>503 Service Unavailable</code>, în timp ce panoul tău de administrare rămâne accesibil.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#eef2f7]">
            <Button
              variant={maintenance ? "primary" : "danger"}
              onClick={handleToggleMaintenance}
              disabled={secBusy}
              className="w-full justify-center"
            >
              <Power size={15} />
              {maintenance ? "Dezactivează Mentenanța (Repornește Accesul Public)" : "Activează Modul Mentenanță"}
            </Button>
          </div>
        </Card>

        {/* Card IP Blacklist */}
        <Card className="p-6 lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[18px] font-bold text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                Firewall & Lista Neagră IP-uri ({blockedIps.length})
              </h3>
              <p className="text-[12px] text-[#6b7c99]">
                Blochează instantaneu adrese IP sau clase de rețea suspecte (ex: <code>203.0.113.45</code>)
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <input
                value={newBlockIp}
                onChange={(e) => setNewBlockIp(e.target.value)}
                placeholder="Adresă IP (ex: 198.51.100.12)"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-5">
              <input
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="Motiv blocare (ex: Încercări repetate login)"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-3 flex">
              <Button
                variant="danger"
                onClick={() => void handleBlockIp(newBlockIp)}
                disabled={secBusy || !newBlockIp.trim()}
                className="w-full justify-center"
              >
                <Plus size={14} /> Blochează IP
              </Button>
            </div>
          </div>

          {blockedIps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafd] p-4 text-center text-[12.5px] text-[#6b7c99]">
              Nicio adresă IP blocată în acest moment. Toate conexiunile legitime sunt permise.
            </div>
          ) : (
            <div className="max-h-44 overflow-y-auto divide-y divide-[#eef2f7] rounded-xl border border-[#e1e8f0] bg-[#f8fafd]">
              {blockedIps.map((item) => (
                <div key={item.ip} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px]">
                  <div>
                    <code className="font-bold text-red-700">{item.ip}</code>
                    <span className="mx-2 text-[#cbd5e1]">•</span>
                    <span className="text-[#4f6280]">{item.reason || "Blocat manual"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUnblockIp(item.ip)}
                    disabled={secBusy}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  >
                    <Unlock size={12} /> Deblochează
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── TABEL JURNAL DE AUDIT ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <EmptyState
            title="Nicio acțiune înregistrată"
            hint="Jurnalul se va popula pe măsură ce se efectuează acțiuni."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
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
                      IP & Firewall <SortIcon col="ip" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((log) => {
                  const rowIp = log.ip_address || log.ip || "";
                  const isRowBlocked = rowIp && blockedSet.has(rowIp);
                  return (
                    <tr key={log.id} className="border-b border-[#f4f6f9] last:border-0">
                      <td className="px-5 py-3.5 text-[12.5px] text-[#2a3b52]">
                        {dateTimeFmt(log.timestamp || log.created_at)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">
                        {log.user_email || (log.user_id ? `#${log.user_id}` : "—")}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={actionTone(log.action)}>{log.action || "—"}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#2a3b52]">
                        {log.resource || log.resource_type || "—"}
                        {log.resource_id && (
                          <span className="ml-1 text-[12px] text-[#6b7c99]">#{log.resource_id}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] text-[#4f6280]">
                        <div className="flex items-center gap-2">
                          <code className="font-mono">{rowIp || "—"}</code>
                          {rowIp && rowIp !== currentClientIp && (
                            isRowBlocked ? (
                              <button
                                type="button"
                                onClick={() => void handleUnblockIp(rowIp)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                <Unlock size={10} /> Deblochează
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleBlockIp(rowIp, `Blocat din Audit (${log.action || "activitate"})`)}
                                className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 hover:bg-red-100 cursor-pointer"
                              >
                                <Ban size={10} /> Blochează
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
