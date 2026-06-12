# 🚀 EDUBRIDGE — COMPLETE BUILD PROMPT FOR CLAUDE COWORK

Paste this entire prompt into Claude Cowork to start building EduBridge.

-----

## YOUR MISSION

You are the engineering team for EduBridge — a free AI tutoring app for underprivileged children built with React, Node.js, and Claude API.

I am Chandrababu — the CEO and product owner. You will build this app exactly as specified.

## FIRST — READ THESE FILES IN ORDER:

1. Read CLAUDE.md — understand the full project
1. Read AGENTS.md — understand your rules
1. Read SKILL.md — get all the code patterns

## THEN — BUILD IN THIS EXACT ORDER:

### STEP 1: Create folder structure

Create this folder structure:

```
edubridge/
├── frontend/
├── backend/
├── CLAUDE.md
├── AGENTS.md
└── SKILL.md
```

### STEP 2: Setup Backend

1. Go into backend/ folder
1. Create package.json with contents from SKILL.md
1. Run: npm install
1. Create server.js from SKILL.md pattern
1. Create routes/chat.js from SKILL.md pattern
1. Create prompts/systemPrompts.js from SKILL.md pattern
1. Create .env file with ANTHROPIC_API_KEY placeholder

### STEP 3: Setup Frontend

1. Go into frontend/ folder
1. Run: npm create vite@latest . – –template react
1. Run: npm install
1. Run: npm install tailwindcss @tailwindcss/vite
1. Create all components from SKILL.md:
- src/components/Header.jsx
- src/components/SubjectSelector.jsx
- src/components/AgeLevelSelector.jsx
- src/components/MessageBubble.jsx
- src/components/ChatBox.jsx
- src/App.jsx
1. Update src/index.css with Tailwind imports
1. Create .env with VITE_API_URL=<http://localhost:3001>

### STEP 4: Test locally

1. Start backend: cd backend && npm run dev
1. Start frontend: cd frontend && npm run dev
1. Open browser at <http://localhost:5173>
1. Test full chat flow works

### STEP 5: GitHub Setup

1. Initialize git repo: git init
1. Create .gitignore (ignore node_modules and .env)
1. git add .
1. git commit -m “feat: initial EduBridge setup”
1. Push to GitHub (I will provide repo URL)

### STEP 6: Deploy

1. Deploy backend to Render.com (free tier)
1. Update frontend .env with Render URL
1. Deploy frontend to Vercel (free tier)
1. Test live deployment works

## IMPORTANT RULES:

- Follow AGENTS.md rules exactly
- Use code patterns from SKILL.md exactly
- Ask me before making any design decisions not in SKILL.md
- Commit to GitHub after every completed step
- Tell me when each step is done before moving to next

## START NOW:

Begin with STEP 1 — create the folder structure and confirm when done.