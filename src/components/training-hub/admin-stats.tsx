"use client";

import { ClipboardList, Clock3, CheckCircle2, Layers3, Users, Globe2, GraduationCap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { Stats } from "@/lib/types/training-hub";
import { flagForCountry } from "@/lib/training-hub-utils";

export function AdminStats({ stats }: { stats: Stats | null }) {
  if (!stats) return null;
  const cards = [
    { label: "Total requests", value: stats.total, icon: <ClipboardList className="h-4 w-4" />, tint: "from-slate-50 to-slate-100 text-slate-700", ring: "ring-slate-200" },
    { label: "Pending", value: stats.pending, icon: <Clock3 className="h-4 w-4" />, tint: "from-amber-50 to-amber-100 text-amber-700", ring: "ring-amber-200" },
    { label: "Confirmed", value: stats.confirmed, icon: <CheckCircle2 className="h-4 w-4" />, tint: "from-blue-50 to-blue-100 text-blue-700", ring: "ring-blue-200" },
    { label: "Batched (saving $)", value: stats.batched, icon: <Layers3 className="h-4 w-4" />, tint: "from-red-50 to-red-100 text-red-700", ring: "ring-red-200" },
    { label: "Total candidates", value: stats.totalCandidates, icon: <Users className="h-4 w-4" />, tint: "from-blue-50 to-blue-100 text-blue-700", ring: "ring-blue-200" },
    { label: "Countries", value: stats.countries, icon: <Globe2 className="h-4 w-4" />, tint: "from-red-50 to-red-100 text-red-700", ring: "ring-red-200" },
    { label: "Course catalog", value: stats.courses, icon: <GraduationCap className="h-4 w-4" />, tint: "from-blue-50 to-blue-100 text-blue-700", ring: "ring-blue-200" },
    { label: "Active batches", value: stats.batches, icon: <TrendingUp className="h-4 w-4" />, tint: "from-blue-50 to-red-100 text-blue-700", ring: "ring-blue-200" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${c.tint} p-3 ring-1 ${c.ring}`}>
          <div className="flex items-center justify-between"><span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{c.label}</span><span className="opacity-80">{c.icon}</span></div>
          <div className="mt-1 text-2xl font-bold">{c.value}</div>
        </motion.div>
      ))}
    </div>
  );
}

export function CountryBreakdown({ stats }: { stats: Stats | null }) {
  if (!stats || stats.byCountry.length === 0) return null;
  const max = Math.max(...stats.byCountry.map((c) => c.count), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">Requests by country</h3><span className="text-xs text-slate-500">{stats.byCountry.length} branches</span></div>
      <div className="mt-4 space-y-3">
        {stats.byCountry.map((c) => (
          <div key={c.country} className="flex items-center gap-3">
            <span className="w-32 truncate text-xs font-medium text-slate-700">{flagForCountry(c.country)} {c.country}</span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
              <div className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-blue-600 to-red-600" style={{ width: `${(c.count / max) * 100}%` }} />
              <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-white mix-blend-luminosity">{c.candidates} candidates</span>
            </div>
            <span className="w-8 text-right text-xs font-semibold text-slate-900">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseBreakdown({ stats }: { stats: Stats | null }) {
  if (!stats || stats.byCourse.length === 0) return null;
  const max = Math.max(...stats.byCourse.map((c) => c.count), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-900">Requests by course</h3><span className="text-xs text-slate-500">{stats.byCourse.length} courses</span></div>
      <div className="mt-4 space-y-3">
        {stats.byCourse.map((c) => (
          <div key={c.course} className="flex items-center gap-3">
            <span className="w-40 truncate text-xs font-medium text-slate-700">{c.course}</span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
              <div className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-red-500 to-blue-600" style={{ width: `${(c.count / max) * 100}%` }} />
              <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-semibold text-white mix-blend-luminosity">{c.candidates} candidates</span>
            </div>
            <span className="w-8 text-right text-xs font-semibold text-slate-900">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
