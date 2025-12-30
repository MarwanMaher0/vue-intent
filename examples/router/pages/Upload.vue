<template>
  <div>
    <h2>Upload (simulated)</h2>

    <button v-intent:loading="uploadIntent" @click="startUpload" :disabled="isActive">
      {{ isActive ? 'Uploading…' : 'Start Upload' }}
    </button>

    <IntentMessage :intent="uploadIntent" type="info" show-when="always" />

    <p v-if="protectionActive" class="warning">
      Navigation protection active. Try clicking “Home”.
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { IntentMessage, useIntent, useIntentNavigation } from '../../../src'
import type { Intent, IntentState } from '../../../src/types'

function createIntent(id: string): Intent {
  let state: IntentState = 'idle'
  const subscribers: Array<(s: IntentState) => void> = []

  return {
    id,
    state: () => state,
    isActive: () => state === 'started' || state === 'in-progress',
    isCompleted: () => state === 'completed',
    isFailed: () => state === 'failed',
    isBlocked: () => state === 'blocked',
    isWaiting: () => state === 'waiting',
    allowed: () => true,
    message: () => `${id} is ${state}`,
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
    protectNavigation: () => true,
    subscribe: (callback: (s: IntentState) => void) => {
      subscribers.push(callback)
      return () => {
        const index = subscribers.indexOf(callback)
        if (index > -1) subscribers.splice(index, 1)
      }
    }
  }
}

const uploadIntent = createIntent('upload')
const upload = reactive(useIntent(uploadIntent))
const { protectionActive } = useIntentNavigation(uploadIntent, {
  confirmMessage: 'Upload is in progress. Leave anyway?'
})

const { isActive } = upload

async function startUpload() {
  upload.start()
  upload.progress('chunk-1')
  await new Promise(resolve => setTimeout(resolve, 1000))
  upload.progress('chunk-2')
  await new Promise(resolve => setTimeout(resolve, 1000))
  upload.complete()
}
</script>

<style scoped>
.warning {
  margin-top: 12px;
}
</style>
