import type { Directive, DirectiveBinding } from 'vue'
import type { Intent } from '../types'

/**
 * v-intent directive for binding intent state to DOM elements
 * 
 * Modifiers:
 * - disabled: Disable element when not allowed or active
 * - loading: Add loading class when active
 * - hidden: Hide element when not allowed
 * 
 * @example
 * ```vue
 * <button v-intent="createIntent">Create</button>
 * <button v-intent:disabled="createIntent">Create</button>
 * <button v-intent:loading="createIntent">Create</button>
 * <button v-intent:hidden="createIntent">Create</button>
 * ```
 */

interface IntentDirectiveElement extends HTMLElement {
  _intentUnsubscribe?: () => void
  _intentOriginalDisplay?: string
}

function updateElement(el: IntentDirectiveElement, binding: DirectiveBinding<Intent>) {
  const intent = binding.value
  if (!intent) return

  const modifier = binding.arg as 'disabled' | 'loading' | 'hidden' | undefined
  const isAllowed = intent.allowed()
  const isActive = intent.isActive()

  // Handle different modifiers
  switch (modifier) {
    case 'disabled':
      // Disable element when not allowed or when active
      if ('disabled' in el) {
        (el as HTMLButtonElement | HTMLInputElement).disabled = !isAllowed || isActive
      }
      el.setAttribute('aria-disabled', String(!isAllowed || isActive))
      if (!isAllowed || isActive) {
        el.classList.add('intent-disabled')
      } else {
        el.classList.remove('intent-disabled')
      }
      break

    case 'loading':
      // Add loading class when intent is active
      if (isActive) {
        el.classList.add('intent-loading')
        el.setAttribute('aria-busy', 'true')
      } else {
        el.classList.remove('intent-loading')
        el.setAttribute('aria-busy', 'false')
      }
      break

    case 'hidden':
      // Hide element when not allowed
      if (!isAllowed) {
        if (!el._intentOriginalDisplay) {
          el._intentOriginalDisplay = el.style.display || ''
        }
        el.style.display = 'none'
        el.setAttribute('aria-hidden', 'true')
      } else {
        el.style.display = el._intentOriginalDisplay || ''
        el.removeAttribute('aria-hidden')
      }
      break

    default:
      // Default behavior: disable when not allowed, add loading when active
      if ('disabled' in el) {
        (el as HTMLButtonElement | HTMLInputElement).disabled = !isAllowed
      }
      el.setAttribute('aria-disabled', String(!isAllowed))
      
      if (!isAllowed) {
        el.classList.add('intent-disabled')
      } else {
        el.classList.remove('intent-disabled')
      }

      if (isActive) {
        el.classList.add('intent-active')
      } else {
        el.classList.remove('intent-active')
      }
      break
  }
}

export const vIntent: Directive<IntentDirectiveElement, Intent> = {
  mounted(el, binding) {
    const intent = binding.value
    if (!intent) return

    // Initial update
    updateElement(el, binding)

    // Subscribe to intent changes
    if (intent.subscribe) {
      el._intentUnsubscribe = intent.subscribe(() => {
        updateElement(el, binding)
      })
    }
  },

  updated(el, binding) {
    updateElement(el, binding)
  },

  beforeUnmount(el) {
    // Cleanup subscription
    if (el._intentUnsubscribe) {
      el._intentUnsubscribe()
      delete el._intentUnsubscribe
    }
    delete el._intentOriginalDisplay
  }
}

export default vIntent
