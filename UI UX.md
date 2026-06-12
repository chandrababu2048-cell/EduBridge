# 🎨 EDUBRIDGE — UI/UX DESIGN SYSTEM

## Frontend Design Guide for Claude Cowork

-----

## 🎯 DESIGN PHILOSOPHY

EduBridge is for CHILDREN aged 6-14.
Every design decision must answer:

> “Would a nervous 8-year-old feel safe and excited using this?”

**Core feelings to create:**

- 🌟 Joyful — learning is fun
- 💙 Safe — no judgment, no pressure
- 🚀 Excited — I want to explore more
- 😊 Confident — I can do this

**Core feelings to AVOID:**

- ❌ Overwhelmed — too many options
- ❌ Intimidated — too complex
- ❌ Bored — too plain
- ❌ Confused — unclear navigation

-----

## 🎨 COLOR SYSTEM

```css
/* Primary Palette */
--color-primary:     #4F86C6;  /* Friendly Blue — trust, learning */
--color-secondary:   #67C99A;  /* Fresh Green — growth, success */
--color-accent:      #FFD166;  /* Warm Yellow — joy, energy */
--color-coral:       #FF6B6B;  /* Soft Red — Math passion */

/* Background System */
--color-bg-main:     #F8FAFF;  /* Soft White — clean, calm */
--color-bg-card:     #FFFFFF;  /* Pure White — content areas */
--color-bg-blue:     #EBF4FF;  /* Light Blue — AI messages */

/* Text System */
--color-text-dark:   #2D3748;  /* Dark Gray — main text */
--color-text-mid:    #718096;  /* Medium Gray — secondary */
--color-text-light:  #A0AEC0;  /* Light Gray — placeholder */

/* Subject Colors */
--color-math:        #FF6B6B;  /* Coral Red */
--color-science:     #67C99A;  /* Fresh Green */
--color-english:     #4F86C6;  /* Friendly Blue */
```

### Tailwind Color Classes:

```
Primary Blue:   bg-[#4F86C6]  text-[#4F86C6]  border-[#4F86C6]
Secondary Green: bg-[#67C99A] text-[#67C99A]  border-[#67C99A]
Accent Yellow:  bg-[#FFD166]  text-[#FFD166]  border-[#FFD166]
Background:     bg-[#F8FAFF]
Dark Text:      text-[#2D3748]
```

-----

## 📝 TYPOGRAPHY

```css
/* Font */
font-family: 'Nunito', 'Poppins', sans-serif;
/* Import in index.html */
/* <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"> */

/* Scale */
--text-hero:    text-4xl md:text-5xl font-extrabold
--text-heading: text-2xl md:text-3xl font-bold
--text-title:   text-xl font-bold
--text-body:    text-base font-normal
--text-small:   text-sm font-medium
--text-tiny:    text-xs font-medium
```

-----

## 📐 SPACING & LAYOUT

```
Container:    max-w-2xl mx-auto px-4
Card:         p-4 md:p-6
Gap:          gap-3 md:gap-4
Border Radius: rounded-2xl (cards) rounded-full (buttons/pills)
Shadow:       shadow-sm (default) shadow-md (hover) shadow-lg (active)
```

-----

## 🖥️ SCREEN DESIGNS

### Screen 1 — Welcome / Landing Screen

