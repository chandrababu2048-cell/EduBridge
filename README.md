# 🌉 EduBridge — Free AI Tutor for Every Child

![CI](https://github.com/chandrababu2048-cell/EduBridge/actions/workflows/ci.yml/badge.svg)

EduBridge is a free, open-source AI tutoring app that gives underprivileged children access to patient, personalized explanations of Math, Science, and English — powered by Claude AI.

## ✨ Features

- 📚 Three subjects: Math, Science, English
- 🎂 Two age levels: Little Kids (6–10) & Older Kids (11–14)
- 🌍 English & Telugu language support
- 💬 Real-time AI chat powered by Claude
- 🔊 **Read aloud** — every answer can be spoken out loud for early readers
- 🎤 **Voice questions** — kids can ask by speaking instead of typing
- ✨ **Example questions** — tappable starters so no one stares at a blank box
- ⭐ **Stars & celebrations** — a star for every question asked, to keep learning playful
- 📊 **Teacher dashboard** — see how many children are being helped
- 📱 Mobile friendly

## 🚀 Live Demo

After deploying (see below), your live URL will look like `https://<your-project>.vercel.app`.

> Note: `edubridge.vercel.app` is an unrelated project by someone else — pick your own
> available subdomain when you deploy.

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **API:** Vercel Serverless Functions (`frontend/api/`)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Hosting:** Vercel (frontend + API in one project)
- **Local backend (optional):** Node.js + Express (`backend/`) for offline dev and the eval harness

## 🏃 Run Locally

You need two terminals — one for the API, one for the web app.

### 1. Backend (local API)

```bash
cd backend
npm install
cp .env.example .env        # then paste your Claude API key into .env
npm run dev                 # runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173
```

The local frontend reads `frontend/.env` (`VITE_API_URL=http://localhost:3001`) and talks to the Express backend.

## ☁️ Deploy to Production (Vercel)

EduBridge deploys as **one Vercel project** — the website and the `/api` functions together.
No separate backend host is required.

1. **Push your code to GitHub** (`git push origin main`).
2. On **vercel.com**, click **Add New → Project** and import the `EduBridge` repo.
3. Set **Root Directory** to **`frontend`**.
4. Add an Environment Variable: **`ANTHROPIC_API_KEY`** = your Claude key.
5. Click **Deploy**.

That's it — the chat (`/api/chat`) and stats (`/api/analytics/stats`) run as serverless
functions on the same domain as the site. Full step-by-step instructions are in
[`DEPLOY.md`](./DEPLOY.md).

## 🧪 Testing Answer Quality

A small evaluation harness checks that Claude's answers stay simple and age-appropriate:

```bash
cd backend
npm run eval
```

## 📚 Documentation

- [`DEPLOY.md`](./DEPLOY.md) — click-by-click deployment guide
- [`RUNBOOK.md`](./RUNBOOK.md) — how to keep EduBridge running (for non-technical maintainers)
- [`NGO_GUIDE.md`](./NGO_GUIDE.md) — how teachers and NGOs use it with students

## 💙 Why I Built This

I spent years teaching orphaned children in India with zero resources. EduBridge is my way of giving every child access to a patient, kind tutor — for free, forever.

Every child deserves a teacher who never gets tired, never judges, and always has time. That's what Claude and this platform make possible.
