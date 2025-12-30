# vue-intention

> Vue 3 adapter for Behavior Runtime Core - Build intent-aware, state-driven applications with built-in permission handling and navigation protection.

[![npm version](https://img.shields.io/npm/v/vue-intention.svg)](https://www.npmjs.com/package/vue-intention)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Intent-First Design** - Model user actions as first-class intents
- ⚡ **Reactive State** - Automatic Vue 3 reactivity for all intent states
- 🔒 **Permission Handling** - Built-in permission checks and UI guards
- 🛡️ **Navigation Protection** - Prevent accidental navigation during critical operations
- 💬 **Human-Readable Messages** - Auto-generated user-friendly status messages
- 🔄 **Persistent State** - Intent state survives page refreshes (via Behavior Runtime Core)
- 📦 **Tree-Shakeable** - Import only what you need
- 🎨 **Composable API** - Vue 3 Composition API first
- 🧩 **Component Library** - Ready-to-use Vue components
- 📝 **TypeScript** - Full type safety

## Installation

```bash
npm install vue-intention behavior-runtime-core
```

## Quick Start

### 1. Create an Intent

```typescript
import { createIntent } from 'behavior-runtime-core'

const createTrademarkIntent = createIntent({
  id: 'create-trademark',
  description: 'Register a new trademark',
  actor: currentUser,
  requires: ['trademark:create']
})
```

### 2. Use in Component

```vue
<script setup lang="ts">
import { useIntent } from 'vue-intention'

const { isActive, isCompleted, allowed, message, start, complete } =
  useIntent(createTrademarkIntent)

async function handleCreate() {
  start()
  try {
    await api.createTrademark(formData)
    complete()
  } catch (error) {
    fail(error)
  }
}
</script>

<template>
  <div>
    <button @click="handleCreate" :disabled="!allowed || isActive">
      {{ isActive ? 'Creating...' : 'Create Trademark' }}
    </button>

    <p v-if="message">{{ message }}</p>
  </div>
</template>
```

### 3. Install Plugin (Optional)

```typescript
import { createApp } from 'vue'
import { VueIntentPlugin } from 'vue-intention'
import App from './App.vue'

const app = createApp(App)

app.use(VueIntentPlugin, {
  router, // optional Vue Router instance
  components: {
    prefix: 'Intent' // default: 'Intent'
  }
})

app.mount('#app')
```

## Core Concepts

### Intent Lifecycle

An intent moves through predictable states:

```
idle → started → in-progress → waiting → completed
                            ↓
                        blocked/failed
```

### States Explained

- **idle**: Intent has not started
- **started**: Intent has begun
- **in-progress**: Intent is actively processing
- **waiting**: Intent is paused (e.g., waiting for approval)
- **blocked**: Intent is prevented from continuing
- **completed**: Intent finished successfully
- **failed**: Intent encountered an error

## API Reference

### Composables

#### `useIntent(intent)`

Primary composable for consuming intent state.

**Returns:**

```typescript
{
  state: Ref<IntentState>
  isActive: ComputedRef<boolean>
  isCompleted: ComputedRef<boolean>
  isFailed: ComputedRef<boolean>
  isBlocked: ComputedRef<boolean>
  isWaiting: ComputedRef<boolean>
  allowed: ComputedRef<boolean>
  message: ComputedRef<string>
  start: () => void
  progress: (step?: string) => void
  wait: (reason?: string) => void
  block: (reason?: string) => void
  complete: () => void
  fail: (error?: any) => void
  reset: () => void
  replay: () => void
}
```

**Example:**

```vue
<script setup>
import { useIntent } from 'vue-intention'

const { isActive, message, start, complete } = useIntent(myIntent)
</script>
```

#### `useIntentNavigation(intent, options?)`

Protect navigation during active intents.

**Parameters:**

```typescript
{
  confirmMessage?: string
  onBeforeLeave?: () => void | Promise<void>
  onAfterLeave?: () => void
}
```

**Returns:**

```typescript
{
  canLeave: ComputedRef<boolean>
  protectionActive: ComputedRef<boolean>
}
```

**Example:**

```vue
<script setup>
import { useIntent, useIntentNavigation } from 'vue-intention'

const uploadIntent = createIntent({ id: 'upload-file' })
const { isActive } = useIntent(uploadIntent)

useIntentNavigation(uploadIntent, {
  confirmMessage: 'Upload in progress. Leave anyway?',
  onBeforeLeave: () => {
    console.log('User is leaving')
  }
})
</script>
```

#### `useIntentState(intent)`

Granular access to intent state properties.

**Returns:**

```typescript
{
  current: ComputedRef<IntentState>
  previous: Ref<IntentState | null>
  transitions: Ref<IntentState[]>
  duration: Ref<number>
  isIn: (state: IntentState | IntentState[]) => boolean
}
```

**Example:**

```vue
<script setup>
import { useIntentState } from 'vue-intention'

const { current, transitions, isIn, duration } = useIntentState(intent)

console.log(current.value) // 'in-progress'
console.log(isIn(['active', 'in-progress'])) // true
console.log(duration.value) // 5000 (ms in current state)
</script>
```

### Components

#### `<IntentGuard>`

Conditionally render content based on permissions.

**Props:**

- `intent` (Intent, required) - The intent to check
- `fallback` (String) - Fallback message
- `invert` (Boolean) - Invert the permission check

**Slots:**

- `default` - Content when allowed
- `fallback` - Content when not allowed

**Example:**

```vue
<IntentGuard :intent="createIntent">
  <button>Create Trademark</button>
  <template #fallback>
    <p>You don't have permission</p>
  </template>
</IntentGuard>
```

#### `<IntentMessage>`

Display human-readable intent messages.

**Props:**

- `intent` (Intent, required)
- `type` ('info' | 'warning' | 'error' | 'success')
- `showWhen` ('always' | 'active' | 'blocked' | 'failed')
- `customClass` (String)

**Example:**

```vue
<IntentMessage :intent="uploadIntent" type="info" show-when="active" />
```

#### `<IntentProgress>`

Visual progress indicator for multi-step intents.

**Props:**

- `intent` (Intent, required)
- `steps` (Array<{id: string, label: string}>)
- `showLabels` (Boolean, default: true)
- `linear` (Boolean, default: true)

**Example:**

```vue
<IntentProgress
  :intent="multiStepIntent"
  :steps="[
    { id: 'step-1', label: 'Upload' },
    { id: 'step-2', label: 'Process' },
    { id: 'step-3', label: 'Complete' }
  ]"
/>
```

### Directives

#### `v-intent`

Bind intent state to DOM elements.

**Usage:**

```vue
<!-- Default behavior: disable when not allowed -->
<button v-intent="createIntent">Create</button>

<!-- Disable when not allowed or active -->
<button v-intent:disabled="createIntent">Create</button>

<!-- Add loading class when active -->
<button v-intent:loading="createIntent">Create</button>

<!-- Hide element when not allowed -->
<button v-intent:hidden="createIntent">Create</button>
```

**Modifiers:**

- `disabled` - Disable element when not allowed or active
- `loading` - Add loading class when active
- `hidden` - Hide element when not allowed

## Examples

### Simple Button Click

```vue
<script setup>
import { createIntent } from 'behavior-runtime-core'
import { useIntent } from 'vue-intention'

const saveIntent = createIntent({ id: 'save-data' })
const { isActive, start, complete, fail } = useIntent(saveIntent)

async function handleSave() {
  start()
  try {
    await api.save(data)
    complete()
  } catch (error) {
    fail(error)
  }
}
</script>

<template>
  <button v-intent:loading="saveIntent" @click="handleSave">
    {{ isActive ? 'Saving...' : 'Save' }}
  </button>
</template>
```

### Multi-Step Form

```vue
<script setup>
import { createIntent } from 'behavior-runtime-core'
import { useIntent, useIntentNavigation } from 'vue-intention'

const registrationIntent = createIntent({
  id: 'user-registration',
  requires: ['user:register']
})

const { isActive, start, progress, complete } = useIntent(registrationIntent)
const { canLeave } = useIntentNavigation(registrationIntent)

const steps = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'verify', label: 'Verification' }
]

async function submitStep(stepId) {
  if (!isActive.value) start()

  await api.submitStep(stepId)
  progress(stepId)

  if (stepId === 'verify') {
    complete()
  }
}
</script>

<template>
  <div>
    <IntentProgress :intent="registrationIntent" :steps="steps" />

    <IntentMessage :intent="registrationIntent" show-when="active" />

    <!-- Form steps here -->
  </div>
</template>
```

### Permission-Based UI

```vue
<script setup>
import { createIntent } from 'behavior-runtime-core'

const deleteIntent = createIntent({
  id: 'delete-item',
  requires: ['item:delete'],
  actor: currentUser
})
</script>

<template>
  <IntentGuard :intent="deleteIntent">
    <button v-intent:disabled="deleteIntent" @click="handleDelete">Delete Item</button>
    <template #fallback>
      <span class="text-muted">Delete permission required</span>
    </template>
  </IntentGuard>
</template>
```

### Long-Running Operation

```vue
<script setup>
import { createIntent } from 'behavior-runtime-core'
import { useIntent, useIntentNavigation } from 'vue-intention'

const uploadIntent = createIntent({
  id: 'file-upload',
  description: 'Upload large file'
})

const { isActive, start, progress, complete, fail } = useIntent(uploadIntent)

useIntentNavigation(uploadIntent, {
  confirmMessage: 'File upload in progress. Are you sure you want to leave?'
})

async function uploadFile(file) {
  start()

  const formData = new FormData()
  formData.append('file', file)

  try {
    await api.upload(formData, {
      onProgress: percent => {
        progress(`${percent}% uploaded`)
      }
    })
    complete()
  } catch (error) {
    fail(error)
  }
}
</script>

<template>
  <div>
    <input type="file" @change="uploadFile($event.target.files[0])" />
    <IntentMessage :intent="uploadIntent" type="info" />
  </div>
</template>
```

## TypeScript Usage

Full TypeScript support with proper type inference:

```typescript
import { useIntent } from 'vue-intention'
import type { Intent, IntentState, UseIntentReturn } from 'vue-intention'

const myIntent: Intent = createIntent({ id: 'my-action' })

const {
  state, // Ref<IntentState>
  isActive, // ComputedRef<boolean>
  message, // ComputedRef<string>
  start // () => void
}: UseIntentReturn = useIntent(myIntent)
```

## Best Practices

### 1. One Intent Per Action

Each meaningful user action should have its own intent:

```typescript
// ✅ Good
const createIntent = createIntent({ id: 'create-trademark' })
const editIntent = createIntent({ id: 'edit-trademark' })
const deleteIntent = createIntent({ id: 'delete-trademark' })

// ❌ Bad
const trademarkIntent = createIntent({ id: 'trademark' })
```

### 2. Use Navigation Protection Wisely

Only protect navigation for operations that would cause data loss:

```typescript
// ✅ Good - file upload could be lost
useIntentNavigation(uploadIntent)

// ❌ Bad - simple read operation
useIntentNavigation(viewIntent)
```

### 3. Provide Clear Messages

Override default messages with user-friendly text:

```typescript
const intent = createIntent({
  id: 'export-report',
  message: () => 'Generating your report. This may take a few moments...'
})
```

### 4. Handle Errors Gracefully

Always catch and fail intents properly:

```typescript
async function handleAction() {
  start()
  try {
    await api.call()
    complete()
  } catch (error) {
    fail(error)
    showErrorToast(error.message)
  }
}
```

## Bundle Size

- Core composables: ~3KB gzipped
- Components: ~2KB gzipped each
- Full bundle: <10KB gzipped

## Browser Support

- Modern browsers (ES2020+)
- Vue 3.3+
- No IE11 support

## Related Packages

- [behavior-runtime-core](https://github.com/your-org/behavior-runtime-core) - Core framework-agnostic runtime

## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## License

MIT © 2025

## Acknowledgments

Built on top of [Behavior Runtime Core](https://github.com/your-org/behavior-runtime-core), a framework-agnostic runtime for intent-aware behavior.
