"use client";

import { useEffect, useState } from "react";
import { Lock, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STORAGE_KEY = "stc-admin-unlock";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { ts: number; hash: string };
    if (Date.now() - parsed.ts > SESSION_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function lockAdmin() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked());
    setChecked(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { toast.error("Please enter the admin password"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now(), hash: data.hash })); } catch {}
        setUnlocked(true);
        toast.success("Welcome back, admin");
        setPassword("");
      } else {
        toast.error(data.error || "Incorrect password");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!checked) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  }
  if (unlocked) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm"><Lock className="h-6 w-6" /></div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">Admin access required</h2>
          <p className="mt-1 text-sm text-slate-500">This area is for STC staff only. Enter your password to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="pl-9 pr-10" autoFocus />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-700 hover:bg-blue-800">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            {submitting ? "Checking…" : "Unlock"}
          </Button>
        </form>
        <p className="mt-5 text-center text-[11px] text-slate-400">Sessions last 24 hours. To change the password, use the Settings tab.</p>
      </motion.div>
    </div>
  );
}
