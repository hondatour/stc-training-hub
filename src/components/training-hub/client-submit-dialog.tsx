"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2, GraduationCap, Users, CalendarDays, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CourseRow, CountryRow, Settings } from "@/lib/types/training-hub";
import { whatsappLink, flagForCountry } from "@/lib/training-hub-utils";

interface FormState { clientName: string; courseName: string; country: string; startDate: string; examDate: string; qtyCandidates: string; contactPhone: string; notes: string; }
const initialState: FormState = { clientName: "", courseName: "", country: "", startDate: "", examDate: "", qtyCandidates: "1", contactPhone: "", notes: "" };

export function ClientSubmitDialog({ open, onOpenChange, courses, countries, settings }: {
  open: boolean; onOpenChange: (v: boolean) => void; courses: CourseRow[]; countries: CountryRow[]; settings: Settings;
}) {
  const [form, setForm] = useState<FormState>(initialState);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const qc = useQueryClient();
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (data: FormState) => {
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, qtyCandidates: Number(data.qtyCandidates) || 1, courseType: "Classroom", bookingConfirmed: "Pending", isVisible: false, status: "Client submission", notes: data.notes || "Submitted by client via the public form." }) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => { setCreatedId(data.request.id); qc.invalidateQueries({ queryKey: ["requests"] }); qc.invalidateQueries({ queryKey: ["stats"] }); },
    onError: (err) => toast.error(`Failed: ${(err as Error).message}`),
  });

  const submit = () => {
    if (!form.clientName.trim() || !form.courseName || !form.country || !form.startDate) { toast.error("Please fill in your name, course, country, and start date"); return; }
    mutation.mutate(form);
  };
  const handleClose = () => { setForm(initialState); setCreatedId(null); onOpenChange(false); };
  const waMessage = `Hello ${settings.brandName || "STC Training Hub"} team,\n\nI just submitted a training request through your website:\n\n• Name: ${form.clientName}\n• Course: ${form.courseName}\n• Country: ${form.country} ${flagForCountry(form.country)}\n• Start date: ${form.startDate}\n• Exam date: ${form.examDate || "TBD"}\n• Candidates: ${form.qtyCandidates}\n• My WhatsApp: ${form.contactPhone || "—"}${form.notes ? `\n\nNotes: ${form.notes}` : ""}\n\nPlease share the quotation and availability. Thank you!`;
  const waHref = whatsappLink(settings.whatsappNumber || "", waMessage);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        {!createdId ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white"><Sparkles className="h-5 w-5" /></div>
                Submit a training request
              </DialogTitle>
              <DialogDescription>Tell us what course you need and where — we&apos;ll get back to you on WhatsApp within 24 hours.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label className="text-xs font-medium text-slate-600">Your name / company <span className="text-rose-500">*</span></Label><Input className="mt-1.5" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="e.g., John Doe / Acme Drilling Co." /></div>
              <div><Label className="text-xs font-medium text-slate-600">Course <span className="text-rose-500">*</span></Label><Select value={form.courseName} onValueChange={(v) => set("courseName", v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{courses.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}{c.duration ? ` · ${c.duration}` : ""}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs font-medium text-slate-600">Country <span className="text-rose-500">*</span></Label><Select value={form.country} onValueChange={(v) => set("country", v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select your country" /></SelectTrigger><SelectContent>{countries.map((c) => <SelectItem key={c.id} value={c.name}>{c.flag} {c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs font-medium text-slate-600">Preferred start date <span className="text-rose-500">*</span></Label><Input type="date" className="mt-1.5" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
              <div><Label className="text-xs font-medium text-slate-600">Preferred exam date (optional)</Label><Input type="date" className="mt-1.5" value={form.examDate} onChange={(e) => set("examDate", e.target.value)} /></div>
              <div><Label className="text-xs font-medium text-slate-600">Number of candidates</Label><Input type="number" min={1} className="mt-1.5" value={form.qtyCandidates} onChange={(e) => set("qtyCandidates", e.target.value)} /></div>
              <div><Label className="text-xs font-medium text-slate-600">Your WhatsApp number <span className="text-rose-500">*</span></Label><Input className="mt-1.5" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="e.g., +62 812-xxxx-xxxx" /></div>
              <div className="sm:col-span-2"><Label className="text-xs font-medium text-slate-600">Notes (optional)</Label><Textarea rows={3} className="mt-1.5" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any specific requirements, payment method, etc." /></div>
            </div>
            <DialogFooter className="mt-2 gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={submit} disabled={mutation.isPending} className="bg-blue-700 hover:bg-blue-800">{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}{mutation.isPending ? "Submitting…" : "Submit request"}</Button>
            </DialogFooter>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="py-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><svg className="h-9 w-9 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Request submitted!</h2>
              <p className="mt-2 max-w-md text-sm text-slate-600">Thank you, <strong>{form.clientName}</strong>. We&apos;ve received your request for <strong>{form.courseName}</strong> in <strong>{form.country}</strong>. Our team will contact you on WhatsApp within 24 hours.</p>
              <div className="mt-6 flex w-full max-w-md flex-col gap-2">
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"><MessageCircle className="h-4 w-4" />Also ping us on WhatsApp</a>
                <Button variant="outline" onClick={handleClose} className="w-full">Done</Button>
              </div>
              <p className="mt-4 text-[11px] text-slate-400">Request ID: {createdId.slice(-8).toUpperCase()}</p>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
