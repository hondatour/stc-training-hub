"use client";

import { motion } from "framer-motion";
import { GraduationCap, MapPin, Users, Sparkles } from "lucide-react";
import type { Stats, Settings } from "@/lib/types/training-hub";

export function CatalogHero({ stats, settings }: { stats: Stats | null; settings: Settings }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-blue-900 via-blue-800 to-red-800 text-white">
      {/* Red & blue blobs matching the STC logo colors */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-fit">
            <img src="/stc-logo.png" alt="STC logo" className="h-14 w-auto rounded-md sm:h-16" />
          </motion.div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-300/30 bg-red-300/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-red-200">
            <Sparkles className="h-3.5 w-3.5" />
            {settings.tagline || "IADC Training Requests"}
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {settings.brandName || "STC Training Hub"}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
            {settings.homeIntro || "Browse upcoming IADC-certified courses across all our country branches."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-2xl sm:grid-cols-4">
            <StatPill icon={<GraduationCap className="h-4 w-4" />} label="Courses live" value={stats?.courses ?? 0} />
            <StatPill icon={<MapPin className="h-4 w-4" />} label="Countries" value={stats?.countries ?? 0} />
            <StatPill icon={<Users className="h-4 w-4" />} label="Candidates" value={stats?.totalCandidates ?? 0} />
            <StatPill icon={<Sparkles className="h-4 w-4" />} label="Open seats" value={stats?.total ?? 0} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-blue-100/70">{icon}{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
