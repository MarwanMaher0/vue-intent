import { describe, it, expect, vi } from 'vitest'
import { VueIntentPlugin } from '../src/plugin'

function createMockApp() {
  return {
    component: vi.fn(),
    directive: vi.fn(),
    provide: vi.fn()
  } as any
}

describe('VueIntentPlugin', () => {
  it('registers components with default prefix', () => {
    const app = createMockApp()

    VueIntentPlugin.install(app)

    expect(app.component).toHaveBeenCalledWith('IntentGuard', expect.anything())
    expect(app.component).toHaveBeenCalledWith('IntentMessage', expect.anything())
    expect(app.component).toHaveBeenCalledWith('IntentProgress', expect.anything())
  })

  it('registers components with custom prefix', () => {
    const app = createMockApp()

    VueIntentPlugin.install(app, {
      components: { prefix: 'My' }
    })

    expect(app.component).toHaveBeenCalledWith('MyGuard', expect.anything())
    expect(app.component).toHaveBeenCalledWith('MyMessage', expect.anything())
    expect(app.component).toHaveBeenCalledWith('MyProgress', expect.anything())
  })

  it('registers intent directive and provides config', () => {
    const app = createMockApp()
    const options = { components: { prefix: 'X' } }

    VueIntentPlugin.install(app, options as any)

    expect(app.directive).toHaveBeenCalledWith('intent', expect.anything())
    expect(app.provide).toHaveBeenCalledWith('vueIntentConfig', options)
  })

  it('provides router when passed', () => {
    const app = createMockApp()
    const router = { push: vi.fn() }

    VueIntentPlugin.install(app, { router } as any)

    expect(app.provide).toHaveBeenCalledWith('vueIntentRouter', router)
  })
})
