<template>
  <div class="intent-progress" role="progressbar" :aria-valuenow="progressPercentage">
    <div v-if="props.showLabels && hasSteps" class="intent-progress__steps">
      <div
        v-for="(step, index) in props.steps"
        :key="step.id"
        :class="getStepClass(index)"
        class="intent-progress__step"
      >
        <div class="intent-progress__step-marker">
          {{ index + 1 }}
        </div>
        <div class="intent-progress__step-label">
          {{ step.label }}
        </div>
      </div>
    </div>

    <div v-if="props.linear" class="intent-progress__bar">
      <div
        class="intent-progress__bar-fill"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>

    <div v-if="!hasSteps" class="intent-progress__state">
      {{ stateLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { Intent, IntentStep } from '../types'
import { useIntentState } from '../composables/useIntentState'

const props = defineProps({
  intent: {
    type: Object as PropType<Intent>,
    required: true
  },
  steps: {
    type: Array as PropType<IntentStep[]>,
    default: () => []
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  linear: {
    type: Boolean,
    default: true
  }
})

const { current } = useIntentState(props.intent)

const hasSteps = computed(() => props.steps && props.steps.length > 0)

const currentStepIndex = computed(() => {
  // This is a simplified version - in real implementation,
  // you'd track which step the intent is currently on
  if (current.value === 'idle') return -1
  if (current.value === 'completed') return props.steps.length
  return 0 // Default to first step if active
})

const progressPercentage = computed(() => {
  if (!hasSteps.value) {
    switch (current.value) {
      case 'idle':
        return 0
      case 'started':
        return 25
      case 'in-progress':
        return 50
      case 'waiting':
        return 50
      case 'completed':
        return 100
      case 'failed':
        return 0
      default:
        return 0
    }
  }

  if (props.steps.length === 0) return 0
  return Math.round((currentStepIndex.value / props.steps.length) * 100)
})

const stateLabel = computed(() => {
  const labels: Record<string, string> = {
    idle: 'Not Started',
    started: 'Starting...',
    'in-progress': 'In Progress',
    waiting: 'Waiting',
    blocked: 'Blocked',
    completed: 'Completed',
    failed: 'Failed'
  }
  return labels[current.value] || current.value
})

const getStepClass = (index: number) => {
  const classes = []
  if (index < currentStepIndex.value) {
    classes.push('intent-progress__step--completed')
  } else if (index === currentStepIndex.value) {
    classes.push('intent-progress__step--active')
  } else {
    classes.push('intent-progress__step--pending')
  }
  return classes.join(' ')
}
</script>

<style scoped>
.intent-progress {
  width: 100%;
}

.intent-progress__steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.intent-progress__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.intent-progress__step-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  background-color: #e0e0e0;
  color: #757575;
}

.intent-progress__step--completed .intent-progress__step-marker {
  background-color: #4caf50;
  color: white;
}

.intent-progress__step--active .intent-progress__step-marker {
  background-color: #2196f3;
  color: white;
}

.intent-progress__step-label {
  font-size: 12px;
  text-align: center;
  color: #757575;
}

.intent-progress__step--active .intent-progress__step-label {
  color: #2196f3;
  font-weight: 600;
}

.intent-progress__bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.intent-progress__bar-fill {
  height: 100%;
  background-color: #2196f3;
  transition: width 0.3s ease;
}

.intent-progress__state {
  text-align: center;
  font-size: 14px;
  color: #757575;
  margin-top: 8px;
}
</style>
