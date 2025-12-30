import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIntent } from '../../src/composables/useIntent'
import type { Intent, IntentState } from '../../src/types'

// Mock intent factory
function createMockIntent(overrides: Partial<Intent> = {}): Intent {
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
    },
    ...overrides
  }
}

describe('useIntent', () => {
  let mockIntent: Intent

  beforeEach(() => {
    mockIntent = createMockIntent()
  })

  it('should return reactive state', () => {
    const { state } = useIntent(mockIntent)
    expect(state.value).toBe('idle')
  })

  it('should track isActive computed property', () => {
    const { isActive, start } = useIntent(mockIntent)

    expect(isActive.value).toBe(false)
    start()
    expect(isActive.value).toBe(true)
  })

  it('should track isCompleted computed property', () => {
    const { isCompleted, complete } = useIntent(mockIntent)

    expect(isCompleted.value).toBe(false)
    complete()
    expect(isCompleted.value).toBe(true)
  })

  it('should track isFailed computed property', () => {
    const { isFailed, fail } = useIntent(mockIntent)

    expect(isFailed.value).toBe(false)
    fail()
    expect(isFailed.value).toBe(true)
  })

  it('should update state on start', () => {
    const { state, start } = useIntent(mockIntent)

    start()
    expect(state.value).toBe('started')
  })

  it('should update state on progress', () => {
    const { state, progress } = useIntent(mockIntent)

    progress('step-1')
    expect(state.value).toBe('in-progress')
  })

  it('should update state on complete', () => {
    const { state, complete } = useIntent(mockIntent)

    complete()
    expect(state.value).toBe('completed')
  })

  it('should return allowed status', () => {
    const { allowed } = useIntent(mockIntent)
    expect(allowed.value).toBe(true)
  })

  it('should return human-readable message', () => {
    const { message, start } = useIntent(mockIntent)

    expect(message.value).toBe('Intent is idle')
    start()
    expect(message.value).toBe('Intent is started')
  })

  it('should handle intent without subscribe method', () => {
    const intentWithoutSubscribe = createMockIntent()
    delete (intentWithoutSubscribe as Partial<Intent>).subscribe

    expect(() => {
      useIntent(intentWithoutSubscribe)
    }).not.toThrow()
  })

  it('should support wait/block/reset/replay and reflect computed flags', () => {
    const { state, isWaiting, isBlocked, isActive, wait, block, reset, replay } = useIntent(mockIntent)

    expect(state.value).toBe('idle')
    expect(isActive.value).toBe(false)

    wait('because')
    expect(state.value).toBe('waiting')
    expect(isWaiting.value).toBe(true)

    block('nope')
    expect(state.value).toBe('blocked')
    expect(isBlocked.value).toBe(true)

    reset()
    expect(state.value).toBe('idle')

    replay()
    expect(state.value).toBe('idle')
  })

  it('should pass arguments through to intent methods', () => {
    const progressSpy = vi.fn()
    const waitSpy = vi.fn()
    const blockSpy = vi.fn()
    const failSpy = vi.fn()

    const argIntent = createMockIntent({
      progress: progressSpy,
      wait: waitSpy,
      block: blockSpy,
      fail: failSpy
    })

    const { progress, wait, block, fail } = useIntent(argIntent)

    progress('step-xyz')
    wait('reason-xyz')
    block('blocked-xyz')
    fail(new Error('boom'))

    expect(progressSpy).toHaveBeenCalledWith('step-xyz')
    expect(waitSpy).toHaveBeenCalledWith('reason-xyz')
    expect(blockSpy).toHaveBeenCalledWith('blocked-xyz')
    expect(failSpy).toHaveBeenCalledWith(expect.any(Error))
  })
})
