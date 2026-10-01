<!--
  One token. Spaces show as · and newlines as \n, so you can see the whitespace a token carries.
  `id` is the token ID, shown small underneath. `picked` marks the token the model chose.
-->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string; id?: number; picked?: boolean }>()

const parts = computed(() => {
  const out: { s: string; ws: boolean }[] = []
  for (const ch of props.text) {
    const ws = ch === ' ' || ch === '\n'
    const s = ch === ' ' ? '·' : ch === '\n' ? '\\n' : ch
    const last = out[out.length - 1]
    if (last && last.ws === ws) last.s += s
    else out.push({ s, ws })
  }
  return out
})
</script>

<template>
  <span class="chip" :class="{ picked }">
    <span class="chip-text"><span v-for="(p, i) in parts" :key="i" :class="{ ws: p.ws }">{{ p.s }}</span></span>
    <span v-if="id !== undefined" class="chip-id">{{ id }}</span>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.chip-text {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 20px;
  line-height: 1.25;
  padding: 2px 7px;
  border: 2px solid var(--ya-ink);
  white-space: pre;
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.ws {
  color: var(--ya-graphite);
}

.picked .chip-text {
  background: var(--ya-signal);
  border-color: #000;
  color: #000;
}

.picked .ws {
  color: #5b6168;
}

.chip-id {
  font-size: 13px;
  line-height: 1.2;
  color: var(--ya-graphite);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .chip-text {
    transition: none;
  }
}
</style>
