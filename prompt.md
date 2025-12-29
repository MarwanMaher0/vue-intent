Here's a comprehensive prompt to implement the `vue-intent` package:

---

# Implementation Prompt:  vue-intent Package

## Project Overview
Create a Vue 3 adapter package called `vue-intent` that provides Vue-specific bindings for the Behavior Runtime Core framework.  This package enables Vue developers to build intent-aware, state-driven applications with built-in permission handling, navigation protection, and human-readable messaging.

## Package Requirements

### 1. Package Structure
```
vue-intent/
├── src/
│   ├── composables/
│   │   ├── useIntent.ts
│   │   ├── useIntentState.ts
│   │   └── useIntentNavigation.ts
│   ├── components/
│   │   ├── IntentGuard.vue
│   │   ├── IntentMessage.vue
│   │   └── IntentProgress.vue
│   ├── directives/
│   │   └── v-intent.ts
│   ├── types/
│   │   └── index.ts
│   ├── plugin.ts
│   └── index.ts
├── tests/
│   ├── composables/
│   ├── components/
│   └── directives/
├── examples/
│   └── basic/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── LICENSE
```

### 2. Core Composables

#### `useIntent(intent:  Intent)`
**Purpose**: Primary composable for consuming intent state in Vue components

**Returns**:
- `state`: Ref<IntentState> - Current intent state
- `isActive`: ComputedRef<boolean> - Whether intent is active
- `isCompleted`: ComputedRef<boolean> - Whether intent is completed
- `isFailed`: ComputedRef<boolean> - Whether intent failed
- `isBlocked`: ComputedRef<boolean> - Whether intent is blocked
- `isWaiting`: ComputedRef<boolean> - Whether intent is waiting
- `allowed`: ComputedRef<boolean> - Whether intent is permitted
- `message`: ComputedRef<string> - Human-readable message
- `start()`: Function to start the intent
- `progress(step?: string)`: Function to progress intent
- `wait(reason?: string)`: Function to pause intent
- `block(reason?: string)`: Function to block intent
- `complete()`: Function to complete intent
- `fail(error?: any)`: Function to fail intent
- `reset()`: Function to reset intent
- `replay()`: Function to replay intent

**Requirements**:
- Automatically subscribe to intent state changes
- Cleanup subscriptions on component unmount
- Reactive state updates
- TypeScript support with proper types

#### `useIntentNavigation(intent: Intent, options? )`
**Purpose**: Protect navigation during active intents

**Parameters**:
- `intent`: Intent - The intent to protect
- `options`: Object (optional)
  - `confirmMessage`: String - Custom confirmation message
  - `onBeforeLeave`: Callback - Hook before navigation
  - `onAfterLeave`: Callback - Hook after navigation

**Returns**:
- `canLeave`: ComputedRef<boolean> - Whether navigation is safe
- `protectionActive`: ComputedRef<boolean> - Whether protection is enabled

**Requirements**:
- Integrate with Vue Router's `onBeforeRouteLeave`
- Handle browser beforeunload events
- Support custom confirmation dialogs
- Respect intent. protectNavigation() setting

#### `useIntentState(intent: Intent)`
**Purpose**: Granular access to specific intent state properties

**Returns**:
- `current`: ComputedRef<string> - Current state name
- `previous`: ComputedRef<string | null> - Previous state
- `transitions`: ComputedRef<string[]> - State transition history
- `duration`: ComputedRef<number> - Time in current state (ms)
- `isIn(state:  string | string[])`: Function to check specific state(s)

### 3. Vue Components

#### `<IntentGuard>`
**Purpose**: Conditionally render content based on intent permissions

**Props**:
- `intent`: Intent (required) - The intent to check
- `fallback`: Slot name or component (optional) - What to show when not allowed
- `invert`: Boolean (optional) - Invert the permission check

**Slots**:
- `default`: Content to show when allowed
- `fallback`: Content to show when not allowed

**Example**:
```vue
<IntentGuard :intent="createIntent">
  <button>Create Trademark</button>
  <template #fallback>
    <p>You don't have permission</p>
  </template>
</IntentGuard>
```

#### `<IntentMessage>`
**Purpose**: Display human-readable intent messages

**Props**:
- `intent`: Intent (required) - The intent to display message for
- `type`: 'info' | 'warning' | 'error' | 'success' (optional) - Message styling
- `show-when`: 'always' | 'active' | 'blocked' | 'failed' (optional) - When to show
- `custom-class`: String (optional) - Additional CSS classes

**Features**:
- Auto-update when intent state changes
- Configurable styling
- Accessibility support (ARIA attributes)

#### `<IntentProgress>`
**Purpose**: Visual progress indicator for multi-step intents

**Props**:
- `intent`: Intent (required)
- `steps`: Array<{id: string, label: string}> (optional) - Step definitions
- `show-labels`: Boolean (default: true)
- `linear`: Boolean (default: true) - Whether to show linear progress

### 4. Directives

#### `v-intent`
**Purpose**: Bind intent state to DOM elements

**Usage**:
```vue
<button v-intent="createIntent">Create</button>
<button v-intent: disabled="createIntent">Create</button>
<button v-intent:loading="createIntent">Create</button>
```

