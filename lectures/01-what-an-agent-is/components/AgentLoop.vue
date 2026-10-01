<script setup lang="ts">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()
const active = computed(() => Math.min($clicks.value, 5))

const steps = [
  { title: 'User', detail: '“What is in this workspace?”' },
  { title: 'LLM call 1', detail: 'Choose tools and arguments' },
  { title: 'Tool', detail: 'bash: pwd, ls, find' },
  { title: 'Result', detail: 'Files and directories' },
  { title: 'LLM call 2', detail: 'read: README, package.json…' },
  { title: 'Answer', detail: 'Summarize the workspace' },
]
</script>

<template>
  <div class="loop" :style="{ '--active': active }">
    <div v-for="(step, i) in steps" :key="step.title" class="step" :class="{ on: i <= active, current: i === active }">
      <span class="number">{{ i + 1 }}</span>
      <div><b>{{ step.title }}</b><small>{{ step.detail }}</small></div>
      <span v-if="i < steps.length - 1" class="arrow">→</span>
    </div>
    <svg class="return" viewBox="0 0 560 45" aria-hidden="true">
      <path d="M470 5 C470 38 90 38 90 5" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M84 12 L90 4 L96 12" fill="none" stroke="currentColor" stroke-width="2" />
    </svg>
    <p class="caption">Each LLM call receives context assembled from the conversation. The model itself does not run the tool.</p>
  </div>
</template>

<style scoped>
.loop { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 36px; margin-top: 2rem; }
.step { position: relative; min-height: 96px; padding: 14px; border: 2px solid var(--ya-ink); opacity: .22; transition: opacity .25s, background-color .25s; }
.step.on { opacity: 1; }
.step.current { background: var(--ya-signal); color: #000; }
.step b, .step small { display: block; }
.step b { font-size: 20px; }
.step small { margin-top: 7px; font-size: 14px; line-height: 1.3; color: var(--ya-graphite); }
.step.current small { color: #000; }
.number { position: absolute; top: -12px; right: 10px; padding: 1px 7px; background: var(--ya-paper); border: 2px solid var(--ya-ink); font-size: 13px; }
.arrow { position: absolute; right: -29px; top: 32px; font-size: 25px; }
.step:nth-child(3) .arrow { right: auto; left: 50%; top: 104px; transform: rotate(90deg); }
.step:nth-child(4) { grid-column: 3; grid-row: 2; }
.step:nth-child(5) { grid-column: 2; grid-row: 2; }
.step:nth-child(6) { grid-column: 1; grid-row: 2; }
.step:nth-child(4) .arrow, .step:nth-child(5) .arrow { right: auto; left: -29px; transform: rotate(180deg); }
.return { position: absolute; width: 560px; height: 45px; left: 105px; top: 211px; color: var(--ya-graphite); opacity: .65; }
.caption { grid-column: 1 / -1; margin: 35px 0 0; text-align: center; font-size: 16px !important; color: var(--ya-graphite); }
@media (prefers-reduced-motion: reduce) { .step { transition: none; } }
</style>
