import { ref, computed, onUnmounted, getCurrentInstance, type Ref, type ComputedRef } from 'vue'
import type { Intent, IntentState } from '../types'

/**
 * Return type for useIntent composable
 */
export interface UseIntentReturn {
  /** Current intent state (reactive) */
  state: Ref<IntentState>

  /** Whether intent is currently active */
  isActive: ComputedRef<boolean>

  /** Whether intent is completed */
  isCompleted: ComputedRef<boolean>

  /** Whether intent has failed */
  isFailed: ComputedRef<boolean>

  /** Whether intent is blocked */
  isBlocked: ComputedRef<boolean>

  /** Whether intent is waiting */
  isWaiting: ComputedRef<boolean>

  /** Whether intent is permitted */
  allowed: ComputedRef<boolean>

  /** Human-readable message */
  message: ComputedRef<string>

  /** Start the intent */
  start: () => void

  /** Progress the intent */
  progress: (step?: string) => void

  /** Put intent in waiting state */
  wait: (reason?: string) => void

  /** Block the intent */
  block: (reason?: string) => void

  /** Complete the intent */
  complete: () => void

  /** Fail the intent */
  fail: (error?: unknown) => void

  /** Reset the intent */
  reset: () => void

  /** Replay the intent */
  replay: () => void
}

/**
 * Primary composable for consuming intent state in Vue components
 * 
 * @param intent - The intent to track
 * @returns Reactive intent state and control methods
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useIntent } from 'vue-intent'
 * 
 * const createIntent = createIntent({ id: 'create-trademark' })
 * const { isActive, message, start, complete } = useIntent(createIntent)
 * </script>
 * ```
 */
export function useIntent(intent: Intent): UseIntentReturn {
  // Create reactive state
  const state = ref<IntentState>(intent.state())
  const allowed = ref<boolean>(intent.allowed())
  const message = ref<string>(intent.message())

  // Update function to sync with intent
  const updateState = () => {
    state.value = intent.state()
    allowed.value = intent.allowed()
    message.value = intent.message()
  }

  // Subscribe to intent changes if available
  let unsubscribe: (() => void) | undefined

  if (intent.subscribe) {
    unsubscribe = intent.subscribe(() => {
      updateState()
    })
  }

  // Cleanup subscription on unmount
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })
  }

  // Computed properties
  const isActive = computed(() => state.value === 'started' || state.value === 'in-progress')

  const isCompleted = computed(() => state.value === 'completed')

  const isFailed = computed(() => state.value === 'failed')

  const isBlocked = computed(() => state.value === 'blocked')

  const isWaiting = computed(() => state.value === 'waiting')

  const allowedComputed = computed(() => allowed.value)
  const messageComputed = computed(() => message.value)

  // Action methods
  const start = () => {
    intent.start()
    updateState()
  }

  const progress = (step?: string) => {
    intent.progress(step)
    updateState()
  }

  const wait = (reason?: string) => {
    intent.wait(reason)
    updateState()
  }

  const block = (reason?: string) => {
    intent.block(reason)
    updateState()
  }

  const complete = () => {
    intent.complete()
    updateState()
  }

  const fail = (error?: unknown) => {
    intent.fail(error)
    updateState()
  }

  const reset = () => {
    intent.reset()
    updateState()
  }

  const replay = () => {
    intent.replay()
    updateState()
  }

  return {
    state,
    isActive,
    isCompleted,
    isFailed,
    isBlocked,
    isWaiting,
    allowed: allowedComputed,
    message: messageComputed,
    start,
    progress,
    wait,
    block,
    complete,
    fail,
    reset,
    replay
  }
}
