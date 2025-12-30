<template>
  <div>
    <p>
      Go to <RouterLink to="/upload">Upload</RouterLink> and start an intent.
      While it’s active, navigation away will ask for confirmation.
    </p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
