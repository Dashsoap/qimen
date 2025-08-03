<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [String, Number],
    default: 20
  }
})
</script>