---
theme: default
addons:
  - yitec-academy
title: What an agent is
info: How agents work, lecture 1
layout: cover
transition: slide-left
routerMode: hash
---

<YaMark blink class="w-20 mb-10" />

# What an agent is

How agents work, lecture 1

<!--
Today we will build an agent from the smallest useful pieces: a model, tools, and a loop. Then we will use that mental model to make practical choices.
-->

---

# A model turns input into tokens

<div class="modality-flow">
  <div class="modalities">
    <div class="card"><b>Text</b><small>split into token IDs</small></div>
    <div class="card"><b>Images</b><small>split into encoded patches</small></div>
    <div class="card quiet"><b>Other modalities</b><small>only when the model supports them</small></div>
  </div>
  <span class="big-arrow">→</span>
  <div class="token-stack"><TokenChip text="·Fix" :id="32499" /><TokenChip text="·this" :id="495" /><span class="patch-token">image<br>patch</span></div>
  <span class="big-arrow">→</span>
  <LlmBox />
  <span class="big-arrow">→</span>
  <div class="card output"><b>Text</b><small>one token at a time</small></div>
</div>

<p class="takeaway">The common agent interface is text and images in; text out.</p>

<!--
Models may support audio or other modalities, but coding agents most often send text and images. Internally these become numeric representations. The generated response is text tokens.
-->

---
clicks: 5
---

# Text output: one token at a time

<NextToken />

<!--
The model scores possible next tokens, chooses one, appends it, then receives the longer sequence again. The displayed token IDs are real for this tokenizer; probabilities are illustrative.
-->

---
clicks: 4
---

# Images become tokens too

<ImageTokens />

<!--
An image is encoded as patches and combined with the text tokens. The exact image-token scheme varies by model, so treat this as the useful conceptual picture rather than a provider-specific wire format.
-->

---

# A tool is a function the host can run

<div class="tool-schema">
<div>

```ts
read({
  path: string,
  offset?: number,
  limit?: number
})
```

<p>The host publishes a name, description, and input schema.</p>
</div>
<div class="schema-arrow">→</div>
<div>

```json
{
  "name": "read",
  "arguments": {
    "path": "README.md",
    "offset": 1,
    "limit": 200
  }
}
```

<p>The model must emit a valid call matching that schema.</p>
</div>
</div>

<div class="warning">The model requests the call. The agent host validates and routes it for execution.</div>

<!--
“Tool” sounds special, but it is close to a typed function. Providers encode the envelope differently; name plus structured arguments is the stable idea. Exact structured output matters because software—not a person—parses it.
-->

---

# Coding agents expose tool sets

<div class="agent-tools">
  <div><h2>Claude Code</h2><span>Read</span><span>Edit / Write</span><span>Bash</span><span>Search</span><span>Web</span></div>
  <div><h2>Codex</h2><span>Shell</span><span>Patch edits</span><span>File inspection</span><span>Search</span></div>
  <div><h2>Pi</h2><span>read</span><span>bash</span><span>edit / write</span><span>subagent*</span><span>extensions*</span></div>
</div>

<p class="footnote">Exact names and availability depend on version, configuration, permissions, and environment.</p>

<!--
Do not memorize product tool names. Notice the common capabilities: inspect files, search, edit, and run commands. Pi can also expose extension tools; all three products vary by installation and policy.
-->

---
clicks: 4
---

# Every model call receives assembled context

<div class="call-anatomy">
  <div class="transcript">
    <div><b>System</b><span>Instructions + available tool schemas</span></div>
    <div><b>User</b><span>“What is in this workspace?”</span></div>
    <div v-click><b>Assistant</b><span>tool call: bash({ command: "pwd && ls …" })</span></div>
    <div v-click><b>Tool</b><span>/Users/… · README.md · lectures/ · src/ …</span></div>
    <div v-click><b>Assistant</b><span>tool calls: read(README.md), read(package.json)</span></div>
  </div>
  <div class="call-model"><LlmBox /><small v-click="4">Generate the next assistant message</small></div>
