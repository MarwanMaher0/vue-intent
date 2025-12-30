import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { vIntent } from '../../src/directives/v-intent'
import type { Intent, IntentState } from '../../src/types'

function createMockIntent(initial: IntentState = 'idle', allowed = true) {
  let state: IntentState = initial
  let isAllowed = allowed
  const subscribers: Array<() => void> = []

  const intent: Intent = {
    id: 'directive-intent',
    state: () => state,
    isActive: () => state === 'started' || state === 'in-progress',
    isCompleted: () => state === 'completed',
    isFailed: () => state === 'failed',
    isBlocked: () => state === 'blocked',
    isWaiting: () => state === 'waiting',
    allowed: () => isAllowed,
    message: () => `Intent is ${state}`,
    start: () => {
      state = 'started'
      subscribers.forEach(cb => cb())
    },
    progress: () => {
      state = 'in-progress'
      subscribers.forEach(cb => cb())
    },
    wait: () => {
      state = 'waiting'
      subscribers.forEach(cb => cb())
    },
    block: () => {
      state = 'blocked'
      subscribers.forEach(cb => cb())
    },
    complete: () => {
      state = 'completed'
      subscribers.forEach(cb => cb())
    },
    fail: () => {
      state = 'failed'
      subscribers.forEach(cb => cb())
    },
    reset: () => {
      state = 'idle'
      subscribers.forEach(cb => cb())
    },
    replay: () => {
      state = 'idle'
      subscribers.forEach(cb => cb())
    },
    protectNavigation: () => false,
    subscribe: (callback: () => void) => {
      subscribers.push(callback)
      return () => {
        const idx = subscribers.indexOf(callback)
        if (idx > -1) subscribers.splice(idx, 1)
      }
    }
  }

  return {
    intent,
    setAllowed(value: boolean) {
      isAllowed = value
      subscribers.forEach(cb => cb())
    }
  }
}

describe('v-intent directive', () => {
  it('default behavior disables when not allowed and toggles active class', async () => {
    const { intent, setAllowed } = createMockIntent('idle', true)

    const Comp = defineComponent({
      template: `<button v-intent="intent">Do</button>`,
      setup() {
        return { intent }
      }
    })

    const wrapper = mount(Comp, {
      global: { directives: { intent: vIntent } }
    })

    const btn = wrapper.get('button').element as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    expect(btn.getAttribute('aria-disabled')).toBe('false')

    setAllowed(false)
    await nextTick()

    expect(btn.disabled).toBe(true)
    expect(btn.getAttribute('aria-disabled')).toBe('true')
    expect(btn.classList.contains('intent-disabled')).toBe(true)

    // active class
    intent.start()
    await nextTick()
    expect(btn.classList.contains('intent-active')).toBe(true)
  })

  it('arg disabled disables when active OR not allowed', async () => {
    const { intent, setAllowed } = createMockIntent('idle', true)

    const Comp = defineComponent({
      template: `<button v-intent:disabled="intent">Do</button>`,
      setup() {
        return { intent }
      }
    })

    const wrapper = mount(Comp, {
      global: { directives: { intent: vIntent } }
    })

    const btn = wrapper.get('button').element as HTMLButtonElement
    expect(btn.disabled).toBe(false)

    intent.start()
    await nextTick()
    expect(btn.disabled).toBe(true)

    intent.reset()
    setAllowed(false)
    await nextTick()
    expect(btn.disabled).toBe(true)
  })

  it('arg loading toggles loading class and aria-busy', async () => {
    const { intent } = createMockIntent('idle', true)

    const Comp = defineComponent({
      template: `<button v-intent:loading="intent">Do</button>`,
      setup() {
        return { intent }
      }
    })

    const wrapper = mount(Comp, {
      global: { directives: { intent: vIntent } }
    })

    const btn = wrapper.get('button')
    expect(btn.classes()).not.toContain('intent-loading')
    expect(btn.attributes('aria-busy')).toBe('false')

    intent.start()
    await nextTick()
    expect(btn.classes()).toContain('intent-loading')
    expect(btn.attributes('aria-busy')).toBe('true')
  })

  it('arg hidden hides when not allowed and restores display when allowed', async () => {
    const { intent, setAllowed } = createMockIntent('idle', true)

    const Comp = defineComponent({
      template: `<button v-intent:hidden="intent" :style="{ display }">Do</button>`,
      setup() {
        return { intent, display: 'inline-block' }
      }
    })

    const wrapper = mount(Comp, {
      global: { directives: { intent: vIntent } }
    })

    const btn = wrapper.get('button').element as HTMLButtonElement
    expect(btn.style.display).not.toBe('none')

    setAllowed(false)
    await nextTick()

    expect(btn.style.display).toBe('none')
    expect(btn.getAttribute('aria-hidden')).toBe('true')

    setAllowed(true)
    await nextTick()

    expect(btn.style.display).not.toBe('none')
    expect(btn.getAttribute('aria-hidden')).toBe(null)
  })

  it('unsubscribes on unmount', () => {
    const { intent } = createMockIntent('idle', true)
    const unsubscribe = vi.fn()
    ;(intent as any).subscribe = vi.fn(() => unsubscribe)

    const Comp = defineComponent({
      template: `<button v-intent="intent">Do</button>`,
      setup() {
        return { intent }
      }
    })

    const wrapper = mount(Comp, {
      global: { directives: { intent: vIntent } }
    })

    wrapper.unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
