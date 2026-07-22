"use client";

import React, { useEffect, useState } from "react";
import { useAdminState } from "@/context/AdminContext";
import { AlertCircle, Loader2, ShieldAlert, UserPlus, X } from "lucide-react";

export default function AdminAdminsPage() {
  const { users, loadingUsers, isUsersLoaded, fetchUsers } = useAdminState();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminFullName, setAdminFullName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const adminUsers = users.filter((user) => user.role === "admin");

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsCreatingAdmin(true);

    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          fullName: adminFullName,
          phone: adminPhone || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create admin.");

      setFeedback({ type: "success", msg: `${adminFullName} can now access the admin panel.` });
      setAdminFullName("");
      setAdminEmail("");
      setAdminPassword("");
      setAdminPhone("");
      setShowCreateAdmin(false);
      fetchUsers(true);
    } catch (err: unknown) {
      const error = err as Error;
      setFeedback({ type: "error", msg: error.message || "Could not create admin." });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  if (loadingUsers && !isUsersLoaded) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-honey animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-bold">Loading admin registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-cream-dark/45 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-brand-espresso font-semibold">Admins</h1>
          <p className="text-xs text-brand-espresso/60 mt-1">Create and monitor administrator access for the back office.</p>
        </div>
        <button
          onClick={() => setShowCreateAdmin(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-espresso hover:bg-brand-espresso/90 text-brand-cream-light px-5 text-xs font-bold uppercase tracking-wider transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {feedback && (
        <div className={`flex items-start gap-3 rounded-xl p-4 text-xs ${feedback.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="bg-white border border-brand-cream-dark/50 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-brand-cream-light">
          {adminUsers.map((user) => (
            <div key={user.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 group relative">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-espresso">{user.full_name || "Admin"}</p>
                  <span className="text-[9px] uppercase tracking-widest bg-brand-honey/10 text-brand-honey font-bold px-2 py-0.5 rounded">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-brand-espresso/60 mt-1">{user.email}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-brand-espresso/60">
                <div className="text-right">
                  <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  <p>Last sign-in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}</p>
                </div>
                
                <button
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to revoke admin access for ${user.full_name || user.email}?`)) return;
                    setFeedback(null);
                    try {
                      const response = await fetch("/api/admin/revoke-admin", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ targetAdminId: user.id, targetEmail: user.email }),
                      });
                      const result = await response.json();
                      if (!response.ok) throw new Error(result.error || "Failed to revoke admin.");
                      
                      setFeedback({ type: "success", msg: "Admin access revoked successfully." });
                      fetchUsers(true);
                    } catch (err: unknown) {
                      const error = err as Error;
                      setFeedback({ type: "error", msg: error.message || "Failed to revoke admin." });
                    }
                  }}
                  className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                  title="Revoke Admin Access"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#201914]/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowCreateAdmin(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-brand-cream-light text-brand-espresso">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-brand-honey mb-4">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-serif text-brand-espresso font-semibold">Add New Admin</h2>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <input type="text" required value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} placeholder="Full name" className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso" />
              <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Email" className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso" />
              <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso" />
              <input type="text" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="Phone (optional)" className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateAdmin(false)} className="flex-1 h-11 rounded-xl border border-brand-cream-dark text-xs font-bold uppercase tracking-wider text-brand-espresso hover:bg-brand-cream-light transition">Cancel</button>
                <button type="submit" disabled={isCreatingAdmin} className="flex-1 h-11 bg-brand-honey hover:bg-brand-honey/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isCreatingAdmin ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating...</span></> : <span>Create Admin</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
