# 🚀 EduBridge — Deploy Guide (Today)

Follow these in order. Total time: ~15 minutes. You'll need a **GitHub account**
(you have one), a **Vercel account** (free — sign up with GitHub), and your
**Anthropic API key** from console.anthropic.com.

All the V2 code is already written and saved in this folder. These steps just
push it to GitHub and put it live on Vercel.

---

## STEP 0 — Open a terminal in the project folder

On your Mac, open **Terminal** and go to the project:

```bash
cd ~/EduBridge/EduBridge
```

---

## STEP 1 — Clear the leftover lock file (one time)

A background process left a stale git lock. Remove it (safe — the file is empty):

```bash
rm -f .git/index.lock
```

---

## STEP 2 — Commit everything to git

```bash
git add -A
git commit -m "feat: EduBridge V2 — serverless API, kid interactivity, analytics, docs"
```

You should see a list of files changed. If git asks for your name/email, it's
already set, so this should just work.

---

## STEP 3 — Push to GitHub

```bash
git push origin main
```

- If it asks for a **username**, type your GitHub username.
- If it asks for a **password**, paste a **Personal Access Token** (GitHub no
  longer accepts your account password here). Create one at:
  **github.com → Settings → Developer settings → Personal access tokens →
  Tokens (classic) → Generate new token** with the **`repo`** scope. Copy it and
  paste it as the password.

Confirm it worked: open **github.com/chandrababu2048-cell/EduBridge** and check
that the new files (like `frontend/api/chat.js` and `DEPLOY.md`) are there.

---

## STEP 4 — Deploy on Vercel

1. Go to **vercel.com** and **Log in with GitHub**.
2. Click **Add New… → Project**.
3. Find **EduBridge** in the list and click **Import**.
4. **IMPORTANT — set the Root Directory:**
   - Click **Edit** next to "Root Directory"
   - Choose the **`frontend`** folder
5. **Add your API key** — expand **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** *(paste your key from console.anthropic.com)*
6. Click **Deploy**.

Wait ~1 minute. Vercel gives you a live URL like
`https://edubridge-xxxx.vercel.app`.

---

## STEP 5 — Test it live

1. Open your new Vercel URL.
2. Pick a subject and age, tap **Start Learning**, and ask a question
   (e.g. "What is 5 + 7?"). You should get a friendly answer.
3. Check the API directly: open `https://<your-url>/api/health` — you should
   see `{"status":"healthy",...}`.

If the chat says "Oops! Something went wrong," the API key is usually the cause —
double-check `ANTHROPIC_API_KEY` in **Vercel → Project → Settings → Environment
Variables**, then **Redeploy** (Deployments tab → ⋯ → Redeploy).

---

## STEP 6 — Put your real URL in the docs (optional, 2 min)

Once you know your live URL, replace `<your-app>.vercel.app` in:
- `README.md` (Live Demo section)
- `RUNBOOK.md`
- `NGO_GUIDE.md`

Then commit and push again:

```bash
git add -A
git commit -m "docs: add live URL"
git push origin main
```

---

## 🔁 Making changes later

Every time you push to `main`, Vercel automatically rebuilds and redeploys.
No manual step needed.

---

## ❓ If you get stuck

- **GitHub push rejected / auth fails** → it's almost always the token (Step 3).
- **Vercel build fails** → make sure Root Directory is `frontend` (Step 4.4).
- **App loads but chat fails** → the `ANTHROPIC_API_KEY` env var (Step 4.5).
- For day-to-day running, see **RUNBOOK.md**.
