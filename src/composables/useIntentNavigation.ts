import { computed, onUnmounted, getCurrentInstance, ref, type ComputedRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import type { Intent, IntentNavigationOptions } from '../types'

/**
 * Return type for useIntentNavigation composable
 */
export interface UseIntentNavigationReturn {
  /** Whether navigation is currently safe */
  canLeave: ComputedRef<boolean>

  /** Whether navigation protection is currently active */
  protectionActive: ComputedRef<boolean>
}

/**
 * Composable for protecting navigation during active intents
 *
 * @param intent - The intent to protect
 * @param options - Optional configuration
 * @returns Navigation state
 *
 * @example
 * ```vue
 * import { useIntent, useIntentNavigation } from 'vue-intention-core'
 * import { useIntent, useIntentNavigation } from 'vue-intention'
 *
 * const uploadIntent = createIntent({ id: 'upload-file' })
 * const { isActive } = useIntent(uploadIntent)
 * const { canLeave } = useIntentNavigation(uploadIntent, {
 *   confirmMessage: 'Upload is in progress. Are you sure?'
 * })
 * </script>
 * ```
 */
export function useIntentNavigation(
  intent: Intent,
  options: IntentNavigationOptions = {}
): UseIntentNavigationReturn {
  const {
    confirmMessage = 'An operation is in progress. Are you sure you want to leave?',
    onBeforeLeave,
    onAfterLeave
  } = options

  // Track intent state reactively when subscribe is available
  const isActive = ref(intent.isActive())
  const protectNavigation = ref(intent.protectNavigation())

  const sync = () => {
    isActive.value = intent.isActive()
    protectNavigation.value = intent.protectNavigation()
  }

  let unsubscribe: (() => void) | undefined
  if (intent.subscribe) {
    unsubscribe = intent.subscribe(() => {
      sync()
    })
  }

  // Computed properties
  const protectionActive = computed(() => {
    return protectNavigation.value && isActive.value
  })

  const canLeave = computed(() => {
    return !protectionActive.value
  })

  // Handle browser beforeunload event
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (protectionActive.value) {
      event.preventDefault()
      event.returnValue = confirmMessage
      return confirmMessage
    }
  }

  // Add beforeunload listener
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  // Cleanup on unmount
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    })
  }

  // Integrate with Vue Router if available
  try {
    onBeforeRouteLeave(async (to, from, next) => {
      void to
      void from

      // Ensure we check the latest intent status
      sync()
      if (!protectionActive.value) {
        if (onAfterLeave) {
          onAfterLeave()
        }
        next()
        return
      }

      // Call onBeforeLeave hook
      if (onBeforeLeave) {
        await onBeforeLeave()
      }

      // Show confirmation
      const confirmed = window.confirm(confirmMessage)

      if (confirmed) {
        if (onAfterLeave) {
          onAfterLeave()
        }
        next()
      } else {
        next(false)
      }
    })
  } catch (error) {
    // Vue Router not available, silently skip
    console.debug('Vue Router not available for navigation protection')
  }

  return {
    canLeave,
    protectionActive
  }
}
