"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAdminState } from "@/context/AdminContext";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Check,
  AlertCircle,
  Inbox,
  Building,
  X,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import { ContactQuery } from "@/context/AdminContext";

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

  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [readQueryIds, setReadQueryIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

  // Real-time Search & Date Filtering Logic
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      // 1. Text Search Filter (Name, Email, Phone, Company, Message, Quantity)
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matchesName = q.name?.toLowerCase().includes(term);
        const matchesEmail = q.email?.toLowerCase().includes(term);
        const matchesPhone = q.phone?.toLowerCase().includes(term);
        const matchesCompany = q.company?.toLowerCase().includes(term);
        const matchesMessage = q.message?.toLowerCase().includes(term);
        const matchesQuantity = q.quantity?.toLowerCase().includes(term);

        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCompany && !matchesMessage && !matchesQuantity) {
          return false;
        }
      }

      // 2. Calendar Date Filter
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

  // Export queries to CSV
  const exportToCSV = () => {
    if (filteredQueries.length === 0) return;
    const headers = ["ID", "Date & Time", "Name", "Email", "Phone", "Company", "Quantity/Reserve", "Status", "Message"];
    const rows = filteredQueries.map((q) => [
      q.id,
      formatDateTime(q.created_at),
      `"${(q.name || "").replace(/"/g, '""')}"`,
      `"${(q.email || "").replace(/"/g, '""')}"`,
      `"${(q.phone || "").replace(/"/g, '""')}"`,
      `"${(q.company || "").replace(/"/g, '""')}"`,
      `"${(q.quantity || "").replace(/"/g, '""')}"`,
      readQueryIds.includes(q.id) ? "READ" : "UNREAD",
      `"${(q.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VanBasket_Queries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const unreadCount = useMemo(() => {
    return queries.filter((q) => !readQueryIds.includes(q.id)).length;
  }, [queries, readQueryIds]);

  if (loadingQueries && !isQueriesLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">
          Retrieving client inquiries...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Title & Metrics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-espresso font-semibold">User Queries & Inquiries</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">
            Structured tabular records of customer inquiries, bulk Jamun Pulp orders, and custom batch requests.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-brand-cream-dark/40 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60 block">Total Records</span>
            <span className="text-lg font-serif font-black text-brand-espresso">{queries.length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Unread</span>
            <span className="text-lg font-serif font-black text-amber-700">{unreadCount}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-xs ${
            feedback.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Control Bar: Search, Calendar Date Picker, Export & Actions */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Search & Calendar Date Filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Name/Text Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-brand-espresso/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, email, company, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-8 bg-brand-cream-light/30 border border-brand-cream-dark/40 rounded-xl text-xs text-brand-espresso placeholder:text-brand-espresso/40 focus:outline-none focus:border-brand-honey font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-espresso/40 hover:text-brand-espresso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Calendar Date Filter */}
          <div className="flex items-center gap-2 bg-brand-cream-light/30 border border-brand-cream-dark/40 rounded-xl px-3 h-10 text-xs">
            <Calendar className="w-4 h-4 text-brand-honey shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-espresso/60 hidden sm:inline">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-xs text-brand-espresso focus:outline-none font-sans cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-brand-espresso/40 hover:text-brand-espresso ml-1"
                title="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(searchQuery || filterDate) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterDate("");
              }}
              className="h-10 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition"
            >
              Clear Filters ({filteredQueries.length} results)
            </button>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchQueries()}
            className="h-10 px-3 border border-brand-cream-dark/40 hover:bg-brand-cream-light text-brand-espresso text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            title="Refresh queries"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="h-10 px-3 border border-brand-honey text-brand-honey hover:bg-brand-honey hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>
          )}

          <button
            onClick={exportToCSV}
            disabled={filteredQueries.length === 0}
            className="h-10 px-4 bg-brand-espresso hover:bg-brand-espresso/90 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-honey" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Excel-Style Tabular Data Table */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            {/* Table Header */}
            <thead>
              <tr className="bg-brand-cream-light/60 border-b border-brand-cream-dark/40 text-brand-espresso font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-16 text-center">Status</th>
                <th className="py-3.5 px-4 w-44">Date & Time</th>
                <th className="py-3.5 px-4 w-44">Customer Name</th>
                <th className="py-3.5 px-4 w-52">Email / Contact</th>
                <th className="py-3.5 px-4 w-36">Company</th>
                <th className="py-3.5 px-4 w-36">Target Reserve</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4 w-20 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-brand-cream-dark/30">
              {filteredQueries.map((q, idx) => {
                const isUnread = !readQueryIds.includes(q.id);
                return (
                  <tr
                    key={q.id}
                    onClick={() => selectQuery(q)}
                    className={`hover:bg-brand-cream-light/40 transition cursor-pointer ${
                      isUnread
                        ? "bg-amber-50/70 border-l-4 border-l-brand-honey font-semibold"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-[#fcfaf7]"
                    }`}
                  >
                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isUnread ? (
                        <span className="bg-brand-honey text-white text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block animate-pulse">
                          NEW
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-500 text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block">
                          READ
                        </span>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 text-brand-espresso/80 whitespace-nowrap font-mono text-[11px]">
                      {formatDateTime(q.created_at)}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3 px-4 text-brand-espresso font-bold">
                      {q.name}
                    </td>

                    {/* Email / Contact */}
                    <td className="py-3 px-4 text-brand-espresso/80 space-y-0.5">
                      <div className="truncate max-w-[180px]">{q.email}</div>
                      {q.phone && <div className="text-[10px] text-brand-espresso/60">{q.phone}</div>}
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4 text-brand-espresso-muted">
                      {q.company ? (
                        <span className="font-semibold text-brand-espresso flex items-center gap-1">
                          <Building className="w-3 h-3 text-brand-honey shrink-0 inline" />
                          <span className="truncate max-w-[120px]">{q.company}</span>
                        </span>
                      ) : (
                        <span className="text-brand-espresso/40 italic">N/A</span>
                      )}
                    </td>

                    {/* Target Reserve / Batch */}
                    <td className="py-3 px-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-cream-warm text-brand-espresso/90 px-2.5 py-1 rounded-md inline-block">
                        {q.quantity || "General"}
                      </span>
                    </td>

                    {/* Message Snippet */}
                    <td className="py-3 px-4 text-brand-espresso-muted font-light">
                      <p className="truncate max-w-xs font-sans text-xs">{q.message}</p>
                    </td>

                    {/* Delete Action Button */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition border border-transparent hover:border-red-200"
                        title="Delete query log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredQueries.length === 0 && (
            <div className="bg-white p-12 text-center text-brand-espresso/45 italic font-bold flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-10 h-10 text-brand-cream-dark mb-1" />
              <span>No matching query records found</span>
              {(searchQuery || filterDate) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDate("");
                  }}
                  className="text-xs text-brand-honey hover:underline not-italic font-normal"
                >
                  Reset search & date filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Query Detail Modal Drawer */}
      {selectedQuery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#201914]/45 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedQuery(null)}
        >
          <div
            className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQuery(null)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-brand-cream-light text-brand-espresso transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-brand-cream-warm text-brand-espresso/80 px-2.5 py-1 rounded-md">
                  Quantity / Batch: {selectedQuery.quantity || "General Inquiry"}
                </span>
                <h2 className="text-2xl font-serif text-brand-espresso font-semibold mt-4">{selectedQuery.name}</h2>
                {selectedQuery.company && (
                  <p className="text-xs text-brand-espresso-muted flex items-center gap-1.5 mt-1 font-semibold">
                    <Building className="w-4 h-4 text-brand-honey" /> {selectedQuery.company}
                  </p>
                )}
              </div>

              <div className="bg-brand-cream-light/60 border border-brand-cream-dark/35 rounded-2xl p-5 text-sm leading-relaxed text-brand-espresso/90 italic font-sans font-light">
                &ldquo;{selectedQuery.message}&rdquo;
              </div>

              <div className="space-y-2 pt-4 border-t border-brand-cream-light text-xs text-brand-espresso-muted font-sans">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-honey" />
                  <a href={`mailto:${selectedQuery.email}`} className="hover:underline font-semibold text-brand-espresso">
                    {selectedQuery.email}
                  </a>
                </div>
                {selectedQuery.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-brand-honey" />
                    <a href={`tel:${selectedQuery.phone}`} className="hover:underline font-semibold text-brand-espresso">
                      {selectedQuery.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[10px] text-brand-espresso/50 pt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted on {formatDateTime(selectedQuery.created_at)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    handleDelete(selectedQuery.id);
                  }}
                  className="flex-1 h-11 border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Delete Log
                </button>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="flex-1 h-11 bg-brand-espresso hover:bg-brand-espresso/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
