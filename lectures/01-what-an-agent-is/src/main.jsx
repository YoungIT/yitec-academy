import React, { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './style.css'
import starterAgents from './starter-agents.md?raw'
import presenterImage from '../assets/phamgialinhlx.png'
import fundamentalsBunny from '../assets/fundamentals-bunny.png'
import beyondFundamentalsBunny from '../assets/beyond-fundamentals-bunny.png'
import tryingBunny from '../assets/trying-bunny.png'

const sources = {
  tools: ['Function calling', 'https://developers.openai.com/api/docs/guides/function-calling'],
  claude: ['Claude Code', 'https://code.claude.com/docs/en/how-claude-code-works'],
  pi: ['Pi coding agent', 'https://github.com/earendil-works/pi/tree/main/packages/coding-agent'],
  mcp: ['MCP tools specification', 'https://modelcontextprotocol.io/specification/2025-06-18/server/tools'],
  skills: ['How skills load', 'https://learn.chatgpt.com/docs/build-skills'],
  cache: ['Prompt caching', 'https://developers.openai.com/api/docs/guides/prompt-caching'],
  cacheTtl: ['Claude Code cache TTL', 'https://code.claude.com/docs/en/prompt-caching#which-ttl-each-request-gets'],
  tokens: ['Explore a tokenizer', 'https://platform.openai.com/tokenizer'],
  rtk: ['RTK', 'https://github.com/rtk-ai/rtk'],
  caveman: ['Caveman skill', 'https://github.com/JuliusBrussee/caveman'],
  agentsMd: ['AGENTS.md', 'https://agents.md/'],
  bestPractices: ['Writing effective instructions', 'https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md'],
  starterAgents: ['Starter CLAUDE.md', 'https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md'],
  subagents: ['Claude Code subagents', 'https://code.claude.com/docs/en/sub-agents#how-forks-differ-from-other-subagents'],
  subagentPractices: ['Delegate investigation', 'https://code.claude.com/docs/en/best-practices#use-subagents-for-investigation'],
  subagentPatterns: ['Subagent patterns', 'https://code.claude.com/docs/en/sub-agents#common-patterns'],
  contextManagement: ['Manage context', 'https://code.claude.com/docs/en/best-practices#manage-context-aggressively'],
  memory: ['Claude Code memory', 'https://code.claude.com/docs/en/memory#enable-or-disable-auto-memory'],
  toolSearch: ['Anthropic tool search', 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool'],
  codeMcpSearch: ['Claude Code MCP tool search', 'https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search'],
  communication: ['Communicate effectively', 'https://code.claude.com/docs/en/best-practices#communicate-effectively'],
  grilling: ['Matt Pocock’s grilling skill', 'https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md'],
}
const schema = `{
  "type": "function",
  "name": "read_file",
  "description": "Read a workspace text file",
  "parameters": {
    "type": "object",
    "properties": {
      "path": { "type": "string" }
    },
    "required": ["path"],
    "additionalProperties": false
  },
  "strict": true
}`
function Code({children}) { return <pre><code>{children}</code></pre> }
const SlideContext = createContext(null)
function SectionLabel({section,tone}) { return <p className={`section-label ${tone}`}>{section}</p> }
const NotesSlot = createContext(null)
function Note({children}) { const slot=useContext(NotesSlot);return slot&&createPortal(<p className="note">{children}</p>,slot) }
function Arrow() { return <svg className="arrow" viewBox="0 0 64 16" aria-hidden="true"><path d="M0 8H62M54 1l8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg> }
function Node({label, children, tone = ''}) { return <div className={`node ${tone}`}><strong>{label}</strong>{children && <div>{children}</div>}</div> }
function Tokens() {
  return <div className="hero"><p className="lead">A language model receives a representation of the input and generates an output, one token at a time.</p><div className="flow"><Node label="Input">Text, images, supported modalities</Node><Arrow/><Node label="Model" tone="model">Tokens & other encoded input</Node><Arrow/><Node label="Output" tone="output">Text or structured tool calls</Node></div><Note>Token chips are illustrative. Images use a model-specific encoding; some multimodal models also produce audio or images. This lesson follows a text-based coding agent.</Note></div>
}
function FlipCard({question,children}) {
 const {title,section,tone}=useContext(SlideContext)
 const [flipped,setFlipped]=useState(false)
 const flip=()=>setFlipped(f=>!f)
 return <div className="flashcard" role="button" tabIndex={0} aria-pressed={flipped} onClick={flip} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}}}><div className="flashcard-inner"><div className="flashcard-face front" aria-hidden={flipped}><SectionLabel section={section} tone={tone}/><p className="flashcard-question">{question}</p><small>Click to flip</small></div><div className="flashcard-face back" aria-hidden={!flipped}><SectionLabel section={section} tone={tone}/><div className="flashcard-title" aria-hidden="true">{title}</div>{children}</div></div></div>
}
function Tools() {
 return <FlipCard question="If an LLM produces only text, how can it code or interact with other systems?"><p className="lead">A tool is a function the host exposes. The model asks; the agent application executes.</p><div className="columns"><div><h2>1. Describe the function</h2><Code>{schema}</Code></div><div><h2>2. Receive a structured call</h2><Code>{JSON.stringify({ type: 'function_call', call_id: 'call_1', name: 'read_file', arguments: JSON.stringify({ path: 'README.md' }) }, null, 2)}</Code><div className="boundary"><Node label="Model" tone="model">Produces the call</Node><span>↓ Host boundary</span><Node label="Agent host" tone="teal">Validates, executes, returns result</Node></div><Note>Example uses OpenAI’s format. Other APIs use different envelopes. Valid JSON alone does not grant permission to execute.</Note></div></div></FlipCard>
}
function Toolboxes() {
 return <><p className="lead">The same model can behave differently when its host gives it different tools, instructions, and permissions.</p><div className="toolboxes"><section><h2>Claude Code</h2><p>File operations, shell execution, search, web access, agent orchestration.</p><div className="tool-tags"><span>Read / Edit / Write</span><span>Bash</span><span>Grep / Glob</span></div></section><section><h2>Pi</h2><p>A small default toolbox, expanded through extensions.</p><div className="tool-tags"><span>read</span><span>write</span><span>edit</span><span>bash</span></div></section></div><Note>Names and availability vary by version, mode, configuration, and approval policy. A tool list is part of the agent’s environment.</Note></>
}
const requestExample = JSON.stringify({
  model: '<tool-capable model>',
  instructions: 'Inspect the workspace before answering.',
  tools: [JSON.parse(schema)],
  input: [
    { role: 'user', content: 'What is in this workspace?' },
    { type: 'function_call', call_id: 'call_1', name: 'read_file', arguments: JSON.stringify({ path: 'README.md' }) },
    { type: 'function_call_output', call_id: 'call_1', output: '# YITEC Academy\nSeminar slides…' },
  ],
}, null, 2)

