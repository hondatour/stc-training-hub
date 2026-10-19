"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Loader2, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/types/training-hub";

export function SettingsPanel({ initial }: { initial: Settings }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Settings>(initial);
  useEffect(() => { setForm(initial); }, [initial]);
  const save = useMutation({
    mutationFn: async (s: Settings) => { const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e) => toast.error(`Failed: ${(e as Error).message}`),
  });
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4"><h3 className="text-base font-semibold text-slate-900">Platform settings</h3><p className="mt-0.5 text-xs text-slate-500">Configure brand, WhatsApp number, intro text, and admin password.</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Brand name"><Input value={form.brandName || ""} onChange={(e) => set("brandName", e.target.value)} placeholder="STC Training Hub" /></Field>
        <Field label="Tagline"><Input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} placeholder="IADC Training Requests" /></Field>
        <Field label="WhatsApp number (international format)">
          <div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={form.whatsappNumber || ""} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="e.g., +62 812-xxxx-xxxx" className="pl-9" /></div>
          <p className="mt-1 text-[11px] text-slate-500">This is the number clients reach when they click <strong>Book on WhatsApp</strong>.</p>
        </Field>
        <Field label="Contact email"><Input value={form.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} placeholder="training@your-domain.com" /></Field>
        <div className="sm:col-span-2"><Field label="Home intro text"><Textarea rows={3} value={form.homeIntro || ""} onChange={(e) => set("homeIntro", e.target.value)} placeholder="Briefly explain what your platform offers to clients." /></Field></div>
        <div className="sm:col-span-2">
          <Field label="Admin console password">
            <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="text" value={form.adminPassword || ""} onChange={(e) => set("adminPassword", e.target.value)} placeholder="Set admin password" className="pl-9" /></div>
            <p className="mt-1 text-[11px] text-slate-500">Current password: <code className="rounded bg-slate-100 px-1 py-0.5">Adminstc2026</code> — change it here to update.</p>
          </Field>
        </div>
      </div>
      <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
        <Button onClick={() => save.mutate(form)} disabled={save.isPending} className="bg-blue-700 hover:bg-blue-800">{save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save settings</Button>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><Label className="text-xs font-medium text-slate-600">{label}</Label>{children}</div>;
}