</div>

<!--
This is a simplified view of the captured Pi session used for the next slide. Tool results become transcript entries. On the next call, the host assembles context from the relevant history; it may truncate, filter, or summarize. The model has no private memory between API calls.
-->

---
clicks: 5
---

# The host keeps the agent loop moving

<AgentLoop />

<!--
This is the concrete session: the user asked what was in the workspace. The first assistant turn requested a workspace listing. After that result arrived, another call requested reads of the project metadata. Only after enough evidence did the model produce the summary. The loop is controlled by the host and ends on a normal answer, an error or limit, or user intervention.
-->

---
layout: center
---

# Agent = model + tools + loop

<p class="center-copy">The model chooses the next action. The host executes it, records the result, and calls the model again.</p>

---

# MCP standardizes how tools arrive

<div class="mcp-flow">
  <div class="card"><b>MCP server</b><small>publishes and executes tools</small></div>
  <span>↔</span>
  <div class="card"><b>Agent host</b><small>connects, lists, and requests execution</small></div>
  <span>→</span>
  <div class="prompt-sheet"><b>Model input</b><code>search_docs(query: string)</code><code>create_issue(title: string, …)</code></div>
</div>

<p class="takeaway">MCP does not make the model smarter. It gives the host a standard way to connect capabilities and expose them to the model.</p>

<!--
Model Context Protocol is a protocol boundary between hosts and external servers. Registering an MCP server can add tool definitions to what the model sees. When the model requests one, the host acts as an MCP client and asks the server to execute it. MCP can expose other primitives too; tools are our focus here.
-->

---

# Skills add instructions and discoverability

<div class="skill-flow">
  <div class="skill-index">
    <b>Always visible</b>
    <code>frontend-design</code>
    <small>Distinctive, intentional visual design…</small>
    <code>lesson-generator</code>
    <small>Build compact learning artifacts…</small>
  </div>
  <span class="big-arrow">→</span>
  <div class="prompt-sheet"><b>When selected</b><p>The host loads the skill's detailed instructions into context.</p></div>
</div>

<div class="warning">A skill is guidance, not a new executable capability. Implementations differ across agent hosts.</div>

<!--
In this workspace, skill names and descriptions help the agent discover relevant guidance. The full skill file can then be loaded. Unlike an MCP tool, a skill usually teaches the model how to work; it does not itself execute an external action.
-->

---

# Prompt caching reuses an unchanged prefix

<div class="cache-demo">
  <div><b>Call 1</b><span class="segment stable">system + tools</span><span class="segment stable">history</span><span class="segment new">new user turn</span></div>
  <div><b>Call 2</b><span class="segment hit">cached prefix</span><span class="segment new wide">tool call + result</span></div>
  <div><b>After editing old history</b><span class="segment miss">prefix changed</span><span class="segment miss wide">later content must be processed again</span></div>
</div>

<p class="takeaway">Caching can reduce repeated-prefix cost and latency. Exact rules, minimums, and discounts are provider-specific.</p>

<!--
The transcript grows, so repeated calls share a large prefix. Some providers cache that prefix. If early system instructions, tool definitions, or history change, reuse after that point may be lost. This is optimization, not memory: the same logical context is still part of the request.
-->

---

# Work with the loop, not against it

<div class="practice-grid">
  <div><b>Keep the prefix stable</b><p>Prefer a correction in a new message over rewriting old turns when cache reuse matters.</p></div>
  <div><b>Give evidence a cheap path</b><p>Point to files, errors, and acceptance checks; let tools inspect details.</p></div>
  <div><b>Keep tools relevant</b><p>More schemas consume context and create more choices. Enable what this task needs.</p></div>
  <div><b>Ask for verification</b><p>The useful loop ends with observable checks—not with confident prose.</p></div>
</div>

<!--
These are implications, not universal laws. Editing history can still be worth it when removing bad context matters more than caching. The principle is to understand the tradeoff and make the next action easy to verify.
-->

