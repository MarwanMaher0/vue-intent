<template>
  <div
    v-if="shouldShow"
    :class="messageClasses"
    role="status"
    :aria-live="ariaLive"
  >
    {{ displayMessage }}
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Intent, MessageType, ShowWhen } from '../types'
import { useIntent } from '../composables/useIntent'

const props = defineProps({
  intent: {
    type: Object as PropType<Intent>,
    required: true
  },
  type: {
    type: String as PropType<MessageType>,
    default: 'info'
  },
  showWhen: {
    type: String as PropType<ShowWhen>,
    default: 'always'
  },
  customClass: {
    type: String,
    default: ''
  }
})

const { message, isActive, isBlocked, isFailed } = useIntent(props.intent)

const shouldShow = computed(() => {
  switch (props.showWhen) {
    case 'active':
      return isActive.value
    case 'blocked':
      return isBlocked.value
    case 'failed':
      return isFailed.value
    case 'always':
    default:
      return true
  }
})

const displayMessage = computed(() => message.value)

const messageClasses = computed(() => {
  const classes = ['intent-message', `intent-message--${props.type}`]
  if (props.customClass) {
    classes.push(props.customClass)
  }
  return classes.join(' ')
})

const ariaLive = computed(() => {
  return props.type === 'error' ? 'assertive' : 'polite'
})
</script>

<style scoped>
.intent-message {
  padding: 12px 16px;
  border-radius: 4px;
  margin: 8px 0;
  font-size: 14px;
}

.intent-message--info {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left: 4px solid #1976d2;
}

.intent-message--warning {
  background-color: #fff3e0;
  color: #f57c00;
  border-left: 4px solid #f57c00;
}

.intent-message--error {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.intent-message--success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}
</style>
