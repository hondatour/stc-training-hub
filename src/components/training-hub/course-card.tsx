"use client";

import { motion } from "framer-motion";
import { CalendarDays, Users, MapPin, MessageCircle, GraduationCap, Clock, ChevronRight } from "lucide-react";
import { fmtDate, fmtDateShort, courseTypeColor, whatsappLink, flagForCountry } from "@/lib/training-hub-utils";
import type { RequestRow, Settings, CountryRow } from "@/lib/types/training-hub";

export function CourseCard({ request, settings, countries, index }: { request: RequestRow; settings: Settings; countries: CountryRow[]; index: number }) {
  const country = countries.find((c) => c.name === request.country);
  const flag = country?.flag || flagForCountry(request.country, country?.code);
  const message = `Hello ${settings.brandName || "STC Training Hub"} team,

I'd like to book a seat for the following course:

• Course: ${request.courseName}
• Country: ${request.country} ${flag}
• Start date: ${fmtDate(request.startDate)}
• Exam date: ${fmtDate(request.examDate)}
• Course type: ${request.courseType}

Please share the quotation and availability. Thank you.`;
  const waHref = whatsappLink(settings.whatsappNumber || "", message);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }} whileHover={{ y: -4 }} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Top color band: Blue for Classroom, Red for Live — matches STC logo */}
      <div className={`h-1.5 w-full ${request.courseType === "Classroom" ? "bg-blue-600" : "bg-red-600"}`} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{request.courseName}</h3>
              <div className="mt-0.5 text-xs text-slate-500">{request.courseType} Course</div>
            </div>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${courseTypeColor(request.courseType)}`}>{request.courseType}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <MapPin className="h-4 w-4 text-slate-400" /><span className="mr-1 text-base">{flag}</span>{request.country}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500"><CalendarDays className="h-3 w-3" />Start</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">{fmtDateShort(request.startDate)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500"><Clock className="h-3 w-3" />Exam</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">{fmtDateShort(request.examDate)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <strong className="font-semibold text-slate-900">{request.qtyCandidates}</strong> {request.qtyCandidates === 1 ? "seat" : "seats"} open
          </span>
        </div>
        {request.notes && <p className="line-clamp-2 rounded-md bg-amber-50/60 p-2.5 text-xs text-amber-900">{request.notes}</p>}
        <div className="mt-auto pt-2">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md">
            <MessageCircle className="h-4 w-4" />Book on WhatsApp<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
