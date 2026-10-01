<!-- The model: a block slanted 20° and labelled LLM. Same shape on every slide of this lecture. -->
<template>
  <div class="llm"><span class="llm-label">LLM</span></div>
</template>

<style scoped>
.llm {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 96px;
}

.llm::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--ya-ink);
  transform: skewX(var(--ya-slant));
}

.llm-label {
  position: relative;
  color: var(--ya-paper);
  font-family: 'Archivo', system-ui, sans-serif;
  font-size: 30px;
  font-weight: 800;
  font-style: italic;
  font-stretch: 120%;
  letter-spacing: -0.02em;
}
</style>
