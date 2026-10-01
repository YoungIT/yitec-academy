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

---

# Today

<v-clicks>

- What a model on its own can and can't do
- What changes when you give it tools
- The loop that turns tool calls into finished work

</v-clicks>

---

# What a model does

<div class="flow">
  <div>
    <span class="label">Input</span>
    <pre class="box">def add(a, b):
    return</pre>
  </div>
  <span class="wire" />
  <LlmBox />
  <span class="wire" />
  <div>
    <span class="label">Output</span>
    <pre class="box"> a + b</pre>
  </div>
</div>

Text goes in, text comes out. That's the whole interface.

<style>
.flow {
  display: flex;
  align-items: center;
  gap: 24px;
  margin: 3.5rem 0 3rem;
}
.flow .label {
  font-size: 15px;
  color: var(--ya-graphite);
}
.flow .box {
  margin: 4px 0 0;
  padding: 12px 16px;
  border: 2px solid var(--ya-ink);
  background: none;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 24px;
  line-height: 1.3;
  min-height: 94px;
}
.flow .wire {
  width: 44px;
  height: 2px;
  background: var(--ya-ink);
}
</style>

<!--
Strip away the chat window and this is all a model is: you give it text, it gives you text back.
Here the input is half a Python function, and the output is the rest of the line.
Everything else today, chat and agents included, is built on top of this one box.
-->

---
clicks: 5
---

# One token at a time

<NextToken />

<!--
The model doesn't read letters. The text is cut into tokens, and each token is just a number. Those numbers are what goes in.
Out comes a score for every token it knows: how likely each one is to come next. We pick one, usually the top one, and append it.
Then we run the whole thing again with the longer input. That loop is all "generating text" means: plus, then b, then an end token that says stop.
The numbers under the chips are real token IDs. The probabilities are made up, but realistic.
-->

---
clicks: 4
---

# Images are tokens too

<ImageTokens />

<!--
A screenshot goes through the same model. It gets cut into patches, and each patch becomes a token, just a different kind: no ID from a word list, it's turned into numbers directly.
Those image tokens sit in one row with the text tokens of your question, and the model predicts text, one token at a time, exactly like before.
That's why you can paste a failing test's screenshot and get an answer. PDFs and audio work similarly in models that support them, but images are the best supported after text.
-->

---

# The input is everything

<div class="convo-grid">
  <div>
    <span class="label">What you see</span>
    <div class="msg"><b>System</b> You are a helpful coding assistant.</div>
    <div class="msg"><b>User</b> Fix my test.</div>
    <div class="msg"><b>Assistant</b> Which file?</div>
    <div class="msg"><b>User</b> add.py</div>
  </div>
  <div v-click>
    <span class="label">What the model gets</span>
    <div class="one-text"><span class="tag">&lt;system&gt;</span>You are a helpful coding assistant.<span class="tag">&lt;user&gt;</span>Fix my test.<span class="tag">&lt;assistant&gt;</span>Which file?<span :class="{ fresh: $clicks >= 2 }"><span class="tag">&lt;user&gt;</span>add.py</span><span class="tag">&lt;assistant&gt;</span></div>
  </div>
  <div v-click="1" class="to-model">
    <span class="wire" />
    <LlmBox />
  </div>
</div>

<p v-click="2" class="small">Only the highlighted part is new. The rest is sent again, on every call: the model keeps nothing between calls.</p>

<p v-click="3">On its own, a model only continues text. Give it tools and a loop, and you get an agent.</p>

<style>
.convo-grid {
  display: grid;
  grid-template-columns: 250px 1fr auto;
  gap: 28px;
  align-items: center;
  margin-top: 0.5rem;
}
.convo-grid .label {
  font-size: 15px;
  color: var(--ya-graphite);
}
.convo-grid .msg {
  margin-top: 8px;
  padding: 6px 10px;
  border: 2px solid var(--ya-ink);
  font-size: 18px;
  line-height: 1.3;
}
.convo-grid .msg b {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ya-graphite);
}
.convo-grid .one-text {
  margin-top: 8px;
  padding: 12px 14px;
  border: 2px solid var(--ya-ink);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 20px;
  line-height: 1.6;
}
.convo-grid .tag {
  padding: 1px 4px;
  margin: 0 4px;
  background: var(--ya-ink);
  color: var(--ya-paper);
  font-size: 16px;
}
.convo-grid .fresh {
  background: var(--ya-signal);
  color: #000;
  transition: background-color 0.3s;
}
.convo-grid .to-model {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-right: 18px;
}
.convo-grid .wire {
  width: 28px;
  height: 2px;
  background: var(--ya-ink);
}
.small {
  margin-top: 1.25rem;
  font-size: 17px !important;
  color: var(--ya-graphite);
}
</style>

<!--
A chat looks like separate messages, but the model gets one long text: the system prompt, every earlier turn, and your new message, joined with markers for who said what.
The model keeps nothing between calls. So every time you send a message, the app sends the whole conversation again, and the model reads it from the start.
Whatever isn't in that text, the model doesn't know. Keep that in mind for the next slide: an agent is built by putting more into that text and running it in a loop.
-->

---
layout: center
---

# Agent = model + tools + loop

<v-click>

The rest of this course takes those three apart, one at a time.

</v-click>
