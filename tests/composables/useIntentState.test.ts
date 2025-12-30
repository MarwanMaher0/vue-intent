import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useIntentState } from '../../src/composables/useIntentState'
import type { Intent, IntentState } from '../../src/types'

// Mock intent factory
function createMockIntent(): Intent {
  let currentState: IntentState = 'idle'
  const subscribers: Array<(state: IntentState) => void> = []

  return {
    id: 'test-intent',
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
      subscribers.forEach(cb => cb(currentState))
    },
    progress: (step?: string) => {
      currentState = 'in-progress'
      subscribers.forEach(cb => cb(currentState))
    },
    wait: (reason?: string) => {
      currentState = 'waiting'
      subscribers.forEach(cb => cb(currentState))
    },
    block: (reason?: string) => {
      currentState = 'blocked'
      subscribers.forEach(cb => cb(currentState))
    },
    complete: () => {
      currentState = 'completed'
      subscribers.forEach(cb => cb(currentState))
    },
    fail: (error?: unknown) => {
      currentState = 'failed'
      subscribers.forEach(cb => cb(currentState))
    },
    reset: () => {
      currentState = 'idle'
      subscribers.forEach(cb => cb(currentState))
    },
    replay: () => {
      currentState = 'idle'
      subscribers.forEach(cb => cb(currentState))
    },
    protectNavigation: () => true,
    subscribe: (callback: (state: IntentState) => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

describe('useIntentState', () => {
  let mockIntent: Intent

  beforeEach(() => {
    mockIntent = createMockIntent()
  })

  it('should return current state', () => {
    const { current } = useIntentState(mockIntent)
    expect(current.value).toBe('idle')
  })

  it('should track state transitions', () => {
    const { transitions, current } = useIntentState(mockIntent)

    expect(transitions.value).toEqual(['idle'])

    mockIntent.start()
    expect(current.value).toBe('started')
    expect(transitions.value).toContain('started')
  })

  it('should track previous state', () => {
    const { previous } = useIntentState(mockIntent)

    expect(previous.value).toBe(null)

    mockIntent.start()
    mockIntent.progress()

    expect(previous.value).toBe('started')
  })

  it('should check if in specific state', () => {
    const { isIn } = useIntentState(mockIntent)

    expect(isIn('idle')).toBe(true)
    expect(isIn('started')).toBe(false)

    mockIntent.start()
    expect(isIn('started')).toBe(true)
  })

  it('should check if in multiple states', () => {
    const { isIn } = useIntentState(mockIntent)

    expect(isIn(['idle', 'started'])).toBe(true)

    mockIntent.complete()
    expect(isIn(['idle', 'started'])).toBe(false)
    expect(isIn(['completed', 'failed'])).toBe(true)
  })

  it('should track duration', async () => {
    const { duration } = useIntentState(mockIntent)

    expect(duration.value).toBe(0)

    mockIntent.start()

    // Wait a bit and check duration increased
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(duration.value).toBeGreaterThan(0)
  })

  it('cleans up interval and subscription on unmount', () => {
    const unsubscribe = vi.fn()
    ;(mockIntent as any).subscribe = vi.fn(() => unsubscribe)

    const clearSpy = vi.spyOn(globalThis, 'clearInterval')

    const Comp = defineComponent({
      template: `<div />`,
      setup() {
        useIntentState(mockIntent)
        return {}
      }
    })

    const wrapper = mount(Comp)
    wrapper.unmount()

    expect(unsubscribe).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalled()
  })
})
