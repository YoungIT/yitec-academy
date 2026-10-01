<!-- The YITEC Academy mark. `blink` animates the cursor. -->
<script setup lang="ts">
defineProps<{ blink?: boolean }>()
</script>

<template>
  <svg viewBox="20 41 220 118" fill="currentColor" role="img" aria-label="YITEC Academy">
    <path d="M20 41 L37 41 L66.75 84.75 L60.9 101.1 Z M87 41 L105 41 L62.5 159 L44.5 159 Z M110 41 L180.5 41 L174 59 L122 59 L86.5 159 L68 159 Z" />
    <path :class="{ 'ya-blink': blink }" d="M196 141 L240 141 L233.45 159 L189.45 159 Z" />
  </svg>
</template>

<style scoped>
.ya-blink {
  animation: ya-blink 1.1s steps(1) infinite;
}

@keyframes ya-blink {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ya-blink {
    animation: none;
  }
}
</style>
