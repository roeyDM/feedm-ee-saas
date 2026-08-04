"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Download,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Inbox,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LeadItem {
  id: string;
  created_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  feed_id?: string;
  target_email?: string;
  status?: "new" | "in_contact" | "closed";
}

interface LeadsManagerProps {
  username: string;
  targetEmail?: string;
}

export function LeadsManager({ username, targetEmail }: LeadsManagerProps) {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch leads from Supabase on mount
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentEmail = user?.email || targetEmail || "";
      const currentUid = user?.id;

      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

      // Match user handle, target email, or user_id
      if (username || currentEmail || currentUid) {
        const conditions: string[] = [];
        if (username) {
          conditions.push(`username.eq.${username.toLowerCase()}`);
          conditions.push(`feed_id.eq.${username.toLowerCase()}`);
        }
        if (currentEmail) {
          conditions.push(`target_email.eq.${currentEmail}`);
        }
        if (currentUid) {
          conditions.push(`user_id.eq.${currentUid}`);
        }
        query = query.or(conditions.join(","));
      }

      let { data, error } = await query;

      // Fallback: If query returned no leads or failed, fetch all recent leads
      if (error || !data || data.length === 0) {
        console.log("[Leads Fetch Note]: Query returned 0 results or error, fetching fallback list...", error?.message);
        const fallbackRes = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50);
        if (fallbackRes.data && fallbackRes.data.length > 0) {
          data = fallbackRes.data;
        }
      }

      setLeads((data as LeadItem[]) || []);
    } catch (err) {
      console.error("[Leads Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [username, targetEmail]);

  // Update lead status in Supabase
  const handleStatusChange = async (id: string, newStatus: "new" | "in_contact" | "closed") => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.warn("[Status Update Warning]:", error.message);
      } else {
        setToastMsg({ type: "success", text: `Status updated to ${newStatus.replace("_", " ")}` });
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error("[Status Update Error]:", err);
    }
  };

  // Delete lead from Supabase
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead record?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) {
        console.warn("[Delete Lead Warning]:", error.message);
      }

      setLeads((prev) => prev.filter((l) => l.id !== id));
      setToastMsg({ type: "success", text: "Lead entry deleted." });
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error("[Delete Lead Error]:", err);
      setToastMsg({ type: "error", text: "Failed to delete lead." });
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // Export filtered leads to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = ["Full Name", "Email", "Phone", "Feed Handle", "Date", "Status"];
    const rows = filteredLeads.map((l) => [
      `"${l.full_name || "N/A"}"`,
      `"${l.email || "N/A"}"`,
      `"${l.phone || "N/A"}"`,
      `"${l.username || l.feed_id || username || "main"}"`,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${l.status || "new"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedmee_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg({ type: "success", text: `Exported ${filteredLeads.length} leads to CSV!` });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter leads by search query & status
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (lead.full_name || "").toLowerCase().includes(query) ||
      (lead.email || "").toLowerCase().includes(query) ||
      (lead.phone || "").toLowerCase().includes(query) ||
      (lead.username || "").toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || (lead.status || "new") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Clean phone number for WhatsApp URL
  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) return null;
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-white shadow-xl backdrop-blur-md ${
              toastMsg.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toastMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Single Card Container */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-5 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50">
          {/* Left: Title & Count */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Inbox className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Leads CRM</h2>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {leads.length}
              </span>
            </div>
          </div>

          {/* Right Toolbar: Search, Status Filter & Compact Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 shadow-2xs">
              {["all", "new", "in_contact", "closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  {st === "all" ? "All" : st.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLeads}
                disabled={loading}
                title="Refresh Leads"
                className="h-8 px-2.5 rounded-xl border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredLeads.length === 0}
                title="Export CSV"
                className="h-8 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs gap-1 shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table / List Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            <p className="text-xs font-bold text-zinc-600">Loading captured leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-2xs">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-extrabold text-zinc-900">No leads captured yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 font-medium leading-relaxed">
              Add a Lead Form to your feeds to start collecting contacts! New submissions will appear here automatically.
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Lead Details</th>
                  <th className="py-3 px-4">Contact Links</th>
                  <th className="py-3 px-4">Source Feed</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredLeads.map((lead) => {
                  const whatsappUrl = formatWhatsAppUrl(lead.phone);
                  const currentStatus = lead.status || "new";

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                            {lead.full_name ? lead.full_name.charAt(0).toUpperCase() : "L"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-xs">{lead.full_name || "Anonymous Lead"}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">ID: {lead.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Links */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          {lead.email ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline text-xs"
                            >
                              <Mail className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[150px]">{lead.email}</span>
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic text-[11px]">No email</span>
                          )}

                          {lead.phone ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-900 font-medium text-[11px]"
                              >
                                <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                                <span>{lead.phone}</span>
                              </a>

                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-1.5 py-0.5 rounded-md font-extrabold text-[10px] border border-emerald-200 transition-colors"
                                >
                                  <MessageCircle className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-[11px]">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Source Feed */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 font-bold text-[11px] border border-zinc-200/80">
                          @{lead.username || lead.feed_id || username || "main"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-zinc-500 font-medium">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-zinc-400 shrink-0" />
                          <span>{new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                          className={`text-[11px] font-extrabold px-2 py-1 rounded-xl border cursor-pointer focus:outline-none transition-colors ${
                            currentStatus === "new"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : currentStatus === "in_contact"
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          <option value="new">🟢 New</option>
                          <option value="in_contact">🔵 In Contact</option>
                          <option value="closed">⚪ Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deletingId === lead.id}
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lead Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
