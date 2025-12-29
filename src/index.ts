// Export types
export type {
  Intent,
  IntentState,
  IntentNavigationOptions,
  VueIntentPluginOptions,
  IntentStep,
  MessageType,
  ShowWhen,
  IntentGuardProps,
  IntentMessageProps,
  IntentProgressProps,
  IntentDirectiveModifier
} from './types'

// Export composables
export { useIntent } from './composables/useIntent'
export type { UseIntentReturn } from './composables/useIntent'

export { useIntentNavigation } from './composables/useIntentNavigation'
export type { UseIntentNavigationReturn } from './composables/useIntentNavigation'

export { useIntentState } from './composables/useIntentState'
export type { UseIntentStateReturn } from './composables/useIntentState'

// Export components
export { default as IntentGuard } from './components/IntentGuard.vue'
export { default as IntentMessage } from './components/IntentMessage.vue'
export { default as IntentProgress } from './components/IntentProgress.vue'

// Export directive
export { vIntent } from './directives/v-intent'

// Export plugin
export { VueIntentPlugin } from './plugin'
export { VueIntentPlugin as default } from './plugin'
