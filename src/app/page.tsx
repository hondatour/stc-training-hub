"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, ShieldCheck, LayoutDashboard, Settings as SettingsIcon, Layers3, ListChecks, Plus, MessageCircle, Mail, Sparkles, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CatalogHero } from "@/components/training-hub/catalog-hero";
import { CatalogView } from "@/components/training-hub/catalog-view";
import { AdminStats, CountryBreakdown, CourseBreakdown } from "@/components/training-hub/admin-stats";
import { SubmitRequestForm } from "@/components/training-hub/submit-request-form";
import { RequestsTable } from "@/components/training-hub/requests-table";
import { SmartBatchingPanel } from "@/components/training-hub/smart-batching-panel";
import { SettingsPanel } from "@/components/training-hub/settings-panel";
import { AdminGate, lockAdmin } from "@/components/training-hub/admin-gate";
import type { RequestRow, CourseRow, CountryRow, Stats, Settings, BatchRow } from "@/lib/types/training-hub";

type MainView = "catalog" | "admin";
type AdminTab = "dashboard" | "submit" | "requests" | "batching" | "settings";

export default function Home() {
  const [view, setView] = useState<MainView>("catalog");
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");

  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: async () => { const res = await fetch("/api/settings"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.settings as Settings; },
    initialData: {} as Settings,
  });
  const catalogQ = useQuery({
    queryKey: ["requests", "visible"],
    queryFn: async () => { const res = await fetch("/api/requests?visible=true"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.requests as RequestRow[]; },
  });

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    fetch("/api/seed", { method: "POST" }).then(() => Promise.all([settingsQ.refetch(), catalogQ.refetch()])).catch(() => {});
  }, [settingsQ, catalogQ]);

  const allRequestsQ = useQuery({
    queryKey: ["requests", "all"],
    queryFn: async () => { const res = await fetch("/api/requests"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.requests as RequestRow[]; },
    enabled: view === "admin",
  });
  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: async () => { const res = await fetch("/api/courses"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.courses as CourseRow[]; },
  });
  const countriesQ = useQuery({
    queryKey: ["countries"],
    queryFn: async () => { const res = await fetch("/api/countries"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.countries as CountryRow[]; },
  });
  const statsQ = useQuery({
    queryKey: ["stats"],
    queryFn: async () => { const res = await fetch("/api/stats"); if (!res.ok) throw new Error("failed"); return (await res.json()) as Stats; },
    enabled: view === "admin",
  });
  const batchesQ = useQuery({
    queryKey: ["batches"],
    queryFn: async () => { const res = await fetch("/api/batches"); if (!res.ok) throw new Error("failed"); const j = await res.json(); return j.batches as BatchRow[]; },
    enabled: view === "admin",
  });

  const settings: Settings = settingsQ.data || {};
  const requests = catalogQ.data || [];
  const allRequests = allRequestsQ.data || [];
  const courses = coursesQ.data || [];
  const countries = countriesQ.data || [];
  const stats = statsQ.data || null;
  const batches = batchesQ.data || [];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header view={view} setView={setView} settings={settings} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === "catalog" ? (
            <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <CatalogHero stats={statsForCatalog(stats, requests)} settings={settings} />
              <CatalogView requests={requests} settings={settings} countries={countries} courses={courses} />
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <AdminGate>
                <AdminHeader onLock={() => setView("catalog")} />
                <AdminTabs tab={adminTab} setTab={setAdminTab} stats={stats} />
                <div className="mt-5">
                  {adminTab === "dashboard" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                      <AdminStats stats={stats} />
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><CountryBreakdown stats={stats} /><CourseBreakdown stats={stats} /></div>
                    </motion.div>
                  )}
                  {adminTab === "submit" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SubmitRequestForm courses={courses} countries={countries} /></motion.div>}
                  {adminTab === "requests" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><RequestsTable requests={allRequests} courses={courses} countries={countries} /></motion.div>}
                  {adminTab === "batching" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SmartBatchingPanel batches={batches} /></motion.div>}
                  {adminTab === "settings" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SettingsPanel initial={settings} /></motion.div>}
                </div>
              </AdminGate>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer settings={settings} />
    </div>
  );
}