const inputItems = [['instructions','system / developer','“Inspect the workspace before answering.”'],['tools','tool definitions','read_file(path): reads a workspace file'],['message · user','role: user','“What is in this workspace?”'],['message · assistant','role: assistant','“I’ll read the README first.”'],['function_call','call_id: call_1','read_file {“path”: “README.md”}'],['function_call_output','call_id: call_1','“# YITEC Academy Seminar slides…”'],['message · assistant','role: assistant','“This workspace holds seminar slides.”']]
// Which schema rows each loop step produces: [grid rows, node tone, label, detail, arrow into this step]
const schemaGroups = [['1 / span 3','','User task','With instructions and tools'],['4 / span 2','model','Model','Answer or request tools','↓'],['6','teal','Host executes',null,'↓ Tool call'],['7','output','Model answers',null,'↶ Request model again']]
function InputSchema() {
 return <section className="input-schema"><h2>What the model actually receives: the input schema</h2><div className="schema-map"><ol className="input-list">{inputItems.map(([type,meta,body],i)=>{const call=i===4||i===5;return <li key={i} className={`input-item kind-${i===4?'call':i===5?'output':type.split(' · ').pop()}${call?' linked':''}${i===4?' first':''}${i===5?' last':''}`}><code className="badge">{type}</code><span className={call?'meta call-id':'meta'}>{meta}</span><span className="body">{body}</span></li>})}</ol>{schemaGroups.map(([rows,tone,label,detail,arrow])=><React.Fragment key={rows}><span className={`map-brace tone-${tone||'task'}`} style={{'--rows':rows}} aria-hidden="true"/><div className="map-node" style={{'--rows':rows}}>{arrow&&<span className="map-arrow" aria-hidden="true">{arrow}</span>}<Node label={label} tone={tone}>{detail}</Node></div></React.Fragment>)}</div><p className="takeaway">One ordered list of typed items. Each loop turn appends to it.</p><Note>Names follow OpenAI’s Responses API; Anthropic nests tool_use and tool_result inside messages.</Note></section>
}

function LoopMap({step}) {
 return <div className="loop-map"><Node label="User task" tone={step===0?'active':''}/><span>↓</span><Node label="Model" tone={step===1||step===2||step===4||step===6?'model active':'model'}>Answer or request tools</Node><span>↓ Tool calls</span><Node label="Host executes" tone={step===3||step===5?'teal active':'teal'}>Results go back into context</Node><span className="return-path">↶ Request model again</span></div>
}

function Context() {
 const [showJson,setShowJson] = useState(false)
 return <>{showJson?<div className="schema-loop"><div className="request-example"><Code>{requestExample}</Code><Note>Example OpenAI Responses request; choose a supported model before using it. The matching call_id connects a tool result to the model’s call. Other providers use different role names and envelopes.</Note></div><LoopMap/></div>:<InputSchema/>}<div className="controls"><button aria-expanded={showJson} onClick={()=>setShowJson(!showJson)}>{showJson?'Hide request example':'Show request example'}</button></div></>
}

