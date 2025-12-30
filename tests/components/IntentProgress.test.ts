import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IntentProgress from '../../src/components/IntentProgress.vue'
import type { Intent, IntentState } from '../../src/types'

function createMockIntent(initial: IntentState = 'idle'): Intent {
  let state: IntentState = initial
  const subscribers: Array<(s: IntentState) => void> = []

  return {
    id: 'progress-intent',
    state: () => state,
    isActive: () => state === 'started' || state === 'in-progress',
    isCompleted: () => state === 'completed',
    isFailed: () => state === 'failed',
    isBlocked: () => state === 'blocked',
    isWaiting: () => state === 'waiting',
    allowed: () => true,
    message: () => `Intent is ${state}`,
    start: () => {
      state = 'started'
      subscribers.forEach(cb => cb(state))
    },
    progress: () => {
      state = 'in-progress'
      subscribers.forEach(cb => cb(state))
    },
    wait: () => {
      state = 'waiting'
      subscribers.forEach(cb => cb(state))
    },
    block: () => {
      state = 'blocked'
      subscribers.forEach(cb => cb(state))
    },
    complete: () => {
      state = 'completed'
      subscribers.forEach(cb => cb(state))
    },
    fail: () => {
      state = 'failed'
      subscribers.forEach(cb => cb(state))
    },
    reset: () => {
      state = 'idle'
      subscribers.forEach(cb => cb(state))
    },
    replay: () => {
      state = 'idle'
      subscribers.forEach(cb => cb(state))
    },
    protectNavigation: () => false,
    subscribe: (callback: (s: IntentState) => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

describe('IntentProgress', () => {
  it('renders state label when no steps provided', async () => {
    const intent = createMockIntent('idle')
    const wrapper = mount(IntentProgress, {
      props: { intent, steps: [] }
    })

    expect(wrapper.text()).toContain('Not Started')

    intent.start()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Starting')
  })

  it('renders steps when provided', () => {
    const intent = createMockIntent('idle')
    const wrapper = mount(IntentProgress, {
      props: {
        intent,
        steps: [
          { id: 's1', label: 'One' },
          { id: 's2', label: 'Two' }
        ],
        showLabels: true
      }
    })

    const steps = wrapper.findAll('.intent-progress__step')
    expect(steps.length).toBe(2)
    expect(wrapper.text()).toContain('One')
    expect(wrapper.text()).toContain('Two')
  })

  it('applies pending/active/completed step classes based on state', async () => {
    const intent = createMockIntent('idle')
    const wrapper = mount(IntentProgress, {
      props: {
        intent,
        steps: [
          { id: 's1', label: 'One' },
          { id: 's2', label: 'Two' }
        ]
      }
    })

    // idle => currentStepIndex -1 => all pending
    expect(wrapper.findAll('.intent-progress__step--pending').length).toBe(2)

    intent.start()
    await wrapper.vm.$nextTick()

    // started => currentStepIndex 0 => first active, second pending
    expect(wrapper.findAll('.intent-progress__step--active').length).toBe(1)
    expect(wrapper.findAll('.intent-progress__step--pending').length).toBe(1)

    intent.complete()
    await wrapper.vm.$nextTick()

    // completed => currentStepIndex steps.length => all completed
    expect(wrapper.findAll('.intent-progress__step--completed').length).toBe(2)
  })

  it('updates linear bar width based on state when no steps', async () => {
    const intent = createMockIntent('idle')
    const wrapper = mount(IntentProgress, {
      props: { intent, steps: [], linear: true }
    })

    const getWidth = () => wrapper.find('.intent-progress__bar-fill').attributes('style')

    expect(getWidth()).toContain('width: 0%')

    intent.start()
    await wrapper.vm.$nextTick()
    expect(getWidth()).toContain('width: 25%')

    intent.progress()
    await wrapper.vm.$nextTick()
    expect(getWidth()).toContain('width: 50%')

    intent.complete()
    await wrapper.vm.$nextTick()
    expect(getWidth()).toContain('width: 100%')
  })

  it('sets aria-valuenow to progress percentage', async () => {
    const intent = createMockIntent('idle')
    const wrapper = mount(IntentProgress, {
      props: { intent, steps: [], linear: true }
    })

    expect(wrapper.attributes('aria-valuenow')).toBe('0')

    intent.progress()
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('aria-valuenow')).toBe('50')
  })
})
