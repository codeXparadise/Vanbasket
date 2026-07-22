"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAdminState } from "@/context/AdminContext";
import { Loader2, Mail, Phone, Calendar, Trash2, Check, AlertCircle, Inbox, Building, X } from "lucide-react";
import { ContactQuery } from "@/context/AdminContext";

export default function AdminQueriesPage() {
  const [supabase] = useState(() => createClient());
  const { queries, loadingQueries, isQueriesLoaded, fetchQueries, setQueries } = useAdminState();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this query log?")) return;
    setFeedback(null);

    try {
      const { error } = await supabase
        .from("contact_queries")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
    <div className="space-y-8 animate-scale-in">
      {/* Title Header */}
      <div className="border-b border-brand-cream-dark/45 pb-6">
        <h1 className="text-3xl font-serif text-brand-espresso font-semibold">User Queries & Inquiries</h1>
        <p className="text-xs text-brand-espresso/60 mt-1">
          Review bulk custom batch reserve inquiries and message records submitted via the storefront Contact portal. Click on any query to view full details.
        </p>
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

      {/* Queries List Stack */}
      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-brand-cream-light">
          {queries.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQuery(q)}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-cream-light/35 transition cursor-pointer group"
            >
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-wider bg-brand-cream-warm text-brand-espresso/80 px-2 py-0.5 rounded">
                    {q.quantity || "General"}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-brand-espresso">
                    {q.name}
                  </h3>
                  {q.company && (
                    <span className="text-[10px] text-brand-espresso-muted flex items-center gap-1">
                      • <Building className="w-3 h-3 inline" /> {q.company}
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-espresso-muted truncate max-w-xl font-sans font-light">
                  {q.message}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                <div className="text-right text-[10px] text-brand-espresso/60 font-sans">
                  <p className="font-semibold text-brand-espresso">{q.email}</p>
                  <p className="text-[9px] mt-0.5">{new Date(q.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(q.id);
                  }}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500 rounded-lg border border-red-150 cursor-pointer"
                  aria-label="Delete query"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {queries.length === 0 && (
            <div className="bg-white p-12 text-center text-brand-espresso/45 italic font-bold flex flex-col items-center justify-center">
              <Inbox className="w-10 h-10 text-brand-cream-dark mb-2" />
              <span>No user inquiry submissions found</span>
            </div>
          )}
        </div>
      </div>

      {/* Query Detail Modal Drawer */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201914]/45 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedQuery(null)}>
          <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedQuery(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-brand-cream-light text-brand-espresso">
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-brand-cream-warm text-brand-espresso/80 px-2.5 py-1 rounded-md">
                  Quantity: {selectedQuery.quantity || "General Inquiry"}
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
                  <span>Submitted on {new Date(selectedQuery.created_at).toLocaleString()}</span>
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