---

# Why can Vietnamese prompts cost more?

<div class="qa-grid">
  <div class="language"><b>English</b><div><TokenChip text="·Fix"/><TokenChip text="·the"/><TokenChip text="·bug"/></div><small>illustrative: 3 tokens</small></div>
  <div class="language"><b>Tiếng Việt</b><div><TokenChip text="·Sửa"/><TokenChip text="·lỗi"/><TokenChip text="·này"/><TokenChip text="."/></div><small>illustrative: 4 tokens</small></div>
</div>

<div class="answer-block"><b>Not because of a hidden translation step.</b><p>Billing follows tokens. Tokenizers may split the same meaning into different counts across languages. The ratio depends on the exact text, tokenizer, and model—measure it for your workload.</p></div>

<!--
Many multilingual models process Vietnamese directly. A model may internally learn cross-language representations, but that is not an extra billable “translate to English” API step. The visual counts are deliberately illustrative, not a benchmark.
-->

---

# RTK or caveman?

<div class="compare">
  <div><h2>RTK</h2><p><b>Structured toolkit:</b> your team's scripts and conventions for repeated agent runs, task state, and verification.</p><strong>Use when</strong><span>work repeats, benefits from checkpoints, or needs durable progress.</span></div>
  <div><h2>Caveman</h2><p><b>Minimal loop:</b> prompt the agent, inspect the result, run checks, repeat.</p><strong>Use when</strong><span>the task is small, visible, reversible, and easy to verify.</span></div>
</div>

<p class="takeaway">Start with the smallest loop that makes failure visible. Add machinery when repetition or recovery pays for it.</p>

<!--
“RTK” and “caveman” are treated here as team shorthand, not universal standards; replace the generic RTK definition with your team's exact expansion if it has one. This is not a winner-takes-all choice: use lightweight interaction for bounded tasks and stronger orchestration when state, repetition, or recovery becomes expensive.
-->

---

# Should we add many MCPs or skills?

<div class="balance">
  <div class="sparse"><span>read</span><span>edit</span><span>test</span></div>
  <div class="scale"><span>relevance</span><i></i><span>breadth</span></div>
  <div class="crowded"><span>CRM</span><span>browser</span><span>docs</span><span>tickets</span><span>deploy</span><span>design</span><span>database</span><span>chat</span></div>
</div>

<div class="answer-block"><b>Add capabilities on demand.</b><p>Large catalogs consume context, increase selection ambiguity, and widen permissions. Keep a small default set; make specialized MCPs and skills discoverable or task-scoped.</p></div>

<!--
There is no magic maximum. Tool schemas and skill summaries vary greatly in size, and models vary in selection quality. Measure success, context usage, latency, and permission risk. Breadth is useful only when it remains relevant and governed.
-->

---
layout: center
---

# See the system, steer the system

<div class="final-equation"><span>tokens</span><b>+</b><span>tools</span><b>+</b><span>loop</span><b>=</b><span class="signal">agent</span></div>

<p class="center-copy">Choose context, capabilities, and checks deliberately.</p>

<!--
The key mental model: the model predicts; the host provides context, executes actions, and repeats. Once you can see those boundaries, agent behavior becomes easier to diagnose and improve.
-->

