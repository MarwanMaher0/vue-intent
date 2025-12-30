import type { App, Plugin } from 'vue'
import type { VueIntentPluginOptions } from './types'

import IntentGuard from './components/IntentGuard.vue'
import IntentMessage from './components/IntentMessage.vue'
import IntentProgress from './components/IntentProgress.vue'

// Import directive
import { vIntent } from './directives/v-intent'

/**
 * Vue Intent Plugin for global registration
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { VueIntentPlugin } from 'vue-intention'
 *
 * const app = createApp(App)
 * app.use(VueIntentPlugin, {
 *   router, // optional
 *   components: {
 *     prefix: 'Intent' // optional, default prefix
 *   }
 * })
 * ```
 */
export const VueIntentPlugin: Plugin = {
  install(app: App, options: VueIntentPluginOptions = {}) {
    const { components = {}, router } = options
    const { prefix = 'Intent' } = components

    // Register components globally
    app.component(`${prefix}Guard`, IntentGuard)
    app.component(`${prefix}Message`, IntentMessage)
    app.component(`${prefix}Progress`, IntentProgress)

    // Register directive globally
    app.directive('intent', vIntent)

    // Store router in app config if provided
    if (router) {
      app.provide('vueIntentRouter', router)
    }

    // Provide global configuration
    app.provide('vueIntentConfig', options)
  }
}

export default VueIntentPlugin
