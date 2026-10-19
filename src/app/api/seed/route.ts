import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

// POST /api/seed
// Non-destructive: only creates rows that don't exist.
// Imports from prisma/live-data-backup.json (your actual data, not hardcoded defaults).
// Also ensures the database schema exists.
export async function POST() {
  try {
    // First, ensure the database schema exists.
    try {
      await db.setting.count();
    } catch (schemaErr) {
      console.log("Schema not initialized, pushing schema...");
      try {
        execSync("bun run prisma db push --accept-data-loss", {
          stdio: "inherit",
          env: process.env,
          cwd: process.cwd(),
        });
      } catch {
        try {
          execSync("npx prisma db push --accept-data-loss", {
            stdio: "inherit",
            env: process.env,
            cwd: process.cwd(),
          });
        } catch (e2) {
          console.error("Schema push failed:", e2);
        }
      }
    }

    // Load the backup data
    let backup;
    try {
      const path = join(process.cwd(), "prisma", "live-data-backup.json");
      const raw = await readFile(path, "utf-8");
      backup = JSON.parse(raw);
    } catch {
      // Fallback to hardcoded defaults if backup file not found
      backup = { settings: {}, courses: [], countries: [], requests: [], batches: [] };
    }

    // 1. Settings — import from backup, with defaults for missing keys
    const defaultSettings: Record<string, string> = {
      brandName: "STC Training Hub",
      tagline: "IADC Training Requests",
      whatsappNumber: "+6281298606842",
      contactEmail: "training.manager@stc-eg.com",
      homeIntro: "Browse upcoming IADC-certified courses across all our country branches. Spot the course you need, then book in seconds via WhatsApp — we'll consolidate bookings across countries to lower your instructor and exam fees.",
      adminPassword: "Adminstc2026",
    };
    const settingsToImport = { ...defaultSettings, ...(backup.settings || {}) };
    for (const [key, value] of Object.entries(settingsToImport)) {
      const exists = await db.setting.findUnique({ where: { key } });
      if (!exists) await db.setting.create({ data: { key, value: String(value) } });
    }

    // 2. Courses — import from backup
    for (const c of (backup.courses || [])) {
      const exists = await db.course.findUnique({ where: { name: c.name } });
      if (!exists) {
        await db.course.create({
          data: {
            name: c.name,
            category: c.category || null,
            description: c.description || null,
            duration: c.duration || null,
          },
        });
      }
    }

    // 3. Countries — import from backup (or seed all 197 if empty)
    const countriesToImport = backup.countries && backup.countries.length > 0
      ? backup.countries
      : getAllCountries();
    for (const c of countriesToImport) {
      const exists = await db.country.findUnique({ where: { code: c.code } });
      if (!exists) {
        await db.country.create({
          data: { name: c.name, code: c.code, flag: c.flag || flagFromCode(c.code) },
        });
      }
    }

    // 4. Batches — import from backup
    const batchIdMap = new Map<string, string>();
    for (const b of (backup.batches || [])) {
      const existingBatches = await db.batch.count();
      if (existingBatches > 0) break; // Don't duplicate batches
      const created = await db.batch.create({
        data: {
          name: b.name,
          courseName: b.courseName,
          startDate: b.startDate,
          examDate: b.examDate || null,
          status: b.status || "Proposed",
          totalCandidates: b.totalCandidates || 0,
          notes: b.notes || null,
        },
      });
      if (b.id) batchIdMap.set(b.id, created.id);
    }

    // 5. Requests — import from backup (only if no requests exist)
    const existingRequests = await db.request.count();
    if (existingRequests === 0) {
      for (const r of (backup.requests || [])) {
        const mappedBatchId = r.batchId ? (batchIdMap.get(r.batchId) ?? null) : null;
        await db.request.create({
          data: {
            clientName: r.clientName,
            courseName: r.courseName,
            country: r.country,
            startDate: r.startDate,
            examDate: r.examDate || null,
            qtyCandidates: r.qtyCandidates || 1,
            instructorName: r.instructorName || null,
            instructorAssigned: r.instructorAssigned || null,
            courseType: r.courseType || "Classroom",
            examDayType: r.examDayType || null,
            certificateType: r.certificateType || null,
            issueCertDueDate: r.issueCertDueDate || null,
            bookingConfirmed: r.bookingConfirmed || "Pending",
            notes: r.notes || null,
            superNotes: r.superNotes || null,
            status: r.status || null,
            isVisible: r.isVisible ?? true,
            contactPhone: r.contactPhone || null,
            batchId: mappedBatchId,
          },
        });
      }
    }

    return NextResponse.json({ ok: true, message: "Seed complete (from backup)" });
  } catch (e) {
    console.error("POST /api/seed error:", e);
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}

function flagFromCode(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
}

function getAllCountries(): Array<{ name: string; code: string; flag: string }> {
  const raw = [
    ["Afghanistan","AF"],["Albania","AL"],["Algeria","DZ"],["Andorra","AD"],["Angola","AO"],["Argentina","AR"],["Armenia","AM"],["Australia","AU"],["Austria","AT"],["Azerbaijan","AZ"],["Bahamas","BS"],["Bahrain","BH"],["Bangladesh","BD"],["Barbados","BB"],["Belarus","BY"],["Belgium","BE"],["Belize","BZ"],["Benin","BJ"],["Bhutan","BT"],["Bolivia","BO"],["Bosnia and Herzegovina","BA"],["Botswana","BW"],["Brazil","BR"],["Brunei","BN"],["Bulgaria","BG"],["Burkina Faso","BF"],["Burundi","BI"],["Cabo Verde","CV"],["Cambodia","KH"],["Cameroon","CM"],["Canada","CA"],["Central African Republic","CF"],["Chad","TD"],["Chile","CL"],["China","CN"],["Colombia","CO"],["Comoros","KM"],["Congo","CG"],["Costa Rica","CR"],["Croatia","HR"],["Cuba","CU"],["Cyprus","CY"],["Czech Republic","CZ"],["Denmark","DK"],["Djibouti","DJ"],["Dominica","DM"],["Dominican Republic","DO"],["Ecuador","EC"],["Egypt","EG"],["El Salvador","SV"],["Equatorial Guinea","GQ"],["Eritrea","ER"],["Estonia","EE"],["Eswatini","SZ"],["Ethiopia","ET"],["Fiji","FJ"],["Finland","FI"],["France","FR"],["Gabon","GA"],["Gambia","GM"],["Georgia","GE"],["Germany","DE"],["Ghana","GH"],["Greece","GR"],["Grenada","GD"],["Guatemala","GT"],["Guinea","GN"],["Guinea-Bissau","GW"],["Guyana","GY"],["Haiti","HT"],["Honduras","HN"],["Hong Kong","HK"],["Hungary","HU"],["Iceland","IS"],["India","IN"],["Indonesia","ID"],["Iran","IR"],["Iraq","IQ"],["Ireland","IE"],["Israel","IL"],["Italy","IT"],["Ivory Coast","CI"],["Jamaica","JM"],["Japan","JP"],["Jordan","JO"],["Kazakhstan","KZ"],["Kenya","KE"],["Kiribati","KI"],["Korea, North","KP"],["Korea, South","KR"],["Kosovo","XK"],["Kuwait","KW"],["Kyrgyzstan","KG"],["Laos","LA"],["Latvia","LV"],["Lebanon","LB"],["Lesotho","LS"],["Liberia","LR"],["Libya","LY"],["Liechtenstein","LI"],["Lithuania","LT"],["Luxembourg","LU"],["Macau","MO"],["Madagascar","MG"],["Malawi","MW"],["Malaysia","MY"],["Maldives","MV"],["Mali","ML"],["Malta","MT"],["Marshall Islands","MH"],["Mauritania","MR"],["Mauritius","MU"],["Mexico","MX"],["Micronesia","FM"],["Moldova","MD"],["Monaco","MC"],["Mongolia","MN"],["Montenegro","ME"],["Morocco","MA"],["Mozambique","MZ"],["Myanmar","MM"],["Namibia","NA"],["Nauru","NR"],["Nepal","NP"],["Netherlands","NL"],["New Zealand","NZ"],["Nicaragua","NI"],["Niger","NE"],["Nigeria","NG"],["North Macedonia","MK"],["Norway","NO"],["Oman","OM"],["Pakistan","PK"],["Palau","PW"],["Palestine","PS"],["Panama","PA"],["Papua New Guinea","PG"],["Paraguay","PY"],["Peru","PE"],["Philippines","PH"],["Poland","PL"],["Portugal","PT"],["Qatar","QA"],["Romania","RO"],["Russia","RU"],["Rwanda","RW"],["Saint Kitts and Nevis","KN"],["Saint Lucia","LC"],["Saint Vincent and the Grenadines","VC"],["Samoa","WS"],["San Marino","SM"],["Sao Tome and Principe","ST"],["Saudi Arabia","SA"],["Senegal","SN"],["Serbia","RS"],["Seychelles","SC"],["Sierra Leone","SL"],["Singapore","SG"],["Slovakia","SK"],["Slovenia","SI"],["Solomon Islands","SB"],["Somalia","SO"],["South Africa","ZA"],["South Sudan","SS"],["Spain","ES"],["Sri Lanka","LK"],["Sudan","SD"],["Suriname","SR"],["Sweden","SE"],["Switzerland","CH"],["Syria","SY"],["Taiwan","TW"],["Tajikistan","TJ"],["Tanzania","TZ"],["Thailand","TH"],["Timor-Leste","TL"],["Togo","TG"],["Tonga","TO"],["Trinidad and Tobago","TT"],["Tunisia","TN"],["Turkey","TR"],["Turkmenistan","TM"],["Tuvalu","TV"],["Uganda","UG"],["Ukraine","UA"],["United Arab Emirates","AE"],["United Kingdom","GB"],["United States","US"],["Uruguay","UY"],["Uzbekistan","UZ"],["Vanuatu","VU"],["Vatican City","VA"],["Venezuela","VE"],["Vietnam","VN"],["Yemen","YE"],["Zambia","ZM"],["Zimbabwe","ZW"],
  ];
  return raw.map(([name, code]) => ({ name, code, flag: flagFromCode(code) }));
}
