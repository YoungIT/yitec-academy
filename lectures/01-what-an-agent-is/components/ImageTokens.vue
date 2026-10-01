<!--
  An image becomes tokens too, driven by slide clicks. Put `clicks: 4` on the slide.
  0: a screenshot and a question. 1: a grid cuts the image into patches.
  2: patches and text tokens sit in one row. 3: the row goes into the model. 4: a text answer comes out.
  Text token IDs are real o200k_base IDs (from js-tiktoken). Image patches have no ID: each becomes a vector directly.
-->
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $clicks } = useSlideContext()

// The screenshot is 320×180, cut into 4×2 patches of 80×90.
const patches = Array.from({ length: 8 }, (_, i) => ({ x: (i % 4) * 80, y: Math.floor(i / 4) * 90 }))
const question = [
  { text: "What's", id: 45350 },
  { text: ' wrong', id: 8201 },
  { text: ' here', id: 2105 },
  { text: '?', id: 30 },
]

// SVG text inside <use> ignores white-space: pre, so keep the terminal's spaces as non-breaking ones.
const pre = (s: string) => s.replaceAll(' ', '\u00a0')

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

watch(computed(() => $clicks.value === 3), (on) => {
  if (on) nextTick(fly)
})
</script>

<template>
  <div ref="root" class="it" :class="`stage-${Math.min($clicks, 4)}`">
    <svg width="0" height="0" class="defs" aria-hidden="true">
      <symbol id="ya-terminal" viewBox="0 0 320 180">
        <rect width="320" height="180" fill="#0b0b0b" />
        <rect width="320" height="16" fill="#2b2b2b" />
        <rect x="8" y="5" width="6" height="6" fill="#6b6b6b" />
        <rect x="18" y="5" width="6" height="6" fill="#6b6b6b" />
        <rect x="28" y="5" width="6" height="6" fill="#6b6b6b" />
        <g fill="#d9d9d9" style="font: 10.5px ui-monospace, Menlo, monospace">
          <text x="10" y="34">$ pytest test_add.py</text>
          <text x="10" y="50">F</text>
          <text x="10" y="68" fill="#8a9099">{{ pre('______________ test_add ______________') }}</text>
          <text x="10" y="86">{{ pre('    def test_add():') }}</text>
          <text x="10" y="102">{{ pre('>       assert add(1, 2) == 3') }}</text>
          <text x="10" y="118" fill="#ffffff" font-weight="700">{{ pre('E       assert 4 == 3') }}</text>
          <text x="10" y="134">{{ pre('E        +  where 4 = add(1, 2)') }}</text>
          <text x="10" y="164" fill="#ffffff" font-weight="700">1 failed in 0.02s</text>
        </g>
      </symbol>
    </svg>

    <span class="label">Input</span>
    <div class="top">
      <div class="shot">
        <svg viewBox="0 0 320 180"><use href="#ya-terminal" /></svg>
        <svg class="grid" viewBox="0 0 320 180" aria-hidden="true">
          <path d="M80 0V180M160 0V180M240 0V180M0 90H320" stroke="#fff" stroke-width="2.5" />
        </svg>
      </div>
      <div>
        <div class="ask">What's wrong here?</div>
        <p class="aside">PDFs and audio work the same way, in models that support them.</p>
      </div>
    </div>

    <div class="seq-wrap">
      <div class="seq">
        <div class="group">
          <div class="items patches">
            <svg v-for="(p, i) in patches" :key="i" class="patch tok" :style="{ transitionDelay: `${i * 40}ms` }" :viewBox="`${p.x} ${p.y} 80 90`">
              <use href="#ya-terminal" width="320" height="180" />
            </svg>
          </div>
          <span class="caption">Image patches</span>
        </div>
        <div class="group">
          <div class="items">
            <TokenChip v-for="(t, i) in question" :key="i" class="tok" :style="{ transitionDelay: `${(i + 8) * 40}ms` }" :text="t.text" :id="t.id" />
          </div>
          <span class="caption">Text tokens</span>
        </div>
      </div>
      <div ref="ghost" class="seq ghost" aria-hidden="true">
        <div class="items patches">
          <svg v-for="(p, i) in patches" :key="i" class="patch" :viewBox="`${p.x} ${p.y} 80 90`">
            <use href="#ya-terminal" width="320" height="180" />
          </svg>
        </div>
        <div class="items">
          <TokenChip v-for="(t, i) in question" :key="i" :text="t.text" :id="t.id" />
        </div>
      </div>
    </div>

    <div class="lower">
      <div class="model-col">
        <div ref="model"><LlmBox /></div>
        <span class="count">12 tokens in</span>
      </div>
      <span class="wire" />
      <div class="answer">
        <span class="label">Output</span>
        <div class="answer-box">The test expects 3 but add() returned 4.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.it {
  position: relative;
}

.defs {
  position: absolute;
}

.label {
  font-size: 15px;
  color: var(--ya-graphite);
}

.top {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-top: 4px;
}

.shot {
  position: relative;
  width: 224px;
  height: 126px;
  flex: none;
  outline: 2px solid var(--ya-ink);
}

.shot svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.grid {
  transition: opacity 0.4s;
}

.stage-0 .grid {
  opacity: 0;
}

.aside {
  margin: 14px 0 0;
  font-size: 15px;
  color: var(--ya-graphite);
}

.ask {
  display: inline-block;
  font-size: 22px;
  padding: 8px 14px;
  border: 2px solid var(--ya-ink);
}

.seq-wrap {
  position: relative;
  margin-top: 16px;
}

.seq {
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.items {
  display: flex;
  gap: 5px;
  align-items: flex-start;
}

.patches {
  gap: 8px;
}

.caption {
  font-size: 14px;
  color: var(--ya-graphite);
}

.patch {
  width: 40px;
  height: 45px;
  outline: 2px solid var(--ya-ink);
  outline-offset: 0;
}

.tok,
.caption {
  transition: opacity 0.35s, transform 0.35s;
}

.stage-0 .tok,
.stage-1 .tok,
.stage-0 .caption,
.stage-1 .caption {
  opacity: 0;
  transform: translateY(8px);
}

.ghost {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}

.lower {
  display: flex;
  align-items: center;
  margin-top: 18px;
}

.model-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 200px;
  flex: none;
}

.count,
.wire,
.answer {
  transition: opacity 0.35s;
}

.count {
  font-size: 15px;
  color: var(--ya-graphite);
}

.stage-0 .count,
.stage-1 .count,
.stage-2 .count {
  opacity: 0;
}

.wire {
  width: 28px;
  height: 2px;
  flex: none;
  background: var(--ya-ink);
}

.it:not(.stage-4) .wire,
.it:not(.stage-4) .answer {
  opacity: 0;
}

.answer {
  margin-left: 6px;
}

.answer-box {
  margin-top: 4px;
  font-size: 22px;
  padding: 8px 14px;
  border: 2px solid var(--ya-ink);
}

@media (prefers-reduced-motion: reduce) {
  .it *,
  .it :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
