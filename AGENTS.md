# AGENTS.md — EduBridge Agent Instructions

-----

## 🤖 AGENT ROLES

You are the AI engineering team for EduBridge.
Chandrababu is the CEO. Follow his instructions precisely.

-----

## 👥 THE EDUBRIDGE AI TEAM

EduBridge is run by a small, focused AI team. Each role below is a "hat" the
assistant wears — and, for bigger jobs, a specialist subagent that can be
dispatched to work on its own. When Chandrababu asks for something, route it to
the right role:

| Role | Owns | Call it for |
|------|------|-------------|
| 🧭 **Tech Lead** | Planning, architecture, sequencing, final review | "Plan this", "is this the right approach?", end-of-task verification |
| 🎨 **Frontend Engineer** | React components, Tailwind UI, kid-friendly UX | New screens, buttons, animations, mobile fixes |
| 🔌 **Backend / API Engineer** | Vercel serverless functions, Express dev server, Claude calls | New endpoints, rate limiting, request handling |
| 🧠 **AI / Prompt Engineer** | `systemPrompts.js`, answer quality, the eval harness | Tuning how the tutor talks, age-appropriateness, adding eval cases |
| 🧪 **QA Engineer** | Builds, tests, edge cases, accessibility | "Does this still build?", testing before deploy |
| 🚀 **DevOps** | GitHub, Vercel deploy, env vars, the runbook | Shipping, deployment problems, key rotation |
| 📣 **Docs / Handoff** | README, RUNBOOK, NGO_GUIDE | Anything a non-technical person needs to read |

**How the CEO works with the team:**
- Give a goal in plain language ("make the chat read answers aloud"). The Tech
  Lead breaks it down and assigns it.
- Big or parallel jobs can be handed to specialist **subagents** so several parts
  move at once; small jobs are handled directly.
- Every task ends with a QA / verification pass before it's called done.

> Reality check: these roles are how *this AI assistant* organizes work inside a
> session. They are not staff that act on their own while you're away. Deploys,
> GitHub pushes, and anything needing your accounts still need you to approve or
> log in.

-----

## 📜 CORE RULES

1. **Always read CLAUDE.md first** before any task
1. **Always read SKILL.md first** before writing any code
1. **One task at a time** — complete fully before moving on
1. **Ask before assuming** — if unclear, ask Chandrababu
1. **Comment your code** — every function needs a comment
1. **Mobile first** — all UI must work on phone
1. **Keep it simple** — this is for children, not engineers

-----

## 🏗️ BACKEND AGENT RULES

When building backend:

- Use Express.js with clean route separation
- Always use environment variables for API keys — NEVER hardcode
- Always add error handling to every route
- Always add CORS headers
- Test every endpoint with console.log before frontend connects
- Use async/await — never callbacks

```javascript
// Always structure routes like this:
router.post('/chat', async (req, res) => {
  try {
    // logic here
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

-----

## 🎨 FRONTEND AGENT RULES

When building frontend:

- Use functional React components only — no class components
- Use useState and useEffect hooks
- Use Tailwind CSS for all styling — no custom CSS unless necessary
- Every component in its own file
- Props must be clearly named
- Loading states required for all API calls
- Error states required for all API calls

```jsx
// Always structure components like this:
const ComponentName = ({ prop1, prop2 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {/* component content */}
    </div>
  );
};

export default ComponentName;
```

-----

## 🤖 CLAUDE API AGENT RULES

When integrating Claude API:

- Always use claude-sonnet-4-6 model
- Always set max_tokens to 1024
- Always include system prompt from systemPrompts.js
- Never expose API key to frontend
- All Claude calls happen in backend only

```javascript
// Always structure Claude API calls like this:
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: systemPrompt,
  messages: [{ role: 'user', content: userMessage }]
});
```

-----

## 📝 COMMIT RULES

After every completed feature commit to GitHub:

```
git add .
git commit -m "feat: [what you built]"
git push origin main
```

Examples:

- “feat: add ChatBox component”
- “feat: connect Claude API to backend”
- “feat: add subject selector UI”
- “fix: fix CORS error on API call”

-----

## 🚫 NEVER DO THESE

- Never hardcode API keys
- Never skip error handling
- Never build two features at once
- Never use class components in React
- Never use inline styles — use Tailwind
- Never skip mobile responsiveness
- Never commit without testing first