# 📖 EduBridge Operations Runbook

For anyone maintaining EduBridge who did not write it. Assumes access to the project's **Vercel**, **Supabase**, **Anthropic Console**, and **GitHub** accounts.

## Architecture at a Glance

- **One Vercel project** (root directory `frontend/`) hosts everything users touch: the static React app **and** the API as serverless functions (`frontend/api/`).
- **Supabase** hosts auth, teacher/student data, and the `usage_events` analytics table (your Supabase project → all keys live in Vercel env vars).
- The **Express server** (`backend/`) is local-dev/eval only — nothing in production depends on it. **GitHub Actions** runs 147 tests on every push.

---

## Routine Operations

### Is it up?

1. `https://<your-app>.vercel.app/api/health` → expect `{"status":"healthy", ...}`.
2. Open the app, ask one question, confirm an answer arrives.

### Vercel deploy status & logs

- **Deploys:** vercel.com → your project → **Deployments** tab. Green = live. A failed deploy shows a red ✗ — click it → **Build Logs**.
- **Runtime logs (API errors):** project → **Logs** tab (or open a deployment → **Functions**). Filter by `/api/chat` to see chat failures with stack traces.

### Supabase health

- supabase.com/dashboard → your project → **Home** shows database/API status and usage against free-tier quotas.
- **Auth activity:** **Authentication → Users**. **Data:** **Table Editor**.

### Reading usage analytics

Supabase dashboard → **SQL Editor**:

```sql
select count(*) from usage_events;                          -- total questions answered
select date_trunc('day', created_at) d, count(*)
from usage_events group by 1 order by 1 desc limit 14;      -- last 14 days
select subject, count(*) from usage_events group by 1;      -- by subject
```

No PII exists in this table — only subject/age band/language/grade + timestamp.

---

## 🚨 Incident Playbook

| Symptom | Diagnosis | Fix |
|---|---|---|
| Chat returns 500; Vercel function logs show **"credit balance is too low"** | Anthropic account out of credit | console.anthropic.com → **Billing** → add credits. No redeploy needed — recovers immediately. |
| Chat returns 500 (anything else) | Unknown API error | Vercel → **Logs** → filter `/api/chat`, read the stack trace. Common: invalid/rotated `ANTHROPIC_API_KEY` (rotate — see below), or Anthropic outage (status.anthropic.com). |
| Users report **"Too many questions! Please wait a minute"** | Per-IP rate limit: **20 requests/min**, set in `frontend/api/chat.js` (`MAX_PER_WINDOW`) | Usually working as intended (whole classrooms behind one NAT IP can trip it). To raise: edit `MAX_PER_WINDOW` in `frontend/api/chat.js` **and** `frontend/api/agents/safety-check.js`, commit, push — mind API costs. |
| Sign-in fails / progress not saving | Supabase auth problem | Check `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in Vercel env vars match Supabase → **Settings → API**. Check Supabase dashboard for paused project (free tier pauses after inactivity — click **Restore**) or exceeded quotas. Guest mode keeps working regardless. |
| Landing-page stats stuck at the fallback numbers (12,480+) | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` missing or wrong on Vercel, so `/api/public/stats` can't count `usage_events` | Vercel → **Settings → Environment Variables** → set both (values from Supabase → Settings → API) → **Redeploy**. Note: stats are edge-cached for 1 hour — wait before judging. |
| CI red on `main` | A test or build failure | GitHub → **Actions** tab → click the red run → click the failing job (`frontend`, `backend`, or `e2e`) → expand the red step. The log shows exactly which test failed and why. Fix locally (`npm test` in that folder), push. |
| App won't load at all | Vercel platform or bad deploy | Check vercel.com/status. If Vercel is fine: **Deployments** → previous good deployment → **⋯ → Promote to Production** (instant rollback). |

---

## 🔑 Key Rotation

### Anthropic API key

1. console.anthropic.com → **API Keys** → **Create Key** → copy it.
2. vercel.com → project → **Settings → Environment Variables** → edit `ANTHROPIC_API_KEY` → paste → **Save**.
3. **Deployments** → latest → **⋯ → Redeploy** (env vars only apply on deploy).
4. Verify chat works, then delete the old key in the Anthropic console.

### Supabase keys

1. supabase.com/dashboard → your project → **Settings → API** → **Reset/rotate** the key (anon or service_role). ⚠️ Rotation invalidates the old key immediately.
2. In Vercel env vars update: `VITE_SUPABASE_ANON_KEY` (anon) and/or `SUPABASE_SERVICE_ROLE_KEY` (service role). `VITE_SUPABASE_URL`/`SUPABASE_URL` don't change.
3. Redeploy on Vercel; verify sign-in and `/api/public/stats`.

The service-role key bypasses all row-level security — it must only ever exist in Vercel server-side env vars (no `VITE_` prefix, never in git).

---

## 💰 Cost Controls

- **What costs money:** Claude API tokens. Each question = one Haiku safety check (tiny) + one Sonnet answer capped at 1,024 output tokens — roughly **$0.01–0.02 per question**. Vercel and Supabase free tiers cover everything else at current scale.
- **Built-in limiter:** 20 requests/min per IP on both `/api/chat` and the safety check; messages capped at 2,000 chars; history capped at 10 turns.
- **Hard backstop:** console.anthropic.com → **Settings → Limits** → set a monthly **spend limit**.
- **Recommended:** also set a budget **alert** (e.g. at 50%) in the Anthropic console so you're emailed before the limit halts the tutor.

---

## 🌱 Making Changes

Everything below the UI is shared logic: the canonical modules live in `frontend/api/_lib/` and are re-exported by `shared/` for the backend. Never duplicate — always edit the `_lib` file.

### Add a language
1. `frontend/src/components/ChatBox.jsx` → add to the `LANGUAGES` array (code, label, native name, speech locale).
2. `frontend/api/_lib/validation.js` → add the code to `VALID_LANGUAGES` (otherwise it falls back to English).
3. `frontend/api/_lib/systemPrompts.js` → add a `LANGUAGE_INSTRUCTIONS` entry **written in that language** ("reply only in X").

### Add a subject / learning track
1. `frontend/src/subjectThemes.js` → add to `SUBJECT_THEMES` (category, color, mascot, greeting, example questions).
2. `frontend/api/_lib/validation.js` → add to `VALID_SUBJECTS`.
3. `frontend/api/_lib/systemPrompts.js` → add teaching instructions for the subject.

### Add / edit NCERT grades & chapters
- `frontend/src/data/ncert.js` → `NCERT_CHAPTERS[subject][grade]` is an array of chapter names (position = chapter number). Grades 1–12 are already allowlisted in `validation.js`.

After any change: `cd frontend && npm test`, push, and let CI go green before Vercel deploys.

---

## 💾 Backup & Restore

- Supabase (paid plans) takes **daily automatic backups**: dashboard → **Database → Backups** → restore from there. On the **free tier there are no automatic backups** — periodically export manually: **Database → Backups → Download**, or run `supabase db dump` with the CLI, and keep the file somewhere safe.
- The schema is always reproducible from git: `backend/supabase/migrations/001…003` applied in order to a fresh project.
- Code needs no backup — it's all on GitHub; any commit can be redeployed from the Vercel Deployments tab.

---

## 📞 Contact

Built by **Chandrababu Anakapalli** · github.com/chandrababu2048-cell/EduBridge
For new features: open a GitHub **Issue** describing what you need in plain language.
