"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdminState } from "@/context/AdminContext";
import { Loader2, Download, Search, RefreshCw, ClipboardList, Clock, ShieldCheck, Ban, User, Package } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  admin: string;
  details: string;
  target_resource?: string;
  ip_address?: string;
}

export default function AdminLogsPage() {
  const { logs, loadingLogs, isLogsLoaded, fetchLogs } = useAdminState();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionCategory, setActionCategory] = useState<string>("ALL");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      const act = (log.action || "").toUpperCase();
      if (actionCategory === "ORDERS" && !act.includes("ORDER")) return false;
      if (actionCategory === "REFUNDS" && !act.includes("CANCEL") && !act.includes("REFUND")) return false;
      if (actionCategory === "PRODUCTS" && !act.includes("PRODUCT")) return false;
      if (actionCategory === "AUTH" && !act.includes("AUTH") && !act.includes("LOGIN") && !act.includes("ADMIN")) return false;

      // Search query
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        log.action.toLowerCase().includes(query) ||
        log.admin.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        (log.target_resource?.toLowerCase().includes(query) || false)
      );
    });
  }, [logs, actionCategory, searchQuery]);

  const handleDownloadCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Timestamp", "Admin / User", "Action Type", "Target Resource", "Details"];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.admin,
      log.action,
      log.target_resource || "N/A",
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

  const getBadgeStyle = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CANCEL") || act.includes("REFUND")) {
      return "bg-red-100 text-red-800 border-red-200 font-extrabold";
    }
    if (act.includes("ORDER")) {
      return "bg-sky-100 text-sky-800 border-sky-200 font-bold";
    }
    if (act.includes("PRODUCT")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
    }
    if (act.includes("AUTH") || act.includes("ADMIN")) {
      return "bg-purple-100 text-purple-800 border-purple-200 font-bold";
    }
    return "bg-brand-cream-warm/50 text-brand-espresso border-brand-cream-dark/60 font-semibold";
  };

  if (loadingLogs && !isLogsLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading audit activity logs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-sans text-brand-espresso font-semibold flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-brand-honey" /> Admin Activity & System Logs
          </h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Complete audit trail tracking every registered admin action, order status updates, Razorpay refunds, and catalog mutations.
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
            className="h-10 px-4 bg-brand-espresso hover:bg-brand-espresso/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-brand-cream-dark/30 text-xs">
        {[
          { key: "ALL", label: `All Events (${logs.length})` },
          { key: "ORDERS", label: "Order Status Updates" },
          { key: "REFUNDS", label: "Cancellations & Refunds" },
          { key: "PRODUCTS", label: "Catalog Mutations" },
          { key: "AUTH", label: "Admin Auth & Security" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActionCategory(tab.key)}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              actionCategory === tab.key
                ? "bg-brand-espresso text-white shadow-xs"
                : "bg-brand-cream-warm/40 text-brand-espresso/70 hover:bg-brand-cream-warm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-brand-espresso/40 shrink-0" />
        <input
          type="text"
          placeholder="Search logs by admin email, action type, or event details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-semibold text-brand-espresso bg-transparent border-0 focus:ring-0 placeholder:text-brand-espresso/35 focus:outline-none"
        />
      </div>

      {/* Logs Table / Spreadsheet */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-brand-cream-light/40 border-b border-brand-cream-dark/30 text-brand-espresso/60 font-bold uppercase tracking-wider">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Admin / System User</th>
                <th className="p-4 font-semibold">Event Action</th>
                <th className="p-4 font-semibold">Target Resource</th>
                <th className="p-4 font-semibold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-cream-light font-medium text-brand-espresso">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-brand-espresso/40 font-medium">
                    No activity logs recorded matching search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id ? `log-${log.id}-${idx}` : `log-${idx}`} className="hover:bg-brand-cream-light/20 transition-colors">
                    <td className="p-4 font-mono whitespace-nowrap text-brand-espresso/65 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "medium"
                        })}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-brand-espresso">
                      {log.admin}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] uppercase border inline-block ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-brand-espresso/80">
                      {log.target_resource || "System"}
                    </td>
                    <td className="p-4 text-brand-espresso/80 leading-relaxed font-sans text-xs">
                      {log.details}
                    </td>
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
