<template>
  <div class="app">
    <h1>Vue Intent - Basic Example</h1>

    <div class="example-section">
      <h2>1. Simple Button Action</h2>
      <IntentGuard :intent="saveIntent">
        <button v-intent:loading="saveIntent" @click="handleSave">
          {{ saveState.isActive ? 'Saving...' : 'Save Data' }}
        </button>
        <template #fallback>
          <p class="error">You don't have permission to save</p>
        </template>
      </IntentGuard>

      <IntentMessage
        :intent="saveIntent"
        :type="saveState.isFailed ? 'error' : 'success'"
        show-when="always"
      />

      <div class="state-info">
        <p><strong>State:</strong> {{ saveState.state }}</p>
        <p><strong>Allowed:</strong> {{ saveState.allowed }}</p>
        <p><strong>Message:</strong> {{ saveState.message }}</p>
      </div>
    </div>

    <div class="example-section">
      <h2>2. Multi-Step Process</h2>

      <IntentProgress
        :intent="processIntent"
        :steps="processSteps"
        :show-labels="true"
        :linear="true"
      />

      <div class="step-controls">
        <button
          @click="startProcess"
          :disabled="processState.isActive"
          v-if="!processState.isActive && !processState.isCompleted"
        >
          Start Process
        </button>

        <button @click="nextStep" :disabled="!processState.isActive" v-if="processState.isActive">
          Next Step
        </button>

        <button
          @click="completeProcess"
          v-if="currentStep === processSteps.length - 1 && processState.isActive"
        >
          Complete
        </button>

        <button @click="resetProcess" v-if="processState.isCompleted">Reset</button>
      </div>

      <IntentMessage :intent="processIntent" type="info" show-when="active" />
    </div>

    <div class="example-section">
      <h2>3. File Upload with Navigation Protection</h2>

      <input type="file" @change="handleFileSelect" :disabled="uploadState.isActive" />

      <button
        v-intent:loading="uploadIntent"
        @click="simulateUpload"
        :disabled="!selectedFile || uploadState.isActive"
      >
        {{ uploadState.isActive ? 'Uploading...' : 'Upload File' }}
      </button>

      <IntentMessage :intent="uploadIntent" type="info" />

      <div v-if="protectionActive" class="warning">
        ⚠️ Navigation protection is active - don't refresh the page!
      </div>
    </div>

    <div class="example-section">
      <h2>4. State Tracking</h2>

      <button @click="trackingIntent.start()">Start</button>
      <button @click="trackingIntent.progress()">Progress</button>
      <button @click="trackingIntent.wait()">Wait</button>
      <button @click="trackingIntent.complete()">Complete</button>
      <button @click="trackingIntent.reset()">Reset</button>

      <div class="state-tracking">
        <p><strong>Current:</strong> {{ trackingState.current }}</p>
        <p><strong>Previous:</strong> {{ trackingState.previous || 'none' }}</p>
        <p><strong>Duration:</strong> {{ Math.round(trackingState.duration / 1000) }}s</p>
        <p><strong>Transitions:</strong> {{ trackingState.transitions.join(' → ') }}</p>
        <p><strong>Is In Progress?</strong> {{ trackingState.isIn(['started', 'in-progress']) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  useIntent,
  useIntentNavigation,
  useIntentState,
  IntentGuard,
  IntentMessage,
  IntentProgress
} from '../../src/index'

// Mock intent factory (replace with actual behavior-runtime-core in production)
function createIntent(config: any) {
  let state = 'idle'
  const subscribers: Array<(s: string) => void> = []

  return {
    id: config.id,
    state: () => state,
    isActive: () => state === 'started' || state === 'in-progress',
    isCompleted: () => state === 'completed',
    isFailed: () => state === 'failed',
    isBlocked: () => state === 'blocked',
    isWaiting: () => state === 'waiting',
    allowed: () => config.allowed !== false,
    message: () => `${config.id} is ${state}`,
    start: () => {
      state = 'started'
      subscribers.forEach(cb => cb(state))
    },
    progress: (step?: string) => {
      state = 'in-progress'
      subscribers.forEach(cb => cb(state))
    },
    wait: (reason?: string) => {
      state = 'waiting'
      subscribers.forEach(cb => cb(state))
    },
    block: (reason?: string) => {
      state = 'blocked'
      subscribers.forEach(cb => cb(state))
    },
    complete: () => {
      state = 'completed'
      subscribers.forEach(cb => cb(state))
    },
    fail: (error?: any) => {
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
    protectNavigation: () => true,
    subscribe: (callback: (s: string) => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

// Example 1: Simple save
const saveIntent = createIntent({ id: 'save-data' })
const saveState = reactive(useIntent(saveIntent))

async function handleSave() {
  saveState.start()
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  saveState.complete()
}

// Example 2: Multi-step process
const processIntent = createIntent({ id: 'multi-step-process' })
const processState = reactive(useIntent(processIntent))

const processSteps = [
  { id: 'step-1', label: 'Initialize' },
  { id: 'step-2', label: 'Process Data' },
  { id: 'step-3', label: 'Verify' },
  { id: 'step-4', label: 'Finalize' }
]

const currentStep = ref(0)

function startProcess() {
  processState.start()
  currentStep.value = 0
}

async function nextStep() {
  currentStep.value++
  processState.progress(`step-${currentStep.value}`)

  if (currentStep.value >= processSteps.length - 1) {
    // Last step
  }
}

function completeProcess() {
  processState.complete()
  currentStep.value = 0
}

function resetProcess() {
  processState.reset()
  currentStep.value = 0
}

// Example 3: File upload with navigation protection
const uploadIntent = createIntent({ id: 'file-upload' })
const uploadState = reactive(useIntent(uploadIntent))
const { protectionActive } = useIntentNavigation(uploadIntent, {
  confirmMessage: 'Upload in progress. Are you sure you want to leave?'
})

const selectedFile = ref<File | null>(null)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

async function simulateUpload() {
  uploadState.start()

  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 300))
    uploadState.progress(`${i}% uploaded`)
  }

  uploadState.complete()
}

// Example 4: State tracking
const trackingIntent = createIntent({ id: 'tracking-example' })
const trackingState = reactive(useIntentState(trackingIntent))
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.example-section {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

h1 {
  color: #2c3e50;
}

h2 {
  color: #42b983;
  margin-top: 0;
}

button {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  background: #42b983;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #359268;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.state-info,
.state-tracking {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.state-info p,
.state-tracking p {
  margin: 8px 0;
  font-size: 14px;
}

.error {
  color: #c62828;
  font-style: italic;
}

.warning {
  padding: 10px;
  background: #fff3e0;
  color: #f57c00;
  border-left: 4px solid #f57c00;
  margin-top: 10px;
  border-radius: 4px;
}

.step-controls {
  margin: 20px 0;
}

input[type='file'] {
  margin: 10px 0;
}
</style>
