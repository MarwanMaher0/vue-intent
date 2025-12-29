# Behavior Runtime (Core)

> **A framework-agnostic runtime for intent, state, permission, and human-aware behavior in modern applications.**

---

## 1. Why This Package Exists

Modern applications repeatedly struggle with the same problems:

- Long-running actions that lose state on refresh
- Scattered permission and feature-availability logic
- UI conditions duplicated across components
- Users navigating away during critical operations
- Systems knowing what’s happening while humans do not

**Behavior Runtime (Core)** introduces a missing abstraction:

> **Intent-aware behavior as a first-class runtime concept**

Instead of managing dozens of flags, conditions, and guards, you model *what the user or system is trying to do*, and the runtime handles the rest.

---

## 2. Core Philosophy

### 2.1 Intent over Implementation
You don’t track buttons, loaders, or routes.
You track **intent**.

Example intents:
- Create trademark
- Upload certificate
- Export report
- Edit profile

---

### 2.2 Behavior over UI
This package does **not** render UI.
It exposes **truth** that UI can consume.

---

### 2.3 Humans Are First-Class Citizens
Every intent must be able to explain itself:
- What is happening?
- Can I leave?
- What will happen next?

---

## 3. What This Package Is / Is Not

### ✅ It IS
- A lightweight runtime layer
- Framework agnostic
- Persistent by default
- Intent & state driven
- Permission-aware

### ❌ It is NOT
- A router
- A state manager replacement
- A UI component library
- A validation library
- A backend contract tool (that’s Package 2)

---

## 4. Mental Model (The Foundation)

Everything is built on **three primitives**:

### 4.1 Intent
Represents a meaningful action.

### 4.2 State
Represents where that intent currently is.

### 4.3 Awareness
Represents how the system communicates that state to:
- UI
- Navigation
- Humans

---

## 5. Intent Lifecycle

An intent moves through predictable states:

```
id
│
├─ idle
├─ started
├─ in-progress
├─ waiting
├─ blocked
├─ completed
└─ failed
```

States are **explicit**, never inferred.

---

## 6. Installation (Conceptual)

```bash
npm install behavior-runtime-core
```

(No framework adapters required.)

---

## 7. Creating an Intent

```js
import { createIntent } from 'behavior-runtime-core'

const intent = createIntent({
  id: 'create-trademark',
  description: 'Register a new trademark',
  actor: user,
  requires: ['trademark:create'],
})
```

### Required fields
- `id`: unique intent identifier

### Optional fields
- `description`
- `actor`
- `requires` (permissions)

---

## 8. Starting and Progressing an Intent

```js
intent.start()
intent.progress('upload-certificate')
```

Available transitions:
- `start()`
- `progress(step?)`
- `wait(reason?)`
- `block(reason?)`
- `complete()`
- `fail(error?)`

---

## 9. Reading Intent State

```js
intent.state()        // 'in-progress'
intent.isActive()     // true
intent.isCompleted()  // false
```

State is always synchronous and reliable.

---

## 10. Persistent Actions (Core Feature)

By default, intents are **persisted**.

This means:
- Page refresh does NOT lose progress
- Returning to the app restores awareness

```js
intent.persist(true)
```

Storage strategy (default):
- `localStorage`

(Pluggable later.)

---

## 11. Feature Availability & Permissions

```js
intent.allowed() // true | false
```

Rules:
- Actor permissions
- Intent requirements
- Runtime overrides

You no longer ask:
> “Should I show this button?”

You ask:
> “Is this intent allowed?”

---

## 12. UI Conditions (Single Source of Truth)

Instead of:
```js
if (isAdmin && !loading && hasPermission)
```

You write:
```js
if (intent.allowed() && intent.isIdle())
```

UI becomes declarative and predictable.

---

## 13. Safe Navigation (Built-in)

```js
intent.protectNavigation()
```

Behavior:
- Prevents accidental leave
- Allows safe leave when possible
- Works across reloads

No more router hacks.

---

## 14. Human-Readable Messaging

```js
intent.message()
```

Example output:
> "Your trademark is still being processed. You can safely leave this page."

Messages are:
- State-aware
- Intent-aware
- Overrideable

---

## 15. Error Handling

```js
intent.fail({ code: 'UPLOAD_FAILED' })
```

Results in:
- State = `failed`
- Human message updated
- Navigation protection adjusted

---

## 16. Resetting & Replaying Intents

```js
intent.reset()
intent.replay()
```

Useful for:
- Retry flows
- Edit → submit cycles

---

## 17. Multi-Step & Long-Running Flows

Example:
```js
intent.start()
intent.progress('step-1')
intent.wait('external-approval')
intent.progress('step-2')
intent.complete()
```

No timers. No polling assumptions.

---

## 18. Framework Integration (Guidelines)

### Vue / React / Angular
- Read-only consumption
- Subscribe to intent state
- Never mutate UI directly

---

## 19. What NOT to Do (Anti-Patterns)

❌ Do not store UI flags separately
❌ Do not duplicate permission logic
❌ Do not infer state from loaders
❌ Do not bypass navigation protection

---

## 20. Extensibility

Planned extension points:
- Custom persistence adapters
- Localization
- Analytics hooks
- Dev tooling (Package 2)

---

## 21. Project Structure (Recommended)

```
/intent
  createTrademark.intent.js
  exportReport.intent.js
```

Each intent is explicit and isolated.

---

## 22. MVP Non-Goals

The core will NOT:
- Validate forms
- Parse APIs
- Render UI
- Replace state managers

---

## 23. Who This Is For

- Frontend engineers
- Product-focused teams
- UX-sensitive applications
- Long-running workflows

---

## 24. Roadmap (High-Level)

- Stable core
- Framework adapters (optional)
- Devtools package
- Community patterns

---

## 25. Final Principle

> **If your app can explain what it’s doing, users will trust it.**

Behavior Runtime (Core) exists to make that explanation consistent, persistent, and human.

---

_End of Kickstart Document_

