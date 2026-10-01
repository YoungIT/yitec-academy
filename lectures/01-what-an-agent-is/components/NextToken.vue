<!--
  Next-token prediction, driven by slide clicks. Put `clicks: 5` on the slide.
  0: the prompt as text. 1: split into tokens. 2: tokens go into the model.
  3: next-token bars. 4: the top token is picked.
  5: it is appended, then the loop runs on its own (+, b, <end>).
  Token IDs are real o200k_base IDs (from js-tiktoken). Probabilities are made up.
-->
<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

const prompt = [
  { text: 'def', id: 1314 },
  { text: ' add', id: 1147 },
  { text: '(a', id: 6271 },
  { text: ',', id: 11 },
  { text: ' b', id: 287 },
  { text: '):\n', id: 1883 },
  { text: '   ', id: 271 },
  { text: ' return', id: 622 },
]

// One entry per model call: the token it picks, and the top candidates it scored (pick first).
const steps: { pick: { text: string; id: number }; cands: [string, number][] }[] = [
  { pick: { text: ' a', id: 261 }, cands: [[' a', 0.9], [' sum', 0.04], [' (', 0.02], [' int', 0.01], [' None', 0.01]] },
  { pick: { text: ' +', id: 659 }, cands: [[' +', 0.95], [' -', 0.02], [' *', 0.01], [',', 0.01], ['\n', 0.01]] },
  { pick: { text: ' b', id: 287 }, cands: [[' b', 0.97], [' a', 0.01], [' c', 0.005], [' 1', 0.004], [' (', 0.003]] },
  { pick: { text: '<end>', id: 199999 }, cands: [['<end>', 0.88], ['\n', 0.08], [' +', 0.02], [' #', 0.01], [';', 0.005]] },
]

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// After click 5 the loop plays on its own: three frames per call (feed, bars, pick), for calls 1 to 3.
const LAST = 8
const frameMs = [800, 900, 1100]
const frame = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

function play() {
  if (frame.value >= LAST) return
  timer = setTimeout(() => {
    frame.value++
    play()
  }, frameMs[frame.value % 3])
}

watch($clicks, (c) => {
  clearTimeout(timer)
  frame.value = c >= 5 && reduce ? LAST : 0
  if (c >= 5 && !reduce) play()
}, { immediate: true })

onUnmounted(() => clearTimeout(timer))

const call = computed(() => ($clicks.value < 5 ? 0 : Math.floor(frame.value / 3) + 1))
const phase = computed(() => {
  const c = $clicks.value
  if (c < 5) return c < 3 ? 'none' : c === 3 ? 'bars' : 'pick'
  return ['feed', 'bars', 'pick'][frame.value % 3]
})
const appended = computed(() => steps.slice(0, call.value).map((s) => s.pick))
const tokens = computed(() => [...prompt, ...appended.value])
const fresh = computed(() => (phase.value === 'feed' ? tokens.value.length - 1 : -1))
const output = computed(() => appended.value.map((t) => t.text).join(''))
const showBars = computed(() => phase.value === 'bars' || phase.value === 'pick')
const picked = computed(() => phase.value === 'pick')

function pct(p: number) {
  return p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`
}

// The tokens flying into the model: a copy of the row shrinks into the model box.
const root = ref<HTMLElement>()
const ghost = ref<HTMLElement>()
const model = ref<HTMLElement>()

function offsetIn(el: HTMLElement) {
  let x = 0
  let y = 0
  for (let e: HTMLElement | null = el; e && e !== root.value; e = e.offsetParent as HTMLElement | null) {
    x += e.offsetLeft
    y += e.offsetTop
  }
  return { x, y }
}

function fly() {
  const g = ghost.value
  const m = model.value
  if (reduce || !g || !m) return
  const a = offsetIn(g)
  const b = offsetIn(m)
  const dx = b.x + m.offsetWidth / 2 - (a.x + g.offsetWidth / 2)
  const dy = b.y + m.offsetHeight / 2 - (a.y + g.offsetHeight / 2)
  g.animate(
    [{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(0.1)`, opacity: 0.3 }],
    { duration: 700, easing: 'cubic-bezier(0.5, 0, 0.75, 0.4)' },
  )
}

const feedKey = computed(() => ($clicks.value === 2 || phase.value === 'feed' ? call.value : null))
watch(feedKey, (k) => {
  if (k !== null) nextTick(fly)
})
</script>

