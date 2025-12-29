/**
 * Represents the possible states an intent can be in
 */
export type IntentState =
  | 'idle'
  | 'started'
  | 'in-progress'
  | 'waiting'
  | 'blocked'
  | 'completed'
  | 'failed'

/**
 * Core Intent interface representing a meaningful action in the application
 */
export interface Intent {
  /** Unique identifier for the intent */
  id: string

  /** Current state of the intent */
  state(): IntentState

  /** Whether the intent is currently active (started or in-progress) */
  isActive(): boolean

  /** Whether the intent has been completed successfully */
  isCompleted(): boolean

  /** Whether the intent has failed */
  isFailed(): boolean

  /** Whether the intent is blocked */
  isBlocked(): boolean

  /** Whether the intent is waiting */
  isWaiting(): boolean

  /** Whether the intent is allowed based on permissions */
  allowed(): boolean

  /** Human-readable message describing the current state */
  message(): string

  /** Start the intent */
  start(): void

  /** Progress the intent to the next step */
  progress(step?: string): void

  /** Put the intent in waiting state */
  wait(reason?: string): void

  /** Block the intent */
  block(reason?: string): void

  /** Complete the intent successfully */
  complete(): void

  /** Fail the intent with an optional error */
  fail(error?: unknown): void

  /** Reset the intent to idle state */
  reset(): void

  /** Replay the intent from the beginning */
  replay(): void

  /** Whether navigation should be protected during this intent */
  protectNavigation(): boolean

  /** Subscribe to state changes (optional, for reactivity) */
  subscribe?(callback: (state: IntentState) => void): () => void
}

/**
 * Options for useIntentNavigation composable
 */
export interface IntentNavigationOptions {
  /** Custom confirmation message when user tries to leave */
  confirmMessage?: string

  /** Hook called before navigation */
  onBeforeLeave?: () => void | Promise<void>

  /** Hook called after navigation is allowed */
  onAfterLeave?: () => void
}

/**
 * Options for the Vue Intent plugin
 */
export interface VueIntentPluginOptions {
  /** Optional Vue Router instance for navigation protection */
  router?: unknown

  /** Component registration options */
  components?: {
    /** Prefix for component names (default: 'Intent') */
    prefix?: string
  }
}

/**
 * Step definition for IntentProgress component
 */
export interface IntentStep {
  /** Unique identifier for the step */
  id: string

  /** Display label for the step */
  label: string
}

/**
 * Message type for IntentMessage component styling
 */
export type MessageType = 'info' | 'warning' | 'error' | 'success'

/**
 * When to show the IntentMessage component
 */
export type ShowWhen = 'always' | 'active' | 'blocked' | 'failed'

/**
 * Props for IntentGuard component
 */
export interface IntentGuardProps {
  intent: Intent
  fallback?: string
  invert?: boolean
}

/**
 * Props for IntentMessage component
 */
export interface IntentMessageProps {
  intent: Intent
  type?: MessageType
  showWhen?: ShowWhen
  customClass?: string
}

/**
 * Props for IntentProgress component
 */
export interface IntentProgressProps {
  intent: Intent
  steps?: IntentStep[]
  showLabels?: boolean
  linear?: boolean
}

/**
 * Directive modifiers for v-intent
 */
export type IntentDirectiveModifier = 'disabled' | 'loading' | 'hidden'
