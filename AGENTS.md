# AGENTS.md — EduBridge Agent Instructions

-----

## 🤖 AGENT ROLES

You are Claude Code — the engineering team for EduBridge.
Chandrababu is the CEO. Follow his instructions precisely.

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