```
┌─────────────────────────────────┐
│  🌉 EduBridge                   │  ← Header (white bg, shadow)
│  Free AI Tutor for Every Child  │
├─────────────────────────────────┤
│                                 │
│     ✨ Welcome! 👋              │  ← Hero text (centered)
│   What would you like           │
│      to learn today?            │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │  ← Subject Cards
│  │  🔢  │ │  🔬  │ │  📖  │   │
│  │ Math │ │Scien │ │Engli │   │
│  └──────┘ └──────┘ └──────┘   │
│                                 │
│     How old are you? 🎂         │  ← Age selector
│  ┌──────────┐  ┌──────────┐   │
│  │ 🐣 6-10  │  │ 🦋 11-14 │   │
│  └──────────┘  └──────────┘   │
│                                 │
│   ┌─────────────────────────┐  │
│   │   Start Learning! 🚀    │  │  ← Big CTA button
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Tailwind Code:**

```jsx
// Welcome Screen
<div className="min-h-screen bg-[#F8FAFF] font-nunito">
  
  {/* Header */}
  <header className="bg-white shadow-sm py-4 px-6 flex items-center gap-3">
    <span className="text-4xl">🌉</span>
    <div>
      <h1 className="text-2xl font-extrabold text-[#4F86C6]">EduBridge</h1>
      <p className="text-sm text-gray-400">Free AI Tutor for Every Child</p>
    </div>
  </header>

  {/* Hero */}
  <div className="text-center py-8 px-4">
    <p className="text-4xl mb-2">✨</p>
    <h2 className="text-3xl font-extrabold text-[#2D3748] mb-1">Welcome! 👋</h2>
    <p className="text-gray-500 text-lg">What would you like to learn today?</p>
  </div>

  {/* Subject Cards */}
  <div className="px-4 mb-8">
    <div className="flex gap-3 justify-center">
      {/* Math Card */}
      <button className="flex flex-col items-center p-5 rounded-2xl border-2 border-[#FF6B6B] bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
        <span className="text-4xl mb-2">🔢</span>
        <span className="font-bold text-[#FF6B6B]">Math</span>
      </button>
      {/* Science Card */}
      <button className="flex flex-col items-center p-5 rounded-2xl border-2 border-[#67C99A] bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
        <span className="text-4xl mb-2">🔬</span>
        <span className="font-bold text-[#67C99A]">Science</span>
      </button>
      {/* English Card */}
      <button className="flex flex-col items-center p-5 rounded-2xl border-2 border-[#4F86C6] bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all">
        <span className="text-4xl mb-2">📖</span>
        <span className="font-bold text-[#4F86C6]">English</span>
      </button>
    </div>
  </div>

  {/* Age Selector */}
  <div className="px-4 mb-8">
    <h3 className="text-center font-bold text-[#2D3748] text-xl mb-3">How old are you? 🎂</h3>
    <div className="flex gap-3 justify-center">
      <button className="flex flex-col items-center p-4 rounded-2xl border-2 border-[#67C99A] bg-[#67C99A] text-white shadow-md">
        <span className="text-3xl mb-1">🐣</span>
        <span className="font-bold">Little Kids</span>
        <span className="text-sm opacity-80">6-10 years</span>
      </button>
      <button className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-200 bg-white text-[#2D3748] hover:border-[#67C99A]">
        <span className="text-3xl mb-1">🦋</span>
        <span className="font-bold">Older Kids</span>
        <span className="text-sm text-gray-400">11-14 years</span>
      </button>
    </div>
  </div>

  {/* CTA Button */}
  <div className="px-4">
    <button className="w-full max-w-sm mx-auto block bg-[#4F86C6] text-white py-4 px-8 rounded-full text-xl font-extrabold shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all active:scale-95">
      Start Learning! 🚀
    </button>
  </div>

</div>
```

-----

### Screen 2 — Chat Screen

```
┌─────────────────────────────────┐
│ ← Back  📚 Math    🌍 తెలుగు  │  ← Top bar
├─────────────────────────────────┤
│                                 │
│  🌟 Hi! I'm EduBridge!         │  ← AI message (left)
│     What do you want            │
│     to learn in Math? 😊        │
│                                 │
│              What is 2+2?  →   │  ← User message (right)
│                                 │
│  🌟 Great question! 🎉         │  ← AI response (left)
│     2 + 2 = 4                   │
│     Think of it like this:      │
│     You have 2 apples 🍎🍎      │
│     and get 2 more 🍎🍎         │
│     Now you have 4! 🎊          │
│     You're so smart! ⭐          │
│                                 │
│  ● ● ●  (loading dots)         │  ← Loading state
│                                 │
├─────────────────────────────────┤
│ [Ask me anything... 💬]  [Send]│  ← Input bar
└─────────────────────────────────┘
```

**Tailwind Code:**

```jsx
// Chat Screen
<div className="flex flex-col h-screen bg-[#F8FAFF]">

  {/* Top Bar */}
  <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
    <button className="text-[#4F86C6] font-bold flex items-center gap-1">
      ← Back
    </button>
    <span className="font-extrabold text-[#2D3748] text-lg">📚 Math</span>
    <button className="bg-[#FFD166] text-[#2D3748] px-3 py-1 rounded-full text-sm font-bold">
      తెలుగు
    </button>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    
    {/* AI Message */}
    <div className="flex gap-2 max-w-[85%]">
      <span className="text-2xl">🌟</span>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <p className="text-[#2D3748]">Hi! I'm EduBridge! What do you want to learn in Math today? 😊</p>
      </div>
    </div>

    {/* User Message */}
    <div className="flex justify-end">
      <div className="bg-[#4F86C6] text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[75%] shadow-sm">
        <p>What is 2+2?</p>
      </div>
    </div>

    {/* Loading State */}
    <div className="flex gap-2 items-center">
      <span className="text-2xl">🌟</span>
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
          <span className="w-2 h-2 bg-[#4F86C6] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
        </div>
      </div>
    </div>

  </div>

  {/* Input Bar */}
  <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
    <input
      placeholder="Ask me anything! 💬"
      className="flex-1 border-2 border-[#4F86C6] rounded-full px-4 py-3 outline-none focus:border-blue-600 text-[#2D3748] placeholder-gray-400"
    />
    <button className="bg-[#4F86C6] text-white px-5 py-3 rounded-full font-bold shadow-md hover:bg-blue-600 active:scale-95 transition-all">
      🚀
    </button>
  </div>

</div>
```

-----

## 📱 MOBILE RULES

```
✅ All buttons minimum 48px height (touch friendly)
✅ Input text minimum 16px (prevents iOS zoom)
✅ No horizontal scrolling
✅ Bottom input bar stays above keyboard
✅ Messages scroll independently
✅ Large emoji for visual interest
✅ Sufficient contrast for outdoor reading
```

-----

## ✨ MICRO ANIMATIONS

```css
/* Button press */
active:scale-95 transition-all duration-150

/* Card hover */
hover:scale-105 hover:shadow-lg transition-all duration-200

/* Subject selected */
scale-105 shadow-lg border-2 border-[subject-color]

/* Loading dots */
animate-bounce [each dot delayed by 0.1s]

/* Message appear */
animate-fadeIn [custom animation]
```

**Add to index.css:**

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  font-family: 'Nunito', sans-serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

body {
  background-color: #F8FAFF;
}
```

-----

## 🎭 COMPONENT STATES

### Button States:

```
Default:  bg-[#4F86C6] text-white shadow-md
Hover:    bg-blue-600 shadow-lg scale-105
Active:   scale-95
Disabled: opacity-50 cursor-not-allowed
Selected: ring-2 ring-offset-2 ring-[#4F86C6]
```

### Input States:

```
Default:  border-2 border-gray-200
Focus:    border-[#4F86C6] ring-2 ring-blue-100
Error:    border-red-400 ring-2 ring-red-100
```

### Card States:

```
Default:  border-2 border-gray-200 bg-white shadow-sm
Hover:    border-[subject-color] shadow-md scale-105
Selected: border-[subject-color] bg-[subject-color] text-white shadow-lg
```

-----

## 🏆 SUBJECT THEME SYSTEM

Each subject has its own color personality:

```jsx
const SUBJECT_THEMES = {
  Math: {
    color: '#FF6B6B',
    bg: 'bg-[#FF6B6B]',
    border: 'border-[#FF6B6B]',
    text: 'text-[#FF6B6B]',
    light: 'bg-red-50',
    emoji: '🔢',
    greeting: "Let's crunch some numbers! 🔢"
  },
  Science: {
    color: '#67C99A',
    bg: 'bg-[#67C99A]',
    border: 'border-[#67C99A]',
    text: 'text-[#67C99A]',
    light: 'bg-green-50',
    emoji: '🔬',
    greeting: "Let's discover something amazing! 🔬"
  },
  English: {
    color: '#4F86C6',
    bg: 'bg-[#4F86C6]',
    border: 'border-[#4F86C6]',
    text: 'text-[#4F86C6]',
    light: 'bg-blue-50',
    emoji: '📖',
    greeting: "Let's explore words together! 📖"
  }
};
```

-----

## 🌍 LANGUAGE TOGGLE UI

```jsx
// Language pill in top bar
<button
  onClick={toggleLanguage}
  className="flex items-center gap-1 bg-[#FFD166] text-[#2D3748] px-3 py-1 rounded-full text-sm font-bold hover:bg-yellow-400 transition-all"
>
  {language === 'english' ? '🇮🇳 తెలుగు' : '🇺🇸 English'}
</button>
```

-----

## 📋 COMPLETE TAILWIND CONFIG

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        primary: '#4F86C6',
        secondary: '#67C99A',
        accent: '#FFD166',
        coral: '#FF6B6B',
      },
      animation: {
        'bounce-slow': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
```

-----

## 🚀 INSTRUCTIONS FOR CLAUDE COWORK

When building UI paste this prompt:

```
Read UI_UX.md completely before writing any frontend code.

Rules:
1. Use ONLY the colors defined in UI_UX.md
2. Use ONLY Nunito font
3. Follow the screen wireframes exactly
4. Every component must be mobile-first
5. All buttons minimum 48px touch target
6. Use the SUBJECT_THEMES system for colors
7. Add animate-fadeIn to all new messages
8. Loading state must show bouncing dots
9. Selected state must be visually obvious
10. Test on 375px width (iPhone SE)
```