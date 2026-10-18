# Deploy STC Training Hub — Railway (5 minutes)

**Cost:** ~$2-5/month (Hobby plan) · **Setup time:** 5 minutes

---

## What you get

- Live website at `https://stc-training-hub.up.railway.app`
- STC Training Hub branding (red & blue theme matching the STC logo)
- WhatsApp booking: `+6281298606842` (change in Settings tab)
- Email: `training.manager@stc-eg.com` (change in Settings tab)
- 10 IADC courses (Drilling + Well-Services)
- 197 countries
- 10 sample requests
- Client "Submit a Request" form
- Admin Console (password protected — `Adminstc2026`)
- Smart batching for cost savings

---

## Step 1 — Push the code to GitHub

1. Download `stc-training-hub.zip` and unzip it on your computer.
2. Create a new GitHub repo (or use your existing one): `stc-training-hub`
3. **Replace ALL files** in the repo with the new files from the zip.
   - If using GitHub Desktop: delete the old files in your local clone, then copy the new ones in, then commit & push.
4. Make sure all these files are in the repo root:
   - `nixpacks.toml`
   - `package.json`
   - `prisma/schema.prisma`
   - `src/` folder
   - `public/stc-logo.png`
   - `next.config.ts`

---

## Step 2 — Create the Railway project

1. Go to [railway.app](https://railway.app) → **Login with GitHub**
2. Click **+ New Project** (top-right)
3. Pick **Deploy from GitHub repo**
4. Find `stc-training-hub` → click **Deploy**
5. Railway starts building (2-3 min)

---

## Step 3 — Add a persistent volume (for the SQLite database)

1. Click your new project → click the `stc-training-hub` service inside it
2. Click the **Settings** tab → scroll to **Volumes** section
3. Click **+ Add Volume**
4. Mount path: `/data`
5. Click **Add**

---

## Step 4 — Set the DATABASE_URL environment variable

1. Same service → **Variables** tab
2. Click **+ New Variable**
3. Key: `DATABASE_URL`
4. Value: `file:/data/custom.db`
5. Click **Add**

Railway auto-redeploys. Wait 2 min for the redeploy to finish.

---

## Step 5 — Generate a public URL

1. Same service → **Settings** → **Networking**
2. Click **Generate Domain**
3. Railway gives you a URL like `stc-training-hub.up.railway.app`

---

## Step 6 — Visit your site 🎉

1. Open your Railway URL
2. The site auto-seeds on first visit (loads STC brand, WhatsApp, 10 courses, 197 countries, 10 sample requests)
3. You should see 8 course cards in the catalog
4. Click **Admin Console** (top-right)
5. Password: **`Adminstc2026`** → click Unlock
6. Use the **Settings** tab to change WhatsApp number, brand, email, or admin password

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Page loads but shows "0 courses live" | Wait 30 sec for first seed to run, then refresh. Or open terminal and run: `curl -X POST https://YOUR-URL.up.railway.app/api/seed` |
| 500 error on API routes | Make sure you added the volume at `/data` AND set `DATABASE_URL=file:/data/custom.db`. Without the volume, the database file gets wiped on every restart. |
| Build fails on Railway | Check Railway build logs (Build tab). Most common cause: GitHub repo doesn't have all the files. Make sure `nixpacks.toml`, `prisma/`, and `src/` are all committed. |
| Admin Console won't unlock | Make sure you're typing `Adminstc2026` exactly (case-sensitive). If you forgot it, the seed auto-creates this password on first run. |
| Can't find "Add Volume" button | Railway UI changes sometimes. Look for a **+** button anywhere on your service page, or check the **Settings** tab → **Volumes** section. |

---

## Cost breakdown

| Service | Cost |
|---|---|
| **GitHub** | Free (public) or $0 (private, free for individuals) |
| **Railway Hobby** | $5/month, includes 500 hours + $5 usage credit. For your scale: **~$2-5/month actual usage** |
| **Domain (optional)** | ~$10/year if you want a custom domain like `stc-training.com` |

For your scale (one admin, a few dozen clients), this is **very affordable**.

---

## How the auto-seed works

When the page loads for the first time, the React app calls `POST /api/seed` once. The seed endpoint:

1. Loads your STC Training Hub brand settings
2. Creates the admin password (`Adminstc2026`)
3. Inserts 10 IADC courses
4. Inserts 197 countries with flags
5. Inserts 10 sample requests

The seed is **non-destructive** — it only creates rows that don't already exist. So if you make changes via the admin UI, those changes are never overwritten.

---

## Security note

The admin password protection is a lightweight gate — it prevents casual clients from clicking into your admin area, but it's not bank-grade security. For real cryptographic auth, you'd need NextAuth.js. For your scale (one admin, a few dozen clients), this is sufficient — but don't put highly sensitive data in the admin area.

To change the admin password: log in → Settings tab → "Admin console password" field → type new password → Save.