// Each step: [title, code excerpt, explanation, history items it appends as [kind, type, body]]
const replay = [
 ['User', 'what is in this workspace?', 'The task enters the conversation.', [['user','message · user','“what is in this workspace?”']]],
 ['Assistant', 'I’ll inspect the repository structure and its main metadata/docs, then summarize what the workspace contains.', 'The model chooses to inspect before answering.', [['assistant','message · assistant','“I’ll inspect the repository structure…”']]],
 ['Tool calls', 'bash: inspect directory structure\nread: {"path":"README.md","offset":1,"limit":300}\nread: {"path":"package.json","offset":1,"limit":300}', 'First batch: three genuine tool calls. The bash command is abbreviated.', [['call','function_call ×3','bash · read README.md · read package.json']]],
 ['Tool results', 'README.md excerpt:\n# YITEC Academy\nSeminar slides for the YITEC team.\n\npackage.json excerpt:\n"name": "yitec-academy"\n"scripts": { "dev": "vite", … }', 'The host returns filesystem evidence. Excerpts omit irrelevant content.', [['output','function_call_output ×3','directory tree · README.md · package.json']]],
 ['More tool calls', 'read: {"path":"lectures.json","offset":1,"limit":300}\nbash: list source files\nread: {"path":"src/main.js","offset":1,"limit":250}\nread: {"path":"vite.config.js","offset":1,"limit":150}', 'A second batch asks for the catalog and implementation.', [['call','function_call ×4','read lectures.json · bash · read src/main.js · read vite.config.js']]],
 ['More tool results', 'lectures.json excerpt:\n"title": "How agents work"\n"slug": "01-what-an-agent-is"\n"status": "draft"\n\nSource files include:\nsrc/main.js\nlectures/01-what-an-agent-is/slides.md', 'The results describe the workspace as it existed at the time of the recording.', [['output','function_call_output ×4','lectures.json · file list · main.js · vite.config.js']]],
 ['Assistant answer', 'This workspace is **YITEC Academy**, a small static site for internal seminar/course material.', 'The model summarizes the gathered evidence; this turn ends.', [['assistant','message · assistant','“This workspace is YITEC Academy…”']]],
]
const replaySetup = [['instructions','instructions','Pi system prompt'],['tools','tools','read · write · edit · bash']]
const REPLAY_DEFAULT_MS = 1000
function Replay() {
 const [step,setStep] = useState(0)
 const [ms,setMs]=useState(REPLAY_DEFAULT_MS)
 useEffect(()=>{const id=setInterval(()=>setStep(s=>(s+1)%replay.length),ms);return()=>clearInterval(id)},[ms])
 const history=[...replaySetup.map(item=>[item,false]),...replay.slice(0,step+1).flatMap((r,i)=>r[3].map(item=>[item,i===step]))]
 return <><p className="lead">One user task. Two rounds of tools. One final answer.</p><div className="replay-layout"><LoopMap step={step}/><div className="replay"><div className="replay-event" key={step}><div className="replay-heading"><strong>{replay[step][0]}</strong><span>{step+1} / {replay.length}</span></div><Code>{replay[step][1]}</Code><p>{replay[step][2]}</p></div><div className="replay-speed"><label htmlFor="replay-speed">Speed {(ms/1000).toFixed(1)} s / step</label><input id="replay-speed" type="range" min="500" max="2000" step="100" value={ms} onChange={e=>setMs(Number(e.target.value))}/></div></div><section className="history"><div className="history-heading"><h2>Context history</h2><span>re-sent to the model every turn</span></div><ol className="input-list">{history.map(([[kind,type,body],fresh],i)=><li key={i} className={`input-item kind-${kind}${fresh?' fresh':''}`}><code className="badge">{type}</code><span className="body">{body}</span></li>)}</ol></section></div><Note>Selected excerpts from the supplied Pi session, October 1, 2026. This is a historical replay; the project has since changed. No tools run in this deck.</Note></>
}
function Mcp() {
 return <><p className="lead">Model Context Protocol standardizes how an agent host discovers and calls tools on another server.</p><div className="pipeline"><Node label="Model" tone="model">Chooses an available tool</Node><span className="connector">→</span><Node label="Agent host">MCP client</Node><span className="connector">⇄</span><Node label="MCP server" tone="teal">Files, databases, services</Node></div><div className="columns compact"><div><h2>Discover</h2><Code>{`tools/list → [{
  "name": "search_docs",
  "description": "Search project docs",
  "inputSchema": { "type": "object", … }
}]`}</Code></div><div><h2>Call</h2><Code>{`tools/call → {
  "name": "search_docs",
  "arguments": { "query": "deployment" }
}`}</Code></div></div><Note>Tool definitions may add context cost when exposed to the model. MCP also supports resources and prompts. Discovery, deferred loading, and tool selection depend on the host.</Note></>
}
// Abbreviated from the Pi session's system prompt (Oct 1, 2026)
const skillsPrompt = `Use the read tool to load a skill's file when
the task matches its description.

<available_skills>
  <skill>
    <name>frontend-design</name>
    <description>Guidance for distinctive, intentional
      visual design when building new UI …</description>
    <location>…/skills/frontend-design/SKILL.md</location>
  </skill>
  <skill><name>learn</name> …</skill>
  … lesson-generator, logo-design, pi-subagents
</available_skills>`
// Illustrative: that session never loads a skill. Content is from the real SKILL.md.
const skillFile = `---
name: frontend-design
description: Guidance for distinctive, intentional …
---
# Frontend Design
Approach this as the design lead at a design studio …
## Ground your designs in the subject matter
…  (71 lines in full)`
function Skills() {
 return <><p className="lead">A skill is a package of task instructions, sometimes with scripts and reference files. It teaches a workflow.</p><div className="skill-stages"><section><h2>1. Session start: system prompt <span>always present</span></h2><ol className="input-list"><li className="input-item kind-instructions"><code className="badge">instructions</code><span className="meta">name + description only</span></li></ol><Code>{skillsPrompt}</Code></section><section><h2>2. On demand: agent reads SKILL.md <span>illustrative</span></h2><ol className="input-list"><li className="input-item kind-call"><code className="badge">function_call</code><span className="meta">read</span><span className="body">{'{"path": ".agents/skills/frontend-design/SKILL.md"}'}</span></li><li className="input-item kind-output"><code className="badge">function_call_output</code><span className="meta">full skill, enters context</span><pre className="body">{skillFile}</pre></li><li className="skill-later">Referenced files and scripts load the same way, only as needed.</li></ol></section></div><div className="takeaway-row"><p className="takeaway">Descriptions are always in context; full skills cost tokens only when used.</p><a className="button-link" href={import.meta.env.BASE_URL+'pi-session-example.html'} target="_blank" rel="noopener">View example Pi session ↗</a></div><Note>Stage 1 quotes the Pi system prompt from the October 1, 2026 session, abbreviated. That session never loads a skill, so stage 2 is illustrative; its excerpt comes from the real frontend-design SKILL.md. Progressive disclosure keeps full instructions out of every request. Exact discovery behavior depends on the agent host. A skill does not automatically create a new model or tool.</Note></>
}
// [label, input-item kind] colored like slides 4–5
const cacheBlocks=[['Instructions','instructions'],['Tool schemas','tools'],['User task','user'],['Tool call','call'],['Tool result','output'],['New message','user']]
// [title, result, matching prefix length, edited block index]
const cacheCases=[['Append a message','Same history, new suffix: the earlier prefix can remain eligible for reuse.',5],['Edit an earlier message','The edited task breaks the match: everything after it needs fresh computation for this prefix.',2,2]]
function Cache() {
 return <><p className="lead">A cache can reuse computation for an identical beginning of a request. Matching stops where the prefix changes.</p><div className="cache-cases">{cacheCases.map(([title,result,k,edited])=><section key={title}><div className="cache-head"><h2>{title}</h2><p>{result}</p></div><div className="cache-grid" style={{'--k':k}}><span className="cache-band" aria-hidden="true"/><span className="cache-hit">Matching prefix · reusable</span><span className="cache-new">New computation</span>{['Previous request','Next request'].map((label,r)=><React.Fragment key={label}><span className="cache-row-label" style={{'--r':r}}>{label}</span>{cacheBlocks.slice(0,r?6:5).map(([name,kind],i)=><span key={i} className={`input-item kind-${kind}${r&&i===edited?' changed':''}`} style={{'--r':r,'--i':i}}>{r&&i===edited?'Edited task':name}</span>)}</React.Fragment>)}</div></section>)}</div><Note>Conceptual illustration, not a billing calculator. Providers have minimum lengths, cache lifetimes, supported blocks, and different pricing. Cache hits are not guaranteed; caching does not increase the context window.</Note></>
}
// Example timeline on a 20-minute axis with a five-minute TTL: [minute, kind, label]
const ttlEvents=[[0,'write','Write'],[3,'hit','Hit · reset'],[6,'hit','Hit · reset'],[16,'write','Miss · rewrite']]
// [bucket, examples, subscription TTL in minutes, API/cloud TTL in minutes, exception]
const ttlRows=[['Main conversation','Interactive turns, -p runs, Agent SDK turns, inline helpers',60,5],['Everything else','Subagents, workflows, teammates, forks, compaction, session titles',5,5,'Server-controlled helpers: one hour']]
function CacheTtl() {
 const at=m=>`${m/20*100}%`, ttl=m=>m===60?'One hour':'Five minutes'
 return <><p className="lead">A cached prefix expires after its time to live (TTL) unless reused. Each cache hit resets the timer.</p><section className="ttl-example"><h2>One cache, TTL = 5 minutes</h2><div className="ttl-track"><span className="ttl-band" style={{left:at(0),width:at(11)}}><b>Cache warm</b></span><span className="ttl-span" style={{left:at(6),width:at(5)}}>TTL: 5 min after the last hit</span><span className="ttl-expired" style={{left:at(11),width:at(5)}}><b>Expired</b></span><span className="ttl-band open" style={{left:at(16),width:at(4)}}/>{ttlEvents.map(([m,kind,label])=><span key={m} className={`ttl-event ${kind}`} style={{left:at(m)}}>{label}</span>)}<div className="ttl-axis">{[0,5,10,15,20].map(m=><span key={m} style={{left:at(m)}}>{m} min</span>)}</div></div></section><section className="ttl-table"><h2>Which TTL each request gets in Claude Code <span>bar length = lifetime, 60-minute scale</span></h2><div className="ttl-grid"><span/><span className="ttl-col">Claude subscription, within plan usage</span><span className="ttl-col">Usage credits, API key, or cloud provider</span>{ttlRows.map(([bucket,examples,sub,api,extra])=><React.Fragment key={bucket}><div className="ttl-bucket"><strong>{bucket}</strong><span>{examples}</span></div>{[[sub,extra],[api]].map(([m,x],i)=><div key={i} className="ttl-cell"><div className="ttl-bar"><span style={{width:`${m/60*100}%`}}/></div><strong>{ttl(m)}</strong>{x&&<span>{x}</span>}</div>)}</React.Fragment>)}</div></section><p className="takeaway">One hour survives longer breaks but bills cache writes at a higher rate.</p><Note>From Claude Code’s prompt caching docs. On usage credits after exceeding plan limits, the main conversation drops to five minutes. Override per bucket with promptCacheTtl / CLAUDE_CODE_PROMPT_CACHE_TTL (main) and subagentPromptCacheTtl / CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL (everything else), v2.1.242+. The timeline is illustrative.</Note></>
}
function Compact() {
 return <FlipCard question="When should you compact the conversation?"><div className="columns"><section className="comparison"><h2>1. Watch growing context</h2><p>Quality can degrade as the conversation accumulates context.</p><p><strong>Rule of thumb:</strong> consider compacting around <strong>200k–300k used context tokens</strong>, for models whose context window allows that range.</p><p>This measures the context already in use, not the model’s total window size.</p></section><section className="comparison"><h2>2. Avoid interrupting the same task</h2><p>If room remains, avoid manual compaction while continuing a task. Its summary may omit investigation details.</p><p>The agent may reexplore code: <strong>repeated investigation, extra tokens, time, and cost</strong>, with context still missing.</p><p>Prefer a <strong>task boundary</strong>. If compaction is necessary, save decisions, important files, and next steps.</p></section></div><Note>The docs support managing context as quality degrades. The token range and timing advice are course heuristics, not universal cutoffs. Automatic compaction may happen earlier, depending on the model and host.</Note></FlipCard>
}
function Vietnamese() {
 return <FlipCard question="Does Vietnamese cost more because the model translates it into English first?"><div className="pipeline"><Node label="Vietnamese text"/><span className="connector">→</span><Node label="Tokenizer" tone="model">Model-specific segmentation</Node><span className="connector">→</span><Node label="Model" tone="teal">Processes the tokens directly</Node></div><p>No translation step is required. The same meaning can need different numbers of tokens in different languages, depending on the tokenizer, wording, and script.</p><p>For token-priced APIs, more input or output tokens can cost more. Vietnamese is not always more expensive: compare your actual prompts in the model’s tokenizer and check pricing.</p><Note>No invented token counts: use the tokenizer source below to try equivalent sentences.</Note></FlipCard>
}
function Tradeoffs() {
 return <FlipCard question="RTK and caveman both reduce tokens. Do they reduce the same thing?"><div className="columns"><section className="comparison"><h2>RTK: filter command output</h2><div className="mini-flow"><span>Verbose CLI result</span><b>↓ RTK</b><span>Relevant compact result</span></div><p>RTK wraps supported CLI commands and filters their output before the agent reads it.</p><p>Useful for noisy logs; inspect full output when filtered details matter.</p></section><section className="comparison"><h2>Caveman: change prose style</h2><div className="mini-flow"><span>Instructions to the model</span><b>↓ Caveman skill</b><span>Shorter generated prose</span></div><p>The caveman skill asks for terse responses. It changes how the agent communicates.</p><p>Useful for brevity; it can lose nuance or readability. Keep explanations and precision when needed.</p></section></div><Note>This compares RTK with caveman’s skill mode; caveman also offers a proxy variant. Savings depend on workload. Smaller output alone does not prove a better result.</Note></FlipCard>
}
function ManyTools() {
 return <FlipCard question="Should we install every MCP server and skill so the agent can do more?"><div className="columns"><div><h2>More available capabilities</h2><div className="tool-cloud"><span>Database</span><span>Browser</span><span>Design skill</span><span>Docs</span><span>Deploy</span><span>Analytics</span></div></div><div><h2>More context and choices</h2><div className="budget"><span>Instructions</span><span>Tool definitions</span><span>Skill metadata</span><span>Task + evidence</span></div></div></div><p>Enable what serves the task. Exposed tool schemas and skill metadata can add input tokens and competing choices. Full skill instructions usually load only when selected.</p><p>Use host support for discovery or deferred loading where available. Check permissions and tool results. A large installed collection is different from loading everything into a request.</p></FlipCard>
}
// Verbatim from the example on https://agents.md/
const agentsMdExample = `# AGENTS.md

## Setup commands
- Install deps: \`pnpm install\`
- Start dev server: \`pnpm dev\`
- Run tests: \`pnpm test\`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible`
// Illustrative monorepo: [depth, name, annotation, kind]
const repoTree = [[0,'repo/'],[1,'AGENTS.md','repo-wide instructions','agents'],[1,'README.md','for humans'],[1,'packages/api/'],[2,'AGENTS.md','closest file wins','agents near'],[2,'src/handler.ts','← file being edited','edited']]
function AgentsMd() {
 return <><p className="lead agents-lead">A simple, open format: a dedicated, predictable place for the context and instructions that help coding agents work on your project.</p><div className="agents-md"><section><h2>A plain Markdown file at the repo root</h2><Code>{agentsMdExample}</Code><div className="tool-tags"><span>Overview</span><span>Build & test</span><span>Code style</span><span>Testing</span><span>Security</span><span>PR guidelines</span></div></section><section><h2>Nested files in a monorepo</h2><ol className="repo-tree">{repoTree.map(([d,name,note,kind])=><li key={d+name} className={kind} style={{'--d':d}}><code>{name}</code>{note&&<span>{note}</span>}</li>)}</ol><p className="agents-rule">Conflicts: the closest AGENTS.md to the edited file wins; explicit user chat prompts override everything.</p><h2>Into the context <span>illustrative</span></h2><ol className="input-list"><li className="input-item kind-instructions"><code className="badge">instructions</code><span className="meta">AGENTS.md text</span><span className="body">“## Setup commands - Install deps: pnpm install …”</span></li></ol></section></div><p className="takeaway">README.md is for humans; AGENTS.md is for agents: to the model, more instructions in context.</p><Note>Lead, example file, section list, nesting and conflict rule are from agents.md. The page says agents “automatically read the nearest file” but not how the text enters a request; the instructions row is our illustration, as is the repo tree. Supported by Codex, Jules, Cursor, Aider, Gemini CLI, GitHub Copilot’s coding agent and others, per agents.md.</Note></>
}
const agentsMdRules = [
 [<>Commands the agent would <strong>otherwise have to guess</strong></>, 'Facts the agent can find by reading code'],
 [<>Style choices that <strong>depart from defaults</strong></>, 'Ordinary language conventions'],
 [<>How to test and <strong>which runners to use</strong></>, 'Detailed API references — link to them instead'],
 [<>Repository etiquette: <strong>branch names and PR expectations</strong></>, 'Details that become outdated quickly'],
 [<>Architecture choices <strong>specific to this project</strong></>, 'Lengthy explanations and tutorials'],
 [<>Environment surprises, including <strong>required variables</strong></>, 'An inventory describing every file'],
 [<>Gotchas and behavior that is <strong>easy to miss</strong></>, 'Obvious advice such as “write clean code”'],
]
function AgentsMdBestPractices() {
 return <><p className="lead">Record what the agent needs to know about this project and cannot reliably infer.</p><table className="agents-practices"><thead><tr><th scope="col">Include</th><th scope="col">Exclude</th></tr></thead><tbody>{agentsMdRules.map(([include,exclude])=><tr key={exclude}><td>{include}</td><td>{exclude}</td></tr>)}</tbody></table><p className="takeaway">Keep it short and project-specific. Prune each rule: would removing it cause mistakes?</p><p>Commit and review the file; check that the agent follows it. Put occasional workflows in skills.</p><Note>All seven pairs adapt Claude Code’s “Write an effective CLAUDE.md” authoring guidance for AGENTS.md.</Note></>
}
function StarterAgentsMd() {
 return <section className="starter-agents"><p className="lead">Use this starter as AGENTS.md and add project-specific rules. Source file: CLAUDE.md.</p><pre tabIndex={0} role="region" aria-label="Complete starter Markdown. Scroll to read all sections." data-slide-scroll><code>{starterAgents}</code></pre><Note>Full, unmodified CLAUDE.md from forrestchang’s andrej-karpathy-skills repository. The repository describes these guidelines as inspired by Andrej Karpathy’s observations; this is not attributed to him as the author.</Note></section>
}
function Subagents() {
 return <><p className="lead">Both use the <strong>Agent tool</strong>. Each subagent works in its own context and returns a summary to the main conversation.</p><div className="columns"><section className="comparison"><h2>Fork: carry the conversation forward</h2><div className="mini-flow"><span>Parent’s full conversation snapshot</span><b>↓ Agent tool · type fork</b><span>Subagent context + delegated task</span></div><p>Inherits the <strong>same system prompt, tools, and model</strong>. The shared prompt prefix can reuse the parent’s cache.</p><p>Choose it when the task needs <strong>earlier decisions and context</strong>.</p><p>Example: “Check this change against decisions we discussed.”</p></section><section className="comparison"><h2>Non-fork: start a fresh context</h2><div className="mini-flow"><span>Delegation prompt · no parent history</span><b>↓ Agent tool · e.g. type Explore</b><span>Fresh subagent context + delegated task</span></div><p>A built-in or custom definition supplies its <strong>prompt and tools</strong>; the model can be configured or inherited.</p><p>Choose it for a <strong>self-contained task or specialized setup</strong>.</p><p>Example: “Inspect src/auth/ for token expiry and summarize findings.”</p></section></div><p className="takeaway">Detailed tool results and logs stay in the subagent; its summary comes back to the parent.</p><Note>Based on current Claude Code documentation. Launch labels and task examples are illustrative; “Agent” is the tool, not the opposite of a fork.</Note></>
}
function SubagentBestPractices() {
 return <><p className="lead">Delegate a focused task. Keep the main conversation available for decisions and synthesis.</p><div className="toolboxes"><section><h2>Investigating</h2><p>Trace a bug or unfamiliar code path.</p><p>Return the likely cause with <strong>evidence and file references</strong>.</p></section><section><h2>Researching</h2><p>Compare approaches using reliable sources.</p><p>Return options, tradeoffs, and a <strong>recommendation with source links</strong>.</p></section><section><h2>Implementing</h2><p>Assign a bounded change with clear file ownership.</p><p>Return the diff and <strong>acceptance-check results</strong>.</p></section><section><h2>Reviewing</h2><p>Have a separate reviewer inspect the change and test coverage.</p><p>Return <strong>concrete findings</strong>, file references, and missing checks.</p></section></div><p className="takeaway">Give scope, relevant context, constraints, a success check, and the expected output.</p><p>Parallelize independent tasks; avoid overlapping file edits. The parent verifies results and integrates the summaries.</p><Note>These four workflows are teaching suggestions based on Claude Code’s delegation guidance, not built-in agent names or a requirement to use four agents.</Note></>
}
function CliBeforeMcp() {
 return <><p className="lead"><strong>My preference:</strong> use a good CLI first; add MCP when it earns its context cost.</p><div className="columns"><section className="comparison"><h2>CLI through the shell tool</h2><p>One existing shell tool runs commands, without registering a separate MCP schema for each command.</p><p>Read <code>--help</code> when needed; request JSON and filter output to the relevant evidence.</p><p><strong>Help and command output still cost tokens.</strong></p></section><section className="comparison"><h2>Many eagerly exposed MCP tools</h2><p>Names, descriptions, and argument schemas can occupy substantial context before the task starts.</p><p>The cost comes from <strong>schemas exposed to the model</strong>, not simply the number of installed servers.</p></section></div><h2>What I want from MCP tooling: discovery before loading</h2><div className="mini-flow"><span>Search catalog → Load relevant schemas → Call tool</span></div><p>Anthropic’s tool search supports deferred MCP toolsets with <code>defer_loading: true</code>.</p><p><strong>Claude Code already supports this by default;</strong> other hosts and configurations vary.</p><Note>This recommendation is editorial; the flow is illustrative. On-demand schema loading is client/API behavior, not a portable guarantee of the MCP protocol itself.</Note></>
}
function Communication() {
 return <><p className="lead">Let the agent interview you before a larger feature. Turn unclear ideas into decisions it can implement and verify.</p><div className="columns"><section className="comparison"><h2>Ask like an engineer</h2><p>Ask where logging happens, how edge cases work, and why the code takes a particular approach.</p><p>Have the agent ask about <strong>implementation, UX, edge cases, and tradeoffs</strong>.</p><p>Write a self-contained <code>SPEC.md</code>: scope, files, interfaces, exclusions, and end-to-end checks. Implement from it in a fresh session.</p></section><section className="comparison"><h2>Matt Pocock: /grill-me → grilling</h2><p><em>When the skills are installed.</em></p><p>Map the decision tree. Ask <strong>ready, independent questions in rounds</strong>, with a recommended answer for each; wait for replies before dependent questions.</p><p><strong>The agent investigates facts; you make decisions.</strong> Settle the branches and confirm shared understanding before building.</p></section></div><Code>{`Interview me about [feature]. Explore facts in the code;
ask me about decisions and tradeoffs. Summarize the agreed
scope and checks in SPEC.md.`}</Code><p className="takeaway">Resolve ambiguity before the agent starts building.</p><Note>Interview/spec guidance: Claude Code docs. Question rounds and decision-tree method: Matt Pocock’s grilling skill. The prompt is a teaching example.</Note></>
}
function Opening() {
 return <div className="cover-layout"><h1>How agent work</h1><figure><img src={presenterImage} alt="Presenter avatar: an illustrated rabbit wearing a suit"/><figcaption>phamgialinhlx</figcaption></figure></div>
}
function Fundamentals() {
 return <div className="cover-layout section-hero"><div><h1>Fundamentals</h1><p className="lead">Models, tools, and the context behind an agent’s actions.</p></div><img className="section-illustration" src={fundamentalsBunny} alt="Bunny stacking blocks to build a foundation"/></div>
}
function BeyondFundamentals() {
 return <div className="cover-layout section-hero"><div><h1>Beyond the Fundamentals</h1><p className="lead">Project instructions, delegation, and better agent workflows.</p></div><img className="section-illustration" src={beyondFundamentalsBunny} alt="Bunny directing a team of tiny robots"/></div>
}
function Ending() {
 return <><p className="lead">What would you change in the way you work with an agent?</p><div className="course-sections"><section><h2>Understand the request</h2><p>Tools and instructions shape what the model can do.</p></section><section><h2>Spend context deliberately</h2><p>Load what the task needs and preserve decisions when compacting.</p></section><section><h2>Make the work verifiable</h2><p>Give clear scope, delegate focused tasks, and check the results.</p></section></div></>
}
function TryingThings() { return <div className="cover-layout section-hero"><h1>Currently Trying, Results Pending</h1><img className="section-illustration" src={tryingBunny} alt="Bunny running a chaotic laboratory experiment"/></div> }
function LetCodeSpeak() {
 return <><p className="lead">My experiment: ask agents not to add code comments.</p><div className="columns"><section className="comparison"><h2>Keep code self-explanatory</h2><p>Use clear names and small functions. Verify <strong>executable behavior and test outcomes</strong>.</p><p>Comments are prose: ordinary tests do not execute or validate them. Agents may read <strong>stale comments</strong> as if they still describe the code.</p><p>Large comment blocks also consume context.</p></section><section className="comparison"><h2>Keep context in docs/</h2><p>Maintain a concise map of <strong>services, entry points, and module ownership</strong>: where things live.</p><p>Record non-obvious workarounds and their reasons, with links to relevant code locations.</p><p>Keep these docs current; load only what the task needs. Concise docs loaded on demand can <strong>save tokens</strong> by reducing repeated context.</p></section></div><blockquote className="experiment-quote">we even don't read the code btw</blockquote></>
}
function OwnMemory() {
 return <><p className="lead">My experiment: disable Claude Code’s automatic memory and manage persistent context ourselves.</p><div className="columns"><section className="comparison"><h2>Why I’m trying this</h2><p>A server or session interruption can leave <strong>unsaved context unavailable</strong>.</p><p>Switching agents or harnesses can produce <strong>very different behavior</strong>: memory, loading rules, and instructions vary.</p><p>I want important decisions to survive beyond one conversation or tool.</p></section><section className="comparison"><h2>Make memory explicit</h2><p>Keep decisions and handoffs in <strong>reviewed project files</strong>. Tell each agent which files to read.</p><p>Check what reaches its context. Update useful lessons and prune stale assumptions over time.</p><p>Disable auto memory in <code>.claude/settings.json</code>:</p><Code>{`{ "autoMemoryEnabled": false }`}</Code></section></div><p className="takeaway">Know what the agent reads. Own the responsibility for improving that memory over time.</p><Note>Disabling auto memory does not disable manually maintained CLAUDE.md instructions. Auto memory is stored on disk; an outage does not itself erase it. Unsaved conversation context is a separate concern. Explicit memory helps make context inspectable and portable, but does not guarantee identical behavior across agents. This is an experiment, with results pending.</Note></>
}
const slides = [
 { title: 'How agent work', component: Opening, hero: true, refs: [] },
 { title: 'Fundamentals', component: Fundamentals, hero: true, refs: [] },
 { title: 'The model reads tokens', section: 'Fundamentals', tone: 'technique', component: Tokens, refs: ['tokens'] },
 { title: 'Tools give the model a way to act', section: 'Fundamentals', tone: 'technique', component: Tools, refs: ['tools'] },
 { title: 'Different agents, different toolboxes', section: 'Fundamentals', tone: 'technique', component: Toolboxes, refs: ['claude', 'pi'] },
 { title: 'What goes into a model request?', section: 'Fundamentals', tone: 'technique', component: Context, refs: ['tools'] },
 { title: 'Follow a real agent loop', section: 'Fundamentals', tone: 'practice', component: Replay, refs: ['pi'] },
 { title: 'MCP connects more tools', section: 'Fundamentals', tone: 'technique', component: Mcp, refs: ['mcp'] },
 { title: 'Skills load instructions when needed', section: 'Fundamentals', tone: 'technique', component: Skills, refs: ['skills'] },
 { title: 'Prompt caching reuses a prefix', section: 'Fundamentals', tone: 'technique', component: Cache, refs: ['cache'] },
 { title: 'How long a cache lives (TTL)', section: 'Fundamentals', tone: 'technique', component: CacheTtl, refs: ['cacheTtl'] },
 { title: 'When to compact', section: 'Fundamentals', tone: 'practice', component: Compact, refs: ['contextManagement'] },
 { title: 'Why can Vietnamese cost more?', section: 'Fundamentals', tone: 'technique', component: Vietnamese, refs: ['tokens'] },
 { title: 'RTK or caveman?', section: 'Fundamentals', tone: 'practice', component: Tradeoffs, refs: ['rtk', 'caveman'] },
 { title: 'Should we add every MCP and skill?', section: 'Fundamentals', tone: 'practice', component: ManyTools, refs: ['mcp', 'skills'] },
 { title: 'Beyond the Fundamentals', component: BeyondFundamentals, hero: true, refs: [] },
 { title: 'AGENTS.md: a README for agents', section: 'Beyond the Fundamentals', tone: 'technique', component: AgentsMd, refs: ['agentsMd'] },
 { title: 'AGENTS.md best practices', section: 'Beyond the Fundamentals', tone: 'practice', component: AgentsMdBestPractices, refs: ['bestPractices'] },
 { title: 'A good start AGENTS.md', section: 'Beyond the Fundamentals', tone: 'practice', component: StarterAgentsMd, refs: ['starterAgents'] },
 { title: 'Subagents: fork or fresh context', section: 'Beyond the Fundamentals', tone: 'technique', component: Subagents, refs: ['subagents'] },
 { title: 'Subagent best practices', section: 'Beyond the Fundamentals', tone: 'practice', component: SubagentBestPractices, refs: ['subagentPractices', 'subagentPatterns'] },
 { title: 'Prefer CLI before MCP', section: 'Beyond the Fundamentals', tone: 'practice', component: CliBeforeMcp, refs: ['toolSearch', 'codeMcpSearch'] },
 { title: 'Communicate effectively', section: 'Beyond the Fundamentals', tone: 'practice', component: Communication, refs: ['communication', 'grilling'] },
 { title: 'Currently Trying, Results Pending', component: TryingThings, hero: true, refs: [] },
 { title: 'Let the code speak', section: 'Currently Trying, Results Pending', tone: 'practice', component: LetCodeSpeak, refs: [] },
 { title: 'Own the agent’s memory', section: 'Currently Trying, Results Pending', tone: 'practice', component: OwnMemory, refs: ['memory'] },
 { title: 'Questions?', component: Ending, refs: [] },
]
const flipSlides = new Set([Tools,Compact,Vietnamese,Tradeoffs,ManyTools])
function currentSlide() { const n=Number(location.hash.slice(1));return Number.isInteger(n)&&n>=1&&n<=slides.length?n-1:0 }
function App() {
 const [index,setIndex]=useState(currentSlide), [notes,setNotes]=useState(false), [slot,setSlot]=useState(null)
 function go(next) { location.hash=String(Math.max(0,Math.min(slides.length-1,next))+1) }
 useEffect(()=>{const sync=()=>setIndex(currentSlide());const key=e=>{if(e.target.closest('button,select,input,a,textarea,[data-slide-scroll]')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(currentSlide()+1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(currentSlide()-1)}if(e.key==='n'||e.key==='N')setNotes(n=>!n)};window.addEventListener('hashchange',sync);window.addEventListener('keydown',key);return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('keydown',key)}},[])
 const slide=slides[index], Content=slide.component, cover=slide.hero===true
 useEffect(()=>{document.documentElement.classList.toggle('cover-page',cover);return()=>document.documentElement.classList.remove('cover-page')},[cover])
 return <div className={cover?'stage stage-cover':'stage'}><main className={cover?'slide slide-cover':flipSlides.has(Content)?'slide slide-flip':'slide'} key={index}>{!cover&&<header className={flipSlides.has(Content)?'sr-only':'slide-heading'}>{slide.section&&<SectionLabel section={slide.section} tone={slide.tone}/>}<h1>{slide.title}</h1></header>}<div className="slide-body" role="region" tabIndex={0} aria-label="Slide content"><SlideContext.Provider value={slide}><NotesSlot.Provider value={notes?slot:null}><Content/></NotesSlot.Provider></SlideContext.Provider></div></main><div className="notes" ref={setSlot}/><footer className="chrome"><a href="../../">How agents work</a><button aria-pressed={notes} onClick={()=>setNotes(!notes)}>Notes</button>{slide.refs.length>0&&<span className="sources">Sources: {slide.refs.map(key=><a key={key} href={sources[key][1]} target="_blank" rel="noreferrer">{sources[key][0]}</a>)}</span>}<label className="counter"><span aria-hidden="true">{index+1} / {slides.length}</span><select aria-label={`Slide ${index+1} of ${slides.length}. Choose a slide`} value={index} onChange={e=>go(Number(e.target.value))}>{slides.map(({title,section},i)=><option key={title} value={i}>{i+1}. {section?section+' — ':''}{title}</option>)}</select></label></footer><div className="progress" aria-hidden="true"><span style={{width:`${(index+1)/slides.length*100}%`}}/></div></div>
}
createRoot(document.getElementById('root')).render(<App/> )