<style>
.modality-flow,.mcp-flow,.skill-flow { display:flex; align-items:center; gap:22px; margin-top:2rem; }
.modalities { display:grid; gap:9px; width:210px; }.card,.prompt-sheet,.skill-index { border:2px solid var(--ya-ink); padding:14px 16px; }.card b,.card small,.prompt-sheet b,.prompt-sheet code,.skill-index b,.skill-index code,.skill-index small { display:block; }.card small,.skill-index small { margin-top:4px; color:var(--ya-graphite); font-size:14px; }.quiet { border-style:dashed; }.big-arrow,.mcp-flow>span { font-size:30px; }.token-stack { display:flex; gap:5px; align-items:start; }.patch-token { padding:7px; border:2px solid var(--ya-ink); font:13px ui-monospace,monospace; text-align:center; }.output { min-width:120px; }.takeaway,.warning { margin-top:1.7rem; padding:12px 15px; border-left:8px solid var(--ya-signal); font-size:19px!important; }.tool-schema { display:grid; grid-template-columns:1fr 40px 1fr; gap:14px; align-items:center; }.tool-schema pre { font-size:16px; }.tool-schema p { font-size:16px; }.schema-arrow { font-size:28px; }.warning { border:2px solid var(--ya-ink); border-left:8px solid var(--ya-signal); }.agent-tools { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }.agent-tools>div { border-top:8px solid var(--ya-ink); padding-top:10px; }.agent-tools h2 { font-size:25px; margin:0 0 12px; }.agent-tools span { display:inline-block; border:2px solid var(--ya-ink); padding:5px 8px; margin:3px 1px; font-size:15px; }.footnote { font-size:15px!important; color:var(--ya-graphite); margin-top:2rem; }.call-anatomy { display:grid; grid-template-columns:1fr 190px; gap:35px; align-items:center; }.transcript { display:grid; gap:8px; }.transcript>div { border:2px solid var(--ya-ink); padding:8px 11px; }.transcript b { display:inline-block; width:88px; font-size:14px; }.transcript span { font:15px ui-monospace,monospace; }.call-model { text-align:center; }.call-model small { display:block; margin-top:12px; color:var(--ya-graphite); }.center-copy { max-width:700px; text-align:center; font-size:25px!important; }.mcp-flow .card { width:190px; }.prompt-sheet { flex:1; }.prompt-sheet code { margin-top:9px; padding:6px; background:#eee; color:#000; }.skill-index { width:360px; }.skill-index code { margin-top:10px; font-weight:700; }.cache-demo { display:grid; gap:18px; margin-top:2rem; }.cache-demo>div { display:grid; grid-template-columns:160px 1fr 1fr; }.cache-demo b,.segment { padding:10px; }.segment { border:2px solid var(--ya-ink); font-size:16px; }.hit { background:var(--ya-signal); color:#000; }.new { border-style:dashed; }.wide { grid-column:auto; }.miss { background:repeating-linear-gradient(135deg,transparent 0 8px,#ddd 8px 10px); color:#000; }.practice-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }.practice-grid>div { border-top:7px solid var(--ya-ink); padding:12px 8px; }.practice-grid b { font-size:21px; }.practice-grid p { font-size:17px; }.qa-grid,.compare { display:grid; grid-template-columns:1fr 1fr; gap:24px; }.language,.compare>div { border:2px solid var(--ya-ink); padding:18px; }.language>b { font-size:22px; }.language>div { display:flex; gap:5px; margin:18px 0 8px; }.language small { color:var(--ya-graphite); }.answer-block { margin-top:24px; padding:16px 20px; background:var(--ya-signal); color:#000; }.answer-block b { font-size:22px; }.answer-block p { margin:7px 0 0; font-size:18px; }.compare h2 { font-size:30px; margin:0 0 8px; }.compare p,.compare span { font-size:17px; }.compare strong,.compare span { display:block; }.compare strong { margin-top:18px; }.balance { display:grid; grid-template-columns:1fr 150px 1fr; align-items:center; gap:24px; }.sparse,.crowded { min-height:150px; border:2px solid var(--ya-ink); padding:20px; display:flex; flex-wrap:wrap; align-content:center; gap:8px; }.sparse span,.crowded span { padding:6px 9px; border:2px solid var(--ya-ink); }.scale { display:grid; text-align:center; gap:6px; font-size:14px; }.scale i { height:8px; background:var(--ya-ink); transform:rotate(5deg); }.final-equation { display:flex; gap:20px; align-items:center; font-size:31px; font-weight:800; }.final-equation span { border:2px solid var(--ya-ink); padding:12px 18px; }.final-equation .signal { background:var(--ya-signal); color:#000; }
</style>
