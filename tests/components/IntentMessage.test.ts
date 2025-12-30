import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IntentMessage from '../../src/components/IntentMessage.vue'
import type { Intent, IntentState } from '../../src/types'

// Mock intent factory
const createMockIntent = (state: IntentState = 'idle', message = 'Test message'): Intent => {
  const subscribers: Array<(state: IntentState) => void> = []

  return {
    id: 'test-intent',
    state: () => state,
    isActive: () => state === 'started' || state === 'in-progress',
    isCompleted: () => state === 'completed',
    isFailed: () => state === 'failed',
    isBlocked: () => state === 'blocked',
    isWaiting: () => state === 'waiting',
    allowed: () => true,
    message: () => message,
    start: vi.fn(),
    progress: vi.fn(),
    wait: vi.fn(),
    block: vi.fn(),
    complete: vi.fn(),
    fail: vi.fn(),
    reset: vi.fn(),
    replay: vi.fn(),
    protectNavigation: () => false,
    subscribe: (callback: (state: IntentState) => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

describe('IntentMessage', () => {
  it('should render message', () => {
    const intent = createMockIntent('idle', 'Operation ready')
    const wrapper = mount(IntentMessage, {
      props: { intent }
    })

    expect(wrapper.text()).toContain('Operation ready')
  })

  it('should apply correct type class', () => {
    const intent = createMockIntent()

    const wrapperInfo = mount(IntentMessage, {
      props: { intent, type: 'info' }
    })
    expect(wrapperInfo.classes()).toContain('intent-message--info')

    const wrapperError = mount(IntentMessage, {
      props: { intent, type: 'error' }
    })
    expect(wrapperError.classes()).toContain('intent-message--error')
  })

  it('should show/hide based on showWhen prop', () => {
    const activeIntent = createMockIntent('in-progress')
    const idleIntent = createMockIntent('idle')

    const wrapper = mount(IntentMessage, {
      props: { intent: activeIntent, showWhen: 'active' }
    })
    expect(wrapper.isVisible()).toBe(true)

    const wrapper2 = mount(IntentMessage, {
      props: { intent: idleIntent, showWhen: 'active' }
    })
    expect(wrapper2.html()).toBe('<!--v-if-->')
  })

  it('should apply custom class', () => {
    const intent = createMockIntent()
    const wrapper = mount(IntentMessage, {
      props: { intent, customClass: 'my-custom-class' }
    })

    expect(wrapper.classes()).toContain('my-custom-class')
  })

  it('should set correct aria-live attribute', () => {
    const intent = createMockIntent()

    const wrapperError = mount(IntentMessage, {
      props: { intent, type: 'error' }
    })
    expect(wrapperError.attributes('aria-live')).toBe('assertive')

    const wrapperInfo = mount(IntentMessage, {
      props: { intent, type: 'info' }
    })
    expect(wrapperInfo.attributes('aria-live')).toBe('polite')
  })
})
