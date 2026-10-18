import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { execSync } from "child_process";

// POST /api/seed
// Non-destructive: only creates rows that don't exist. Auto-runs on first page load.
// Also ensures the database schema exists (runs `prisma db push` if needed).
export async function POST() {
  try {
    // First, ensure the database schema exists.
    // Try a simple query — if it fails with "no such table", push the schema.
    try {
      await db.setting.count();
    } catch (schemaErr) {
      console.log("Schema not initialized, pushing schema...");
      try {
        // Run prisma db push to create all tables
        execSync("bun run prisma db push --accept-data-loss", {
          stdio: "inherit",
          env: process.env,
          cwd: process.cwd(),
        });
        console.log("Schema pushed successfully");
      } catch (pushErr) {
        console.error("Schema push failed:", pushErr);
        // Try alternative: use npx prisma
        try {
          execSync("npx prisma db push --accept-data-loss", {
            stdio: "inherit",
            env: process.env,
            cwd: process.cwd(),
          });
          console.log("Schema pushed via npx");
        } catch (e2) {
          console.error("Both schema push attempts failed");
          return NextResponse.json(
            { error: "Schema initialization failed", details: String(e2) },
            { status: 500 }
          );
        }
      }
    }

    // 1. Settings — STC Training Hub brand + WhatsApp + email + admin password
    const defaultSettings: Record<string, string> = {
      brandName: "STC Training Hub",
      tagline: "IADC Training Requests",
      whatsappNumber: "+6281298606842",
      contactEmail: "training.manager@stc-eg.com",
      homeIntro: "Browse upcoming IADC-certified courses across all our country branches. Spot the course you need, then book in seconds via WhatsApp \u2014 we'll consolidate bookings across countries to lower your instructor and exam fees.",
      adminPassword: "Adminstc2026",
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      const exists = await db.setting.findUnique({ where: { key } });
      if (!exists) await db.setting.create({ data: { key, value } });
    }

    // 2. Courses — 10 IADC courses
    const courses = [
      { name: "Drilling - Combined Driller Level", category: "Drilling", description: "Combined driller-level well control course." },
      { name: "Drilling - Combined Supervisor Level", category: "Drilling", description: "Combined supervisor-level well control course." },
      { name: "Drilling - Driller Level", category: "Drilling", description: "Driller-level well control certification." },
      { name: "Drilling - Introductory Level", category: "Drilling", description: "Introductory well control for drilling operations." },
      { name: "Drilling - Supervisor Level", category: "Drilling", description: "Supervisor-level well control certification." },
      { name: "Drilling - WO Supplement", category: "Drilling", description: "Workover supplement for drilling well control." },
      { name: "Well-Services - Coil Tubing", category: "Well Services", description: "Coil tubing well intervention well control." },
      { name: "Well-Services - OGOR", category: "Well Services", description: "OGOR well services well control." },
      { name: "Well-Services - Snubbing", category: "Well Services", description: "Snubbing operations well control." },
      { name: "Well-Services - Wireline", category: "Well Services", description: "Wireline well intervention well control." },
    ];
    for (const c of courses) {
      const exists = await db.course.findUnique({ where: { name: c.name } });
      if (!exists) await db.course.create({ data: c });
    }

    // 3. Countries — all 197 world countries
    const allCountries = [
      ["Afghanistan","AF"],["Albania","AL"],["Algeria","DZ"],["Andorra","AD"],["Angola","AO"],["Argentina","AR"],["Armenia","AM"],["Australia","AU"],["Austria","AT"],["Azerbaijan","AZ"],["Bahamas","BS"],["Bahrain","BH"],["Bangladesh","BD"],["Barbados","BB"],["Belarus","BY"],["Belgium","BE"],["Belize","BZ"],["Benin","BJ"],["Bhutan","BT"],["Bolivia","BO"],["Bosnia and Herzegovina","BA"],["Botswana","BW"],["Brazil","BR"],["Brunei","BN"],["Bulgaria","BG"],["Burkina Faso","BF"],["Burundi","BI"],["Cabo Verde","CV"],["Cambodia","KH"],["Cameroon","CM"],["Canada","CA"],["Central African Republic","CF"],["Chad","TD"],["Chile","CL"],["China","CN"],["Colombia","CO"],["Comoros","KM"],["Congo","CG"],["Costa Rica","CR"],["Croatia","HR"],["Cuba","CU"],["Cyprus","CY"],["Czech Republic","CZ"],["Denmark","DK"],["Djibouti","DJ"],["Dominica","DM"],["Dominican Republic","DO"],["Ecuador","EC"],["Egypt","EG"],["El Salvador","SV"],["Equatorial Guinea","GQ"],["Eritrea","ER"],["Estonia","EE"],["Eswatini","SZ"],["Ethiopia","ET"],["Fiji","FJ"],["Finland","FI"],["France","FR"],["Gabon","GA"],["Gambia","GM"],["Georgia","GE"],["Germany","DE"],["Ghana","GH"],["Greece","GR"],["Grenada","GD"],["Guatemala","GT"],["Guinea","GN"],["Guinea-Bissau","GW"],["Guyana","GY"],["Haiti","HT"],["Honduras","HN"],["Hong Kong","HK"],["Hungary","HU"],["Iceland","IS"],["India","IN"],["Indonesia","ID"],["Iran","IR"],["Iraq","IQ"],["Ireland","IE"],["Israel","IL"],["Italy","IT"],["Ivory Coast","CI"],["Jamaica","JM"],["Japan","JP"],["Jordan","JO"],["Kazakhstan","KZ"],["Kenya","KE"],["Kiribati","KI"],["Korea, North","KP"],["Korea, South","KR"],["Kosovo","XK"],["Kuwait","KW"],["Kyrgyzstan","KG"],["Laos","LA"],["Latvia","LV"],["Lebanon","LB"],["Lesotho","LS"],["Liberia","LR"],["Libya","LY"],["Liechtenstein","LI"],["Lithuania","LT"],["Luxembourg","LU"],["Macau","MO"],["Madagascar","MG"],["Malawi","MW"],["Malaysia","MY"],["Maldives","MV"],["Mali","ML"],["Malta","MT"],["Marshall Islands","MH"],["Mauritania","MR"],["Mauritius","MU"],["Mexico","MX"],["Micronesia","FM"],["Moldova","MD"],["Monaco","MC"],["Mongolia","MN"],["Montenegro","ME"],["Morocco","MA"],["Mozambique","MZ"],["Myanmar","MM"],["Namibia","NA"],["Nauru","NR"],["Nepal","NP"],["Netherlands","NL"],["New Zealand","NZ"],["Nicaragua","NI"],["Niger","NE"],["Nigeria","NG"],["North Macedonia","MK"],["Norway","NO"],["Oman","OM"],["Pakistan","PK"],["Palau","PW"],["Palestine","PS"],["Panama","PA"],["Papua New Guinea","PG"],["Paraguay","PY"],["Peru","PE"],["Philippines","PH"],["Poland","PL"],["Portugal","PT"],["Qatar","QA"],["Romania","RO"],["Russia","RU"],["Rwanda","RW"],["Saint Kitts and Nevis","KN"],["Saint Lucia","LC"],["Saint Vincent and the Grenadines","VC"],["Samoa","WS"],["San Marino","SM"],["Sao Tome and Principe","ST"],["Saudi Arabia","SA"],["Senegal","SN"],["Serbia","RS"],["Seychelles","SC"],["Sierra Leone","SL"],["Singapore","SG"],["Slovakia","SK"],["Slovenia","SI"],["Solomon Islands","SB"],["Somalia","SO"],["South Africa","ZA"],["South Sudan","SS"],["Spain","ES"],["Sri Lanka","LK"],["Sudan","SD"],["Suriname","SR"],["Sweden","SE"],["Switzerland","CH"],["Syria","SY"],["Taiwan","TW"],["Tajikistan","TJ"],["Tanzania","TZ"],["Thailand","TH"],["Timor-Leste","TL"],["Togo","TG"],["Tonga","TO"],["Trinidad and Tobago","TT"],["Tunisia","TN"],["Turkey","TR"],["Turkmenistan","TM"],["Tuvalu","TV"],["Uganda","UG"],["Ukraine","UA"],["United Arab Emirates","AE"],["United Kingdom","GB"],["United States","US"],["Uruguay","UY"],["Uzbekistan","UZ"],["Vanuatu","VU"],["Vatican City","VA"],["Venezuela","VE"],["Vietnam","VN"],["Yemen","YE"],["Zambia","ZM"],["Zimbabwe","ZW"],
    ];
    const flagFromCode = (code: string) => {
      const A = 0x1f1e6;
      return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
    };
    for (const [name, code] of allCountries) {
      const exists = await db.country.findUnique({ where: { code } });
      if (!exists) await db.country.create({ data: { name, code, flag: flagFromCode(code) } });
    }

    // 4. Sample requests — only if no requests exist
    const existing = await db.request.count();
    if (existing === 0) {
      const seed = [
        { clientName:"Personnel", courseName:"Well-Services - OGOR", country:"Indonesia", startDate:"2026-09-30", examDate:"2026-10-04", qtyCandidates:3, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Exam using our link", status:"" },
        { clientName:"Personnel", courseName:"Well-Services - OGOR", country:"Indonesia", startDate:"2026-09-30", examDate:"2026-10-04", qtyCandidates:1, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Exam using our link", status:"Sent Quotation" },
        { clientName:"Mr. Lukman / Baker Hughes", courseName:"Well-Services - Coil Tubing", country:"Indonesia", startDate:"2026-10-15", examDate:"2026-10-22", qtyCandidates:5, instructorName:"Egypt Instructor", instructorAssigned:"Egypt", courseType:"Live", examDayType:"Live", certificateType:"Live", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Payment using company credit card. Commission due to Mr. Lukman.", status:"Send Quotation" },
        { clientName:"Asrindo Citraseni", courseName:"Drilling - WO Supplement", country:"Indonesia", startDate:"2026-10-12", examDate:"2026-10-16", qtyCandidates:1, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Training and exam will be Live. Guarantee Pass.", status:"" },
        { clientName:"Asrindo Citraseni", courseName:"Drilling - WO Supplement", country:"Indonesia", startDate:"2026-10-12", examDate:"2026-10-16", qtyCandidates:1, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Classroom", certificateType:"Classroom", issueCertDueDate:"Same day as exam", bookingConfirmed:"Confirmed", notes:"Ilham and Fitri will attend on exam day.", status:"Done" },
        { clientName:"Personnel", courseName:"Well-Services - OGOR", country:"Indonesia", startDate:"2026-10-26", examDate:"2026-10-30", qtyCandidates:2, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Fitri will attend on exam day.", status:"" },
        { clientName:"Nesitor", courseName:"Well-Services - Wireline", country:"Indonesia", startDate:"2026-10-04", examDate:"2026-10-07", qtyCandidates:2, instructorName:"Hardy", instructorAssigned:"Egypt Team", courseType:"Live", examDayType:"Live", certificateType:"Live", issueCertDueDate:"One week after exam", bookingConfirmed:"Confirmed", notes:"Using our link.", status:"" },
        { clientName:"PETRONAS Contractor Pool", courseName:"Well-Services - OGOR", country:"Malaysia", startDate:"2026-10-01", examDate:"2026-10-05", qtyCandidates:4, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Pending", notes:"Awaiting PO from procurement.", status:"Sent Quotation" },
        { clientName:"ADNOC Drilling", courseName:"Well-Services - OGOR", country:"United Arab Emirates", startDate:"2026-10-03", examDate:"2026-10-07", qtyCandidates:6, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Pending", notes:"Group of 6, requesting discount for batch.", status:"Sent Quotation" },
        { clientName:"Saudi Aramco Contractor", courseName:"Drilling - WO Supplement", country:"Saudi Arabia", startDate:"2026-10-13", examDate:"2026-10-17", qtyCandidates:3, instructorName:"Egypt Instructor", instructorAssigned:"Egypt Team", courseType:"Classroom", examDayType:"Live", certificateType:"Classroom", issueCertDueDate:"One week after exam", bookingConfirmed:"Pending", notes:"Needs visa support letter.", status:"" },
      ];
      for (const r of seed) await db.request.create({ data: r });
    }

    return NextResponse.json({ ok: true, message: "Seed complete" });
  } catch (e) {
    console.error("POST /api/seed error:", e);
    return NextResponse.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