<template>
  <div ref="root" class="nt" :class="`stage-${Math.min($clicks, 5)}`">
    <div class="head">
      <span class="label">Input</span>
      <span v-if="$clicks >= 5" class="label">Output so far <code class="out">{{ output }}</code></span>
    </div>
    <div class="box">
      <pre class="code">def add(a, b):
    return</pre>
      <div class="row">
        <TokenChip
          v-for="(t, i) in tokens"
          :key="i"
          class="tok"
          :class="{ added: i >= prompt.length }"
          :style="{ transitionDelay: `${i * 50}ms` }"
          :text="t.text"
          :id="t.id"
          :picked="i === fresh"
        />
      </div>
      <div ref="ghost" class="row ghost" aria-hidden="true">
        <TokenChip v-for="(t, i) in tokens" :key="i" :text="t.text" :id="t.id" :picked="i === fresh" />
      </div>
    </div>

    <div class="lower">
      <div class="model-col">
        <div ref="model"><LlmBox /></div>
        <span class="count">{{ tokens.length }} tokens in</span>
      </div>
      <span class="wire" />
      <div class="bars" :class="{ on: showBars }">
        <span class="label">Next token</span>
        <div v-for="([t, p], i) in steps[call].cands" :key="`${call}-${i}`" class="bar-row">
          <TokenChip :text="t" :picked="picked && i === 0" />
          <div class="track">
            <div class="bar" :class="{ pick: picked && i === 0 }" :style="{ width: `${p * 100}%`, transitionDelay: `${i * 60}ms` }" />
          </div>
          <span class="pct">{{ pct(p) }}</span>
        </div>
        <p class="note">Probabilities are illustrative.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nt {
  position: relative;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  height: 26px;
}

.label {
  font-size: 15px;
  color: var(--ya-graphite);
}

.out {
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 20px;
  color: var(--ya-ink);
  white-space: pre;
  background: none;
  padding: 0;
}

.box {
  position: relative;
  height: 84px;
  margin-top: 4px;
  padding: 12px 14px;
  border: 2px solid var(--ya-ink);
}

.code {
  position: absolute;
  top: 12px;
  left: 14px;
  margin: 0;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 22px;
  line-height: 1.3;
  background: none;
  padding: 0;
  transition: opacity 0.3s;
}

.row {
  display: flex;
  gap: 5px;
  align-items: flex-start;
}

.tok {
  transition: opacity 0.35s, transform 0.35s;
}

.added {
  animation: pop 0.35s ease-out;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.stage-0 .tok {
  opacity: 0;
  transform: translateY(8px);
}

.nt:not(.stage-0) .code {
  opacity: 0;
}

.ghost {
  position: absolute;
  top: 12px;
  left: 14px;
  opacity: 0;
  pointer-events: none;
}

.lower {
  display: flex;
  align-items: center;
  margin-top: 26px;
}

.model-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 200px;
  flex: none;
}

.count {
  font-size: 15px;
  color: var(--ya-graphite);
  transition: opacity 0.3s;
}

.stage-0 .count,
.stage-1 .count {
  opacity: 0;
}

.wire {
  width: 28px;
  height: 2px;
  flex: none;
  background: var(--ya-ink);
  transition: opacity 0.3s;
}

.bars {
  flex: 1;
  margin-left: 6px;
}

.stage-0 .wire,
.stage-1 .wire,
.stage-2 .wire,
.stage-0 .bars,
.stage-1 .bars,
.stage-2 .bars {
  opacity: 0;
}

.bars,
.wire {
  transition: opacity 0.3s;
}

.bar-row {
  display: grid;
  grid-template-columns: 104px 1fr 52px;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
  transition: opacity 0.25s;
}

.bar-row > .chip {
  justify-self: start;
}

.bars:not(.on) .bar-row {
  opacity: 0;
}

.track {
  height: 20px;
}

.bar {
  height: 100%;
  min-width: 2px;
  background: var(--ya-ink);
  transform-origin: left;
  transition: transform 0.5s ease-out, background-color 0.3s;
}

.bars:not(.on) .bar {
  transform: scaleX(0);
}

.bar.pick {
  background: var(--ya-signal);
}

.pct {
  font-size: 17px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.note {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--ya-graphite);
  text-align: right;
}

@media (prefers-reduced-motion: reduce) {
  .nt *,
  .nt :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
