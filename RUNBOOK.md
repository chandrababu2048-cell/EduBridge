# 📖 EduBridge Runbook

## How to Keep EduBridge Running

This document is for anyone maintaining EduBridge after handoff.
It is written so a non-technical person can follow it. You do not need to know how to code.

EduBridge runs entirely on **one Vercel project** — the website and the AI behind it
are hosted together. There is no separate server to manage.

> Replace `<your-app>` below with your real Vercel address, e.g. `edubridge-tutor.vercel.app`.

---

## 🟢 Is EduBridge Working?

1. **Check the health page:** `https://<your-app>.vercel.app/api/health`
   - If you see `{"status":"healthy", ...}` → everything is fine ✅
2. **Open the app:** `https://<your-app>.vercel.app` and ask one question to confirm it answers.

---

## 🔑 The One Thing That Must Never Expire

EduBridge needs an **Anthropic API key** to work. This is what lets it talk to Claude.

- **Where it lives:** vercel.com → your EduBridge project → **Settings → Environment Variables → `ANTHROPIC_API_KEY`**

**To update the key:**
1. Go to **console.anthropic.com** and sign in.
2. Create a new API key and copy it.
3. Go to **vercel.com** → your EduBridge project → **Settings → Environment Variables**.
4. Edit `ANTHROPIC_API_KEY` and paste the new value. Save.
5. Go to the **Deployments** tab → open the latest deployment → **⋯ → Redeploy** so the new key takes effect.

> 💡 Keep an eye on the billing balance at console.anthropic.com so the key never runs out of credit.

---

## 📊 Check How Many Kids Are Using It

Two ways:

1. **In the app:** open it, scroll to the bottom of the welcome screen, and tap
   **"📊 For teachers: view usage stats."**
2. **Direct link:** `https://<your-app>.vercel.app/api/analytics/stats`

> ⚠️ On the free Vercel setup these numbers are **approximate and may reset**, because the
> free plan has no database. The dashboard still works for a rough sense of activity. For
> exact long-term tracking, a developer can add **Vercel KV** (a free key-value store) later.

---

## 🚨 Common Problems & Fixes

### Problem: Kids see "Oops! Something went wrong"
**Likely cause:** the API key is invalid or out of credit.
**Fix:** check the key and balance at console.anthropic.com, then update the key on Vercel (see above).

### Problem: "Too many questions! Please wait a minute"
**This is normal.** EduBridge limits very rapid repeat questions to keep costs safe.
The child just needs to wait about a minute, then continue.

### Problem: The app won't load at all
**Fix:** check Vercel's status at **vercel.com/status**. If Vercel is up, go to your project's
**Deployments** tab and **Redeploy** the latest one.

### Problem: The "Listen" button or microphone doesn't appear
**This depends on the child's browser/device, not the server.** Read-aloud and voice input use
built-in browser features and work best in Chrome and on most phones. If they're missing, the
buttons simply won't show — the app still works by typing.

---

## 🧪 Testing the Answer Quality (Optional, for a technical helper)

There's a built-in check that asks Claude a few sample questions and confirms the answers are
simple and age-appropriate. From the `backend` folder, run:

```
npm run eval
```

It prints ✅ PASS / ❌ FAIL for each test and an overall score. Use this after changing the
tutor's instructions (in `backend/prompts/systemPrompts.js` **and** `frontend/api/_lib/systemPrompts.js`)
to make sure answers are still kid-friendly.

> Note: the tutor's instructions exist in two places — `backend/` (for local testing) and
> `frontend/api/_lib/` (what the live site uses). Keep them the same.

---

## 💰 Monthly Costs

| Service | Cost |
|---------|------|
| Vercel (website + API) | FREE |
| Anthropic API | ~$5–10/month depending on usage |

---

## 📞 Who Built This

Built by **Chandrababu Anakapalli**
GitHub: github.com/chandrababu2048-cell/EduBridge
Email: chandrababunaidu2048@gmail.com

---

## 🌱 How to Add New Features

1. Go to **github.com/chandrababu2048-cell/EduBridge**
2. Click **Issues** → **New Issue**
3. Describe what you need in plain language.
4. A developer can pick it up from there.
