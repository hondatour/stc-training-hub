export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function whatsappLink(phone: string, message: string): string {
  const cleaned = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

// STC theme: Red (primary) + Blue (secondary) — matches the logo
export function courseTypeColor(t: string): string {
  switch ((t || "").toLowerCase()) {
    case "classroom":
      return "bg-blue-100 text-blue-800 border-blue-200"; // Blue for classroom
    case "live":
      return "bg-red-100 text-red-800 border-red-200"; // Red for live
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function bookingColor(s: string): string {
  switch ((s || "").toLowerCase()) {
    case "confirmed":
      return "bg-blue-600 text-white border-blue-700"; // Blue
    case "pending":
      return "bg-amber-500 text-white border-amber-600";
    case "cancelled":
      return "bg-red-600 text-white border-red-700"; // Red
    default:
      return "bg-slate-200 text-slate-700 border-slate-300";
  }
}

export function flagForCountry(name: string, code?: string): string {
  if (code && code.length === 2) {
    const cc = code.toUpperCase();
    const A = 0x1f1e6;
    return String.fromCodePoint(A + (cc.charCodeAt(0) - 65), A + (cc.charCodeAt(1) - 65));
  }
  const map: Record<string, string> = {
    Indonesia: "🇮🇩", Egypt: "🇪🇬", Malaysia: "🇲🇾", "Saudi Arabia": "🇸🇦",
    "United Arab Emirates": "🇦🇪", Qatar: "🇶🇦", Iraq: "🇮🇶", Oman: "🇴🇲",
  };
  return map[name] || "🌍";
}
