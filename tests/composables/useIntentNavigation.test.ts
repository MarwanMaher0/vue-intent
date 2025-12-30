import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

// We mock vue-router so `onBeforeRouteLeave` can be invoked in tests without a real router.
vi.mock('vue-router', () => {
  return {
    onBeforeRouteLeave: (handler: any) => {
      if ((globalThis as any).__vueIntent_throwOnBeforeRouteLeave) {
        throw new Error('router not available')
      }
      ;(globalThis as any).__vueIntent_onBeforeRouteLeave = handler
    }
  }
})

import { useIntentNavigation } from '../../src/composables/useIntentNavigation'
import type { Intent, IntentState } from '../../src/types'

function createMockIntent(state: IntentState = 'idle', protect = true): Intent {
  let currentState = state
  const subscribers: Array<() => void> = []

  return {
    id: 'nav-intent',
    state: () => currentState,
    isActive: () => currentState === 'started' || currentState === 'in-progress',
    isCompleted: () => currentState === 'completed',
    isFailed: () => currentState === 'failed',
    isBlocked: () => currentState === 'blocked',
    isWaiting: () => currentState === 'waiting',
    allowed: () => true,
    message: () => `Intent is ${currentState}`,
    start: () => {
      currentState = 'started'
      subscribers.forEach(cb => cb())
    },
    progress: () => {
      currentState = 'in-progress'
      subscribers.forEach(cb => cb())
    },
    wait: () => {
      currentState = 'waiting'
      subscribers.forEach(cb => cb())
    },
    block: () => {
      currentState = 'blocked'
      subscribers.forEach(cb => cb())
    },
    complete: () => {
      currentState = 'completed'
      subscribers.forEach(cb => cb())
    },
    fail: () => {
      currentState = 'failed'
      subscribers.forEach(cb => cb())
    },
    reset: () => {
      currentState = 'idle'
      subscribers.forEach(cb => cb())
    },
    replay: () => {
      currentState = 'idle'
      subscribers.forEach(cb => cb())
    },
    protectNavigation: () => protect,
    subscribe: (callback: () => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

describe('useIntentNavigation', () => {
  beforeEach(() => {
    ;(globalThis as any).__vueIntent_onBeforeRouteLeave = undefined
    ;(globalThis as any).__vueIntent_throwOnBeforeRouteLeave = false
  })

  afterEach(() => {
    ;(globalThis as any).__vueIntent_onBeforeRouteLeave = undefined
    ;(globalThis as any).__vueIntent_throwOnBeforeRouteLeave = false
  })

  it('computes protectionActive and canLeave based on intent state', async () => {
    const intent = createMockIntent('idle', true)

    const Comp = defineComponent({
      template: `<div />`,
      setup() {
        return useIntentNavigation(intent)
      }
    })

    const wrapper = mount(Comp)

    expect((wrapper.vm as any).protectionActive).toBe(false)
    expect((wrapper.vm as any).canLeave).toBe(true)

    intent.start()
    await nextTick()

    expect((wrapper.vm as any).protectionActive).toBe(true)
    expect((wrapper.vm as any).canLeave).toBe(false)

    wrapper.unmount()
  })

  it('registers beforeunload listener and blocks unload when active', () => {
    const intent = createMockIntent('in-progress', true)
    const addListenerSpy = vi.spyOn(window, 'addEventListener')

    const Comp = defineComponent({
      template: `<div />`,
      setup() {
        useIntentNavigation(intent, { confirmMessage: 'Do not leave' })
        return {}
      }
    })

    mount(Comp)

    expect(addListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    const handler = addListenerSpy.mock.calls.find(c => c[0] === 'beforeunload')?.[1] as any
    expect(typeof handler).toBe('function')

    const event = { preventDefault: vi.fn(), returnValue: '' } as any
    const returned = handler(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.returnValue).toBe('Do not leave')
    expect(returned).toBe('Do not leave')
  })

  it('uses router leave guard: confirms and calls next(false) on cancel', async () => {
    const intent = createMockIntent('in-progress', true)
    const onBeforeLeave = vi.fn()
    const onAfterLeave = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    useIntentNavigation(intent, {
      confirmMessage: 'Leave?',
      onBeforeLeave,
      onAfterLeave
    })

    const handler = (globalThis as any).__vueIntent_onBeforeRouteLeave
    expect(handler).toBeTruthy()

    const next = vi.fn()
    await handler({} as any, {} as any, next)

    expect(onBeforeLeave).toHaveBeenCalled()
    expect(confirmSpy).toHaveBeenCalledWith('Leave?')
    expect(onAfterLeave).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(false)
  })

  it('uses router leave guard: proceeds and calls onAfterLeave on confirm', async () => {
    const intent = createMockIntent('in-progress', true)
    const onBeforeLeave = vi.fn()
    const onAfterLeave = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    useIntentNavigation(intent, {
      confirmMessage: 'Leave?',
      onBeforeLeave,
      onAfterLeave
    })

    const handler = (globalThis as any).__vueIntent_onBeforeRouteLeave
    const next = vi.fn()
    await handler({} as any, {} as any, next)

    expect(onBeforeLeave).toHaveBeenCalled()
    expect(onAfterLeave).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
  })

  it('when not protected, calls onAfterLeave and next() without confirm', async () => {
    const intent = createMockIntent('idle', true)
    const onAfterLeave = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm')

    useIntentNavigation(intent, { onAfterLeave })

    const handler = (globalThis as any).__vueIntent_onBeforeRouteLeave
    const next = vi.fn()
    await handler({} as any, {} as any, next)

    expect(onAfterLeave).toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
    expect(confirmSpy).not.toHaveBeenCalled()
  })

  it('does not throw when router integration is unavailable', () => {
    ;(globalThis as any).__vueIntent_throwOnBeforeRouteLeave = true
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

    expect(() => useIntentNavigation(createMockIntent('idle', true))).not.toThrow()
    expect(debugSpy).toHaveBeenCalled()
  })

  it('removes beforeunload listener on component unmount', () => {
    const intent = createMockIntent('in-progress', true)
    const addListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener')

    const Comp = defineComponent({
      template: `<div />`,
      setup() {
        useIntentNavigation(intent)
        return {}
      }
    })

    const wrapper = mount(Comp)

    expect(addListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    wrapper.unmount()

    expect(removeListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })
})
