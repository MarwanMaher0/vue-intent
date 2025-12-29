// Internal compile-time export validation.
// This file is intentionally included in `tsconfig.json` so `vue-tsc` will fail
// if the public exports change in an incompatible way.

import {
  // Types
  type Intent,
  type IntentState,
  type IntentNavigationOptions,
  type VueIntentPluginOptions,
  type IntentStep,
  type MessageType,
  type ShowWhen,
  type IntentGuardProps,
  type IntentMessageProps,
  type IntentProgressProps,
  type IntentDirectiveModifier,

  // Composables
  useIntent,
  type UseIntentReturn,
  useIntentNavigation,
  type UseIntentNavigationReturn,
  useIntentState,
  type UseIntentStateReturn,

  // Components
  IntentGuard,
  IntentMessage,
  IntentProgress,

  // Directive
  vIntent,

  // Plugin
  VueIntentPlugin
} from './index'

export type __VueIntentExportedTypes =
  | Intent
  | IntentState
  | IntentNavigationOptions
  | VueIntentPluginOptions
  | IntentStep
  | MessageType
  | ShowWhen
  | IntentGuardProps
  | IntentMessageProps
  | IntentProgressProps
  | IntentDirectiveModifier
  | UseIntentReturn
  | UseIntentNavigationReturn
  | UseIntentStateReturn

export const __vueIntentExportCheck = {
  useIntent,
  useIntentNavigation,
  useIntentState,
  IntentGuard,
  IntentMessage,
  IntentProgress,
  vIntent,
  VueIntentPlugin
}