function Header({ view, setView, settings }: { view: MainView; setView: (v: MainView) => void; settings: Settings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button onClick={() => setView("catalog")} className="flex items-center gap-2.5">
          <img src="/stc-logo.png" alt="STC logo" className="h-9 w-auto object-contain" />
          <div className="text-left">
            <div className="text-sm font-bold leading-tight text-slate-900">{settings.brandName || "STC Training Hub"}</div>
            <div className="hidden text-[10px] leading-tight text-slate-500 sm:block">{settings.tagline || "IADC Training Requests"}</div>
          </div>
        </button>
        <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          <NavPill active={view === "catalog"} onClick={() => setView("catalog")} icon={<GraduationCap className="h-3.5 w-3.5" />} label="Course Catalog" />
          <NavPill active={view === "admin"} onClick={() => setView("admin")} icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Admin Console" />
        </nav>
      </div>
    </header>
  );
}
function NavPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${active ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
      {icon}<span className="hidden sm:inline">{label}</span><span className="sm:hidden">{label.split(" ")[0]}</span>
    </button>
  );
}
function AdminHeader({ onLock }: { onLock: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage every training request across all country branches.</p>
      </div>
      <button onClick={() => { lockAdmin(); onLock(); }} className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
        <Lock className="h-3.5 w-3.5" /><span className="hidden sm:inline">Lock</span>
      </button>
    </div>
  );
}
function AdminTabs({ tab, setTab, stats }: { tab: AdminTab; setTab: (t: AdminTab) => void; stats: Stats | null }) {
  const tabs: Array<{ key: AdminTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "submit", label: "Submit Request", icon: <Plus className="h-4 w-4" /> },
    { key: "requests", label: "All Requests", icon: <ListChecks className="h-4 w-4" />, badge: stats?.total },
    { key: "batching", label: "Smart Batching", icon: <Layers3 className="h-4 w-4" />, badge: stats?.batches },
    { key: "settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => setTab(t.key)} className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
          {t.icon}<span>{t.label}</span>
          {typeof t.badge === "number" && t.badge > 0 && <span className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${tab === t.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/stc-logo.png" alt="STC logo" className="h-9 w-auto object-contain" />
              <div className="text-sm font-bold text-slate-900">{settings.brandName || "STC Training Hub"}</div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{settings.tagline || "IADC Training Requests"}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {settings.whatsappNumber && (
                <li><a href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-blue-700"><MessageCircle className="h-4 w-4 text-blue-700" />WhatsApp: {settings.whatsappNumber}</a></li>
              )}
              {settings.contactEmail && (
                <li><a href={`mailto:${settings.contactEmail.replace(/\s*&\s*/g, ",")}`} className="inline-flex items-start gap-2 break-all hover:text-blue-700"><Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" /><span className="break-all">{settings.contactEmail}</span></a></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Why this platform</h4>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />One place to submit & track all country requests</li>
              <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />Auto-batching saves instructor & proctor fees</li>
              <li className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />Clients browse & book via WhatsApp in seconds</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} {settings.brandName || "STC Training Hub"} · Built for multi-country IADC training operations.</div>
      </div>
    </footer>
  );
}

function statsForCatalog(stats: Stats | null, requests: RequestRow[]) {
  if (stats) return { courses: stats.courses, countries: stats.countries, totalCandidates: stats.totalCandidates, total: stats.total };
  const countries = new Set(requests.map((r) => r.country));
  const candidates = requests.reduce((s, r) => s + r.qtyCandidates, 0);
  return { courses: 0, countries: countries.size, totalCandidates: candidates, total: requests.length };
}
