import { ref, computed, onUnmounted, getCurrentInstance, type Ref, type ComputedRef } from 'vue'
import type { Intent, IntentState } from '../types'

/**
 * Return type for useIntentState composable
 */
export interface UseIntentStateReturn {
  /** Current state name */
  current: ComputedRef<IntentState>

  /** Previous state (if available) */
  previous: Ref<IntentState | null>

  /** State transition history */
  transitions: Ref<IntentState[]>

  /** Time in current state (milliseconds) */
  duration: Ref<number>

  /** Check if intent is in specific state(s) */
  isIn: (state: IntentState | IntentState[]) => boolean
}

/**
 * Composable for granular access to intent state properties
 * 
 * @param intent - The intent to track
 * @returns Detailed state information
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useIntentState } from 'vue-intent'
 * 
 * const { current, transitions, isIn, duration } = useIntentState(intent)
 * 
 * console.log(current.value) // 'in-progress'
 * console.log(isIn(['active', 'in-progress'])) // true
 * console.log(duration.value) // 5000 (ms)
 * </script>
 * ```
 */
export function useIntentState(intent: Intent): UseIntentStateReturn {
  // Track state
  const currentState = ref<IntentState>(intent.state())
  const previous = ref<IntentState | null>(null)
  const transitions = ref<IntentState[]>([intent.state()])
  const duration = ref<number>(0)

  let stateStartTime = Date.now()
  let durationInterval: ReturnType<typeof setInterval> | undefined

  // Update duration every 100ms
  durationInterval = setInterval(() => {
    if (intent.isActive()) {
      duration.value = Date.now() - stateStartTime
    }
  }, 100)

  // Update state tracking
  const updateState = (newState: IntentState) => {
    if (newState !== currentState.value) {
      previous.value = currentState.value
      currentState.value = newState
      transitions.value.push(newState)
      stateStartTime = Date.now()
      duration.value = 0
    }
  }

  // Subscribe to changes if available
  let unsubscribe: (() => void) | undefined

  if (intent.subscribe) {
    unsubscribe = intent.subscribe((newState: IntentState) => {
      updateState(newState)
    })
  }

  // Cleanup on unmount
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (durationInterval) {
        clearInterval(durationInterval)
      }
    })
  }

  // Computed current state
  const current = computed(() => currentState.value)

  // Check if in specific state(s)
  const isIn = (state: IntentState | IntentState[]): boolean => {
    const states = Array.isArray(state) ? state : [state]
    return states.includes(currentState.value)
  }

  return {
    current,
    previous,
    transitions,
    duration,
    isIn
  }
}
