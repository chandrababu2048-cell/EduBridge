# EDUBRIDGE — AI Tutor for Underprivileged Kids

## CLAUDE.md — Master Orchestration File

-----

## 🎯 PROJECT VISION

EduBridge is a free AI-powered tutoring web app that gives underprivileged children access to patient, simple, personalized explanations of Math, Science, and English — powered by Claude API.

Built by Chandrababu Anakapalli for the Anthropic Claude Corps Fellowship application.

**Live Demo Goal:** Deployed on Vercel with GitHub repo — fully functional before July 1, 2026.

-----

## 🏗️ TECH STACK

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **AI:** Claude API (claude-sonnet-4-6)
- **Database:** None needed (stateless for MVP)
- **Deploy:** Vercel (frontend) + Render (backend)
- **Repo:** GitHub — public repository

-----

## 📁 PROJECT STRUCTURE

```
edubridge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── SubjectSelector.jsx
│   │   │   ├── AgeLevelSelector.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── Header.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── chat.js
│   ├── prompts/
│   │   └── systemPrompts.js
│   ├── package.json
│   └── .env
├── README.md
├── CLAUDE.md
├── AGENTS.md
└── SKILL.md
```

-----

## 🤖 HOW TO WORK WITH CLAUDE CODE

You are the **CEO and AI Brain Architect** of this project.
Claude Code is your **engineering team**.

### Rules for Claude Code:

1. Always read SKILL.md before writing any code
1. Always read AGENTS.md before starting any task
1. Build one component at a time — don’t rush
1. Write clean, commented, readable code
1. Test every feature before moving to next
1. Commit to GitHub after every completed feature

### How to give instructions:

- Be specific: “Build the ChatBox component with message input and send button”
- Reference files: “Follow the structure in CLAUDE.md”
- One task at a time: Don’t ask for everything at once

-----

## 📋 BUILD ORDER — Follow This Exactly

### Phase 1: Setup (Day 1-2)

- [ ] Initialize React + Vite frontend
- [ ] Initialize Node.js + Express backend
- [ ] Connect Claude API
- [ ] Test basic API call works
- [ ] Push to GitHub

### Phase 2: Core Features (Day 3-7)

- [ ] Build Header component
- [ ] Build SubjectSelector component
- [ ] Build AgeLevelSelector component
- [ ] Build ChatBox component
- [ ] Build MessageBubble component
- [ ] Connect frontend to backend API
- [ ] Test full chat flow works

### Phase 3: Polish (Day 8-14)

- [ ] Add loading states
- [ ] Add error handling
- [ ] Make mobile responsive
- [ ] Add Telugu/English language toggle
- [ ] Style with Tailwind CSS

### Phase 4: Deploy (Day 15-21)

- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Test live deployment
- [ ] Write README.md
- [ ] Write runbook documentation

-----

## 🎨 DESIGN DIRECTION

- **Colors:** Warm, friendly, child-safe — soft blues, greens, yellows
- **Font:** Rounded, readable — Nunito or Poppins
- **Feel:** Welcoming, non-intimidating, joyful
- **NO:** Dark themes, complex UI, overwhelming features
- **YES:** Big buttons, clear text, simple navigation

-----

## 💡 CORE FEATURES (MVP)

1. **Subject Selector** — Math | Science | English
1. **Age Level Selector** — Little Kids (6-10) | Older Kids (11-14)
1. **Chat Interface** — Ask Claude any question
1. **Simple Answers** — Claude explains at child’s level
1. **Language Toggle** — English | Telugu

-----

## 🚀 SUCCESS CRITERIA

- [ ] App loads in browser
- [ ] Child can select subject and age
- [ ] Child can type question and get clear answer
- [ ] Works on mobile phone
- [ ] Deployed live on Vercel
- [ ] GitHub repo is public with good README
- [ ] Runbook written so anyone can maintain it