import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import IntentGuard from '../../src/components/IntentGuard.vue'
import type { Intent } from '../../src/types'

// Mock intent
const createMockIntent = (allowed = true): Intent => ({
  id: 'test-intent',
  state: () => 'idle',
  isActive: () => false,
  isCompleted: () => false,
  isFailed: () => false,
  isBlocked: () => false,
  isWaiting: () => false,
  allowed: () => allowed,
  message: () => 'Test message',
  start: vi.fn(),
  progress: vi.fn(),
  wait: vi.fn(),
  block: vi.fn(),
  complete: vi.fn(),
  fail: vi.fn(),
  reset: vi.fn(),
  replay: vi.fn(),
  protectNavigation: () => false
})

describe('IntentGuard', () => {
  it('should render default slot when allowed', () => {
    const intent = createMockIntent(true)
    const wrapper = mount(IntentGuard, {
      props: { intent },
      slots: {
        default: '<button>Create</button>'
      }
    })

    expect(wrapper.html()).toContain('Create')
  })

  it('should render fallback slot when not allowed', () => {
    const intent = createMockIntent(false)
    const wrapper = mount(IntentGuard, {
      props: { intent },
      slots: {
        default: '<button>Create</button>',
        fallback: '<p>No permission</p>'
      }
    })

    expect(wrapper.html()).toContain('No permission')
    expect(wrapper.html()).not.toContain('Create')
  })

  it('should render default fallback message when not allowed and no fallback slot', () => {
    const intent = createMockIntent(false)
    const wrapper = mount(IntentGuard, {
      props: { intent },
      slots: {
        default: '<button>Create</button>'
      }
    })

    expect(wrapper.text()).toContain("You don't have permission")
  })

  it('should respect invert prop', () => {
    const intent = createMockIntent(true)
    const wrapper = mount(IntentGuard, {
      props: {
        intent,
        invert: true
      },
      slots: {
        default: '<button>Create</button>',
        fallback: '<p>Inverted</p>'
      }
    })

    // When inverted, allowed=true should show fallback
    expect(wrapper.html()).toContain('Inverted')
  })

  it('should use custom fallback prop', () => {
    const intent = createMockIntent(false)
    const wrapper = mount(IntentGuard, {
      props: {
        intent,
        fallback: 'Custom message'
      },
      slots: {
        default: '<button>Create</button>'
      }
    })

    expect(wrapper.text()).toContain('Custom message')
  })
})
