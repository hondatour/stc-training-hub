"use client";

import { useMemo, useState } from "react";
import { Search, Filter, X, Inbox, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { CourseCard } from "./course-card";
import { ClientSubmitDialog } from "./client-submit-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RequestRow, Settings, CountryRow, CourseRow } from "@/lib/types/training-hub";

export function CatalogView({ requests, settings, countries, courses }: { requests: RequestRow[]; settings: Settings; countries: CountryRow[]; courses: CourseRow[] }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [courseType, setCourseType] = useState<string>("all");
  const [submitOpen, setSubmitOpen] = useState(false);

  const filtered = useMemo(() => requests.filter((r) => {
    if (country !== "all" && r.country !== country) return false;
    if (courseType !== "all" && r.courseType !== courseType) return false;
    if (query) {
      const q = query.toLowerCase();
      // Notes are admin-only — not searched in client view
      const hay = `${r.clientName} ${r.courseName} ${r.country}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [requests, query, country, courseType]);
  const hasActiveFilters = query !== "" || country !== "all" || courseType !== "all";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-red-50 p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm"><Sparkles className="h-5 w-5" /></div>
            <div><h3 className="text-base font-semibold text-slate-900">Don&apos;t see your course or country?</h3><p className="mt-0.5 text-sm text-slate-600">Submit a request and our team will get back to you on WhatsApp within 24 hours.</p></div>
          </div>
          <button onClick={() => setSubmitOpen(true)} className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"><Send className="h-4 w-4" />Submit a request</button>
        </div>
      </motion.div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by course, client, country…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All countries</SelectItem>{countries.map((c) => <SelectItem key={c.id} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={courseType} onValueChange={setCourseType}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="Classroom">Classroom</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent>
            </Select>
            {hasActiveFilters && (
              <button onClick={() => { setQuery(""); setCountry("all"); setCourseType("all"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"><X className="h-3 w-3" />Clear</button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500"><div className="inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />Showing <strong className="text-slate-700">{filtered.length}</strong> of {requests.length} available courses</div></div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Inbox className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No courses match your filters</p>
          <p className="mt-1 text-xs text-slate-500">Try clearing the filters, or <button onClick={() => setSubmitOpen(true)} className="font-semibold text-blue-700 underline hover:text-blue-800">submit a request</button> and we&apos;ll get back to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => <CourseCard key={r.id} request={r} settings={settings} countries={countries} index={i} />)}
        </div>
      )}
      <ClientSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} courses={courses} countries={countries} settings={settings} />
    </section>
  );
}