**Modifiers**:
- `disabled`: Disable element when not allowed or active
- `loading`: Add loading class when active
- `hidden`: Hide element when not allowed

**Requirements**:
- Apply appropriate DOM attributes
- Add/remove CSS classes based on state
- Handle mounted, updated, and unmounted lifecycle

### 5. Plugin Setup

#### `VueIntentPlugin`
**Purpose**: Global plugin for easy integration

**Features**:
- Register all components globally
- Register all directives
- Provide global configuration options
- Optional Vue Router integration

**Usage**:
```typescript
import { createApp } from 'vue'
import { VueIntentPlugin } from 'vue-intent'

const app = createApp(App)

app.use(VueIntentPlugin, {
  router, // optional
  components: {
    prefix: 'Intent' // optional, default prefix
  }
})
```

### 6. TypeScript Support

**Requirements**:
- Full TypeScript implementation
- Export all types and interfaces
- Proper type inference for composables
- Generic support where applicable
- Vue 3 type compatibility

**Key Types**:
```typescript
interface Intent {
  id: string
  state(): IntentState
  isActive(): boolean
  isCompleted(): boolean
  allowed(): boolean
  message(): string
  start(): void
  progress(step?: string): void
  wait(reason?: string): void
  block(reason?: string): void
  complete(): void
  fail(error?: any): void
  reset(): void
  replay(): void
  protectNavigation(): boolean
  subscribe?(callback: (state: IntentState) => void): () => void
}

type IntentState = 
  | 'idle' 
  | 'started' 
  | 'in-progress' 
  | 'waiting' 
  | 'blocked' 
  | 'completed' 
  | 'failed'
```

### 7. Testing Requirements

**Framework**: Vitest + Vue Test Utils

**Coverage**:
- Unit tests for all composables
- Component tests for all Vue components
- Directive behavior tests
- Integration tests with mock intents
- Minimum 90% code coverage

**Test Scenarios**:
- Intent state transitions
- Permission handling
- Navigation protection
- Cleanup on unmount
- Error handling
- Edge cases (null intents, missing permissions, etc.)

### 8. Documentation

#### README.md Structure
1. Installation
2. Quick Start
3. Core Concepts
4. API Reference
   - Composables
   - Components
   - Directives
   - Plugin
5. Examples
   - Basic usage
   - Multi-step flows
   - Permission handling
   - Navigation protection
6. TypeScript Usage
7. Best Practices
8. Migration Guide (if applicable)

#### Examples to Include
1. Simple intent (button click)
2. Multi-step form with progress
3. Long-running operation with navigation protection
4. Permission-based UI rendering
5. Error handling and retry
6. Integration with Vue Router

### 9. Build Configuration

**Build Tool**: Vite or tsup

**Output Formats**:
- ESM (dist/index.mjs)
- CJS (dist/index.js)
- TypeScript declarations (dist/index.d.ts)

**Bundle Requirements**:
- Tree-shakeable
- Minimal bundle size
- No unnecessary dependencies
- Proper externals (vue, vue-router, behavior-runtime-core)

### 10. Package. json Configuration

```json
{
  "name":  "vue-intent",
  "version": "0.1.0",
  "description": "Vue 3 adapter for Behavior Runtime Core",
  "main": "dist/index.js",
  "module": "dist/index. mjs",
  "types":  "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "vite build",
    "dev":  "vite",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint src/**/*.{ts,vue}"
  },
  "peerDependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.0.0",
    "behavior-runtime-core": "^0.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "vitest": "^1.0.0",
    "vue-tsc": "^1.8.0",
    "typescript": "^5.3.0"
  },
  "keywords": [
    "vue",
    "vue3",
    "intent",
    "behavior",
    "runtime",
    "state-management",
    "permissions"
  ]
}
```

### 11. Quality Standards

**Code Quality**:
- ESLint + Prettier configuration
- Consistent naming conventions
- Comprehensive JSDoc comments
- No any types (use unknown or proper types)
- Proper error handling

**Performance**:
- Minimal re-renders
- Efficient reactivity
- Lazy loading where applicable
- No memory leaks

**Accessibility**:
- ARIA attributes on components
- Keyboard navigation support
- Screen reader friendly

### 12. Development Workflow

1. Set up monorepo (optional) or standalone package
2. Implement core composables first
3. Add components with tests
4. Implement directives
5. Create plugin wrapper
6. Write comprehensive documentation
7. Add examples
8. Performance optimization
9. Final testing and QA
10. Publish to npm

### 13. Future Enhancements (Nice to Have)

- DevTools integration
- Nuxt module
- SSR support
- Animation/transition helpers
- Intent composition utilities
- Debug mode with logging
- Performance monitoring
- Analytics integration hooks

---

## Success Criteria

- [ ] All composables work with Vue 3 reactivity
- [ ] Components are fully typed and tested
- [ ] Navigation protection works across page refreshes
- [ ] Zero memory leaks on component unmount
- [ ] Bundle size < 10kb gzipped
- [ ] 90%+ test coverage
- [ ] Complete API documentation
- [ ] Working examples
- [ ] Published to npm
- [ ] Compatible with Vue 3.3+

---

Use this prompt to guide your implementation of the vue-intent package. 