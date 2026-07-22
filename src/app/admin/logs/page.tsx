"use client";

import React, { useState, useEffect } from "react";
import { useAdminState } from "@/context/AdminContext";
import { Loader2, Download, Search, RefreshCw, ClipboardList, Clock } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  admin: string;
  details: string;
}

export default function AdminLogsPage() {
  const { logs, loadingLogs, isLogsLoaded, fetchLogs } = useAdminState();
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLogs(logs);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.action.toLowerCase().includes(query) ||
        log.admin.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query)
    );
    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  const handleDownloadCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Timestamp", "Admin User", "Action performed", "Details"];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.admin,
      log.action,
      log.details,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingLogs && !isLogsLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading audit logs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-espresso font-semibold flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-brand-honey" /> System Audit Logs
          </h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Track and audit admin dashboard activity, including order status updates, products, and catalog actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLogs()}
            className="p-2.5 bg-brand-cream-warm/40 border border-brand-cream-dark/50 hover:bg-brand-cream-warm/75 text-brand-espresso rounded-xl transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={filteredLogs.length === 0}
            className="h-10 px-4 bg-brand-honey hover:bg-brand-honey-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-brand-espresso/40 shrink-0" />
        <input
          type="text"
          placeholder="Search logs by admin, action, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-medium text-brand-espresso bg-transparent border-0 focus:ring-0 placeholder:text-brand-espresso/35 focus:outline-none"
        />
      </div>

      {/* Logs Table / Spreadsheet */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-cream-light/30 border-b border-brand-cream-dark/30 text-brand-espresso/60 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Admin User</th>
                <th className="p-4 font-semibold">Action Performed</th>
                <th className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-light font-medium text-brand-espresso">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-brand-espresso/40">
                    No activity logs recorded matching criteria
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-cream-light/10 transition-colors">
                    <td className="p-4 font-sans whitespace-nowrap text-brand-espresso/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">{log.admin}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-cream-warm/40 text-[10px] font-bold uppercase tracking-wider text-brand-espresso">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-brand-espresso/75 font-sans leading-relaxed">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
