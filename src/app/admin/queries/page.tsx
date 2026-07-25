"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAdminState, ContactQuery } from "@/context/AdminContext";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Check,
  AlertCircle,
  Building,
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";

function formatDateTime(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const dateStr = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return isoString;
  }
}

export default function AdminQueriesPage() {
  const [supabase] = useState(() => createClient());
  const { queries, loadingQueries, isQueriesLoaded, fetchQueries, setQueries } = useAdminState();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Selected Query Detail Panel
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);

  // Read/unread tracking state
  const [readQueryIds, setReadQueryIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const readIds = JSON.parse(localStorage.getItem("admin_read_queries") || "[]");
      setReadQueryIds(readIds);
    } catch {}
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const markAsRead = (queryId: string) => {
    setReadQueryIds((prev) => {
      if (prev.includes(queryId)) return prev;
      const next = [...prev, queryId];
      localStorage.setItem("admin_read_queries", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("query-marked-read"));
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = queries.map((q) => q.id);
    localStorage.setItem("admin_read_queries", JSON.stringify(allIds));
    setReadQueryIds(allIds);
    window.dispatchEvent(new CustomEvent("query-marked-read"));
    setFeedback({ type: "success", msg: "All queries marked as read." });
  };

  const selectQuery = (q: ContactQuery) => {
    setSelectedQuery(q);
    markAsRead(q.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this query log?")) return;
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/queries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to remove inquiry log");

      setQueries((prev) => prev.filter((q) => q.id !== id));
      setFeedback({ type: "success", msg: "Inquiry log deleted successfully" });
      if (selectedQuery?.id === id) {
        setSelectedQuery(null);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", msg: error.message || "Failed to remove inquiry log" });
    }
  };

  // Filter queries based on text search and calendar date
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const term = searchQuery.toLowerCase().trim();
      if (term) {
        const matchesName = q.name?.toLowerCase().includes(term);
        const matchesEmail = q.email?.toLowerCase().includes(term);
        const matchesPhone = q.phone?.toLowerCase().includes(term);
        const matchesCompany = q.company?.toLowerCase().includes(term);
        const matchesMessage = q.message?.toLowerCase().includes(term);
        const matchesQuantity = q.quantity?.toLowerCase().includes(term);
        const matchesId = q.id?.toLowerCase().includes(term);

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCompany && !matchesMessage && !matchesQuantity && !matchesId) {
          return false;
        }
      }

      if (filterDate) {
        const qDate = new Date(q.created_at);
        const qDateStr = `${qDate.getFullYear()}-${String(qDate.getMonth() + 1).padStart(2, "0")}-${String(qDate.getDate()).padStart(2, "0")}`;
        if (qDateStr !== filterDate) {
          return false;
        }
      }

      return true;
    });
  }, [queries, searchQuery, filterDate]);

  const exportToCSV = () => {
    if (!filteredQueries.length) return;
    const headers = ["Query ID", "Date & Time", "Customer Name", "Email", "Phone", "Company", "Target Reserve/Quantity", "Status", "Message"];
    const rows = filteredQueries.map((q) => [
      `"${q.id}"`,
      `"${formatDateTime(q.created_at)}"`,
      `"${(q.name || "").replace(/"/g, '""')}"`,
      `"${(q.email || "").replace(/"/g, '""')}"`,
      `"${(q.phone || "").replace(/"/g, '""')}"`,
      `"${(q.company || "").replace(/"/g, '""')}"`,
      `"${(q.quantity || "").replace(/"/g, '""')}"`,
      `"${readQueryIds.includes(q.id) ? "READ" : "UNREAD"}"`,
      `"${(q.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `queries_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingQueries && !isQueriesLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Loading query registry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header Bar matching Orders Registry */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-sans font-semibold tracking-tight text-brand-espresso">Queries Registry</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Spreadsheet-style view of all customer inquiries. Click any query row to show full detailed summary.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchQueries()}
            className="p-2.5 bg-brand-cream-warm border border-brand-cream-dark text-brand-espresso hover:bg-brand-cream-light rounded-xl transition cursor-pointer"
            title="Reload database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {readQueryIds.length < queries.length && (
            <button
              onClick={markAllAsRead}
              className="h-11 px-4 bg-brand-cream-warm border border-brand-cream-dark text-brand-espresso hover:bg-brand-cream-light font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 cursor-pointer"
            >
              Mark All Read
            </button>
          )}

          <button
            onClick={exportToCSV}
            className="h-11 px-4 bg-brand-espresso text-white hover:bg-brand-espresso/90 font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-2 cursor-pointer"
          >
            Export CSV
          </button>

          {/* Calendar Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-11 px-3 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso cursor-pointer"
              title="Filter by calendar date"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-espresso/40 hover:text-brand-espresso"
                title="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-espresso/45">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso"
            />
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-xs border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p className="font-semibold">{feedback.msg}</p>
        </div>
      )}

      {/* Main Split Layout: Table on Left, Details Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Spreadsheet Table of Queries */}
        <div
          className={`bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 ${
            selectedQuery ? "lg:col-span-6 xl:col-span-7" : "lg:col-span-12"
          } ${selectedQuery ? "hidden lg:block" : "block"}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-brand-cream-light/30 border-b border-brand-cream-dark/30 text-brand-espresso/60 font-bold uppercase tracking-wider">
                  <th className="p-3.5 font-semibold">QUERY NO</th>
                  <th className="p-3.5 font-semibold">CUSTOMER</th>
                  <th className="p-3.5 font-semibold">DATE & TIME</th>
                  <th className="p-3.5 font-semibold">CONTACT</th>
                  <th className="p-3.5 font-semibold">STATUS</th>
                  <th className="p-3.5 font-semibold">QUANTITY / BATCH</th>
                  <th className="p-3.5 font-semibold text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-light font-medium text-brand-espresso">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-espresso/45">
                      No matching inquiry records found.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q, idx) => {
                    const isUnread = !readQueryIds.includes(q.id);
                    const isSelected = selectedQuery?.id === q.id;
                    const shortId = `Q-${(q.id || "").slice(0, 6).toUpperCase()}`;

                    return (
                      <tr
                        key={q.id}
                        onClick={() => selectQuery(q)}
                        className={`hover:bg-brand-cream-light/10 transition-colors cursor-pointer ${
                          isUnread ? "bg-amber-50/40 font-bold border-l-4 border-l-brand-honey" : ""
                        } ${isSelected ? "bg-brand-cream-warm/25 font-bold" : ""}`}
                      >
                        <td className="p-3.5 font-sans select-all font-bold">{shortId}</td>
                        <td className="p-3.5 font-bold truncate max-w-[130px]">
                          <div>{q.name}</div>
                          {q.company && (
                            <div className="text-[10px] font-normal text-brand-espresso-muted truncate flex items-center gap-1">
                              <Building className="w-3 h-3 text-brand-honey inline shrink-0" />
                              {q.company}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-brand-espresso/80 whitespace-nowrap font-sans font-medium text-[11px]">
                          {formatDateTime(q.created_at)}
                        </td>
                        <td className="p-3.5 text-brand-espresso/80 truncate max-w-[150px]">
                          <div>{q.email}</div>
                          {q.phone && <div className="text-[10px] text-brand-espresso/60 font-sans font-semibold">{q.phone}</div>}
                        </td>
                        <td className="p-3.5">
                          {isUnread ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider bg-amber-100 text-amber-900 border border-amber-300 inline-block animate-pulse">
                              UNREAD
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider bg-stone-100 text-stone-600 border border-stone-200 inline-block">
                              READ
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold">
                          <span className="px-2 py-0.5 rounded bg-brand-cream-warm text-brand-espresso text-[9px] font-bold uppercase tracking-wider">
                            {q.quantity || "General"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => selectQuery(q)}
                              className="p-1 text-brand-honey hover:text-brand-honey-dark transition cursor-pointer"
                              title="View full query details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              className="p-1 text-red-500 hover:text-red-700 transition cursor-pointer"
                              title="Delete query log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Detail Panel matching Orders Registry */}
        {selectedQuery && (
          <div className="bg-white border border-brand-cream-dark/50 rounded-3xl p-6 shadow-md lg:col-span-6 xl:col-span-5 space-y-6">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-cream-light">
              <button
                onClick={() => setSelectedQuery(null)}
                className="flex items-center gap-1.5 text-xs text-brand-espresso/60 hover:text-brand-espresso font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Registry
              </button>

              <span className="text-[10px] font-mono text-brand-espresso/50 select-all">
                ID: {selectedQuery.id}
              </span>
            </div>

            {/* Query Summary Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-espresso/45 font-bold">Customer Name</p>
                <p className="text-sm font-serif font-bold text-brand-espresso mt-0.5">
                  {selectedQuery.name}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-brand-espresso/45 font-bold">Target Reserve / Batch</p>
                <span className="mt-1 inline-block px-3 py-1 bg-brand-cream-warm text-brand-espresso font-bold text-xs rounded-xl uppercase tracking-wider">
                  {selectedQuery.quantity || "General Inquiry"}
                </span>
              </div>
            </div>

            {/* Customer Contact Card */}
            <div className="p-4 bg-brand-cream-light/20 rounded-2xl border border-brand-cream-light space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-brand-espresso/70">
                Contact Information
              </h4>
              <div className="text-[11px] space-y-1.5">
                <div className="flex items-center gap-2 text-brand-espresso">
                  <Mail className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                  <a href={`mailto:${selectedQuery.email}`} className="font-bold hover:underline">
                    {selectedQuery.email}
                  </a>
                </div>
                {selectedQuery.phone && (
                  <div className="flex items-center gap-2 text-brand-espresso">
                    <Phone className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                    <a href={`tel:${selectedQuery.phone}`} className="font-bold hover:underline font-mono">
                      {selectedQuery.phone}
                    </a>
                  </div>
                )}
                {selectedQuery.company && (
                  <div className="flex items-center gap-2 text-brand-espresso pt-1 border-t border-brand-cream-light">
                    <Building className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                    <span className="font-bold">Company: {selectedQuery.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Message Text */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-brand-espresso/50">
                Inquiry Message Payload
              </h4>
              <div className="p-4 bg-brand-cream-light/30 border border-brand-cream-dark/30 rounded-2xl text-xs text-brand-espresso leading-relaxed font-sans font-light italic">
                &ldquo;{selectedQuery.message}&rdquo;
              </div>
            </div>

            {/* Timestamp & Metadata */}
            <div className="space-y-1 text-xs border-b border-brand-cream-light pb-4">
              <div className="flex justify-between items-center text-[10px] text-brand-espresso/60 font-mono">
                <span>Submitted At:</span>
                <span className="font-bold">{formatDateTime(selectedQuery.created_at)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleDelete(selectedQuery.id)}
                className="flex-1 h-11 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Delete Inquiry
              </button>
              <button
                onClick={() => setSelectedQuery(null)}
                className="flex-1 h-11 bg-brand-espresso text-white hover:bg-brand-espresso/90 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
