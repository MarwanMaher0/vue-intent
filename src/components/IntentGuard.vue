<template>
  <div v-if="shouldShow">
    <slot v-if="isAllowed" />
    <slot v-else name="fallback">
      <div class="intent-guard-fallback">
        {{ fallbackMessage }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Intent } from '../types'

const props = defineProps({
  intent: {
    type: Object as PropType<Intent>,
    required: true
  },
  fallback: {
    type: String,
    default: undefined
  },
  invert: {
    type: Boolean,
    default: false
  }
})

const isAllowed = computed(() => {
  const allowed = props.intent.allowed()
  return props.invert ? !allowed : allowed
})

const shouldShow = computed(() => true)

const fallbackMessage = computed(() => {
  return props.fallback || "You don't have permission to perform this action"
})
</script>

<style scoped>
.intent-guard-fallback {
  color: #666;
  font-style: italic;
}
</style>
