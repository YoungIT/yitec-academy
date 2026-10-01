import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const sources = {
  tools: ['Function calling', 'https://developers.openai.com/api/docs/guides/function-calling'],
  claude: ['Claude Code', 'https://code.claude.com/docs/en/how-claude-code-works'],
  codex: ['Codex tools', 'https://github.com/openai/codex'],
  pi: ['Pi coding agent', 'https://github.com/earendil-works/pi/tree/main/packages/coding-agent'],
  mcp: ['MCP tools specification', 'https://modelcontextprotocol.io/specification/2025-06-18/server/tools'],
  skills: ['How skills load', 'https://learn.chatgpt.com/docs/build-skills'],
  cache: ['Prompt caching', 'https://developers.openai.com/api/docs/guides/prompt-caching'],
  tokens: ['Explore a tokenizer', 'https://platform.openai.com/tokenizer'],
  rtk: ['RTK', 'https://github.com/rtk-ai/rtk'],
  caveman: ['Caveman skill', 'https://github.com/JuliusBrussee/caveman'],
}
const titles = ['The model reads tokens', 'Tools give the model a way to act', 'Different agents, different toolboxes', 'What goes into a model request?', 'Follow a real agent loop', 'MCP connects more tools', 'Skills load instructions when needed', 'Prompt caching reuses a prefix', 'Work with the loop', 'Why can Vietnamese cost more?', 'RTK or caveman?', 'Should we add every MCP and skill?']
const refs = [['tokens'], ['tools'], ['claude','codex','pi'], ['tools'], ['pi'], ['mcp'], ['skills'], ['cache'], ['cache','skills'], ['tokens'], ['rtk','caveman'], ['mcp','skills']]
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
function Note({children}) { return <p className="note">{children}</p> }
function Node({label, children, tone = ''}) { return <div className={`node ${tone}`}><strong>{label}</strong>{children && <div>{children}</div>}</div> }
function Tokens() {
  return <><p className="lead">A language model receives a representation of the input and generates an output, one token at a time.</p><div className="pipeline"><Node label="Input">Text, images, supported modalities</Node><span className="connector">→</span><Node label="Model" tone="model">Tokens & other encoded input</Node><span className="connector">→</span><Node label="Output" tone="teal">Text or structured tool calls</Node></div><div className="token-line"><span>Read</span><span> the</span><span> README</span><span>.</span><span className="next-token">Next token…</span></div><Note>Token chips are illustrative. Images use a model-specific encoding; some multimodal models also produce audio or images. This lesson follows a text-based coding agent.</Note></>
}
function Tools() {
 return <><p className="lead">A tool is a function the host exposes. The model asks; the agent application executes.</p><div className="columns"><div><h2>1. Describe the function</h2><Code>{schema}</Code></div><div><h2>2. Receive a structured call</h2><Code>{JSON.stringify({ type: 'function_call', call_id: 'call_1', name: 'read_file', arguments: JSON.stringify({ path: 'README.md' }) }, null, 2)}</Code><div className="boundary"><Node label="Model" tone="model">Produces the call</Node><span>↓ Host boundary</span><Node label="Agent host" tone="teal">Validates, executes, returns result</Node></div><Note>Example uses OpenAI’s format. Other APIs use different envelopes. Valid JSON alone does not grant permission to execute.</Note></div></div></>
}
function Toolboxes() {
 return <><p className="lead">The same model can behave differently when its host gives it different tools, instructions, and permissions.</p><div className="toolboxes"><section><h2>Claude Code</h2><p>File operations, shell execution, search, web access, agent orchestration.</p><div className="tool-tags"><span>Read / Edit / Write</span><span>Bash</span><span>Grep / Glob</span></div></section><section><h2>Codex</h2><p>Workspace inspection, command execution, patching, plus enabled integrations.</p><div className="tool-tags"><span>exec_command</span><span>apply_patch</span><span>Configured MCP tools</span></div></section><section><h2>Pi</h2><p>A small default toolbox, expanded through extensions.</p><div className="tool-tags"><span>read</span><span>write</span><span>edit</span><span>bash</span></div></section></div><Note>Names and availability vary by version, mode, configuration, and approval policy. A tool list is part of the agent’s environment.</Note></>
}
const contextRows = [['System / developer instructions','Behavior, environment, constraints'],['Tool definitions','Names, descriptions, argument schemas'],['User message','“What is in this workspace?”'],['Assistant tool calls','read README.md; read package.json'],['Tool results','File content from the host']]
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

function Context() {
 const [step,setStep] = useState(0), [showJson,setShowJson] = useState(false)
 const phases = ['Initial request', 'Model response', 'Host tool execution', 'Follow-up request']
 return <><p className="lead">The host assembles instructions, tools, and conversation history. Tool results become evidence in the next request.</p><div className="columns"><div className="context-stack">{contextRows.slice(0,Math.min(5,3+step)).map(([title,body],i)=><div key={title} className={`context-row role-${i}`}><strong>{title}</strong><span>{body}</span></div>)}{step===3&&<div className="context-output"><strong>Model output: answer or more calls</strong><span>This response is added to history for a later request.</span></div>}</div><div className="explain"><Node label={phases[step]} tone="model">{['First request: instructions, tool definitions, and the user’s task.','The model returns tool calls. The host appends them to history.','The host executes the calls and appends their results.','Second request: the model sees the original task plus calls and results. It can now answer or request more tools.'][step]}</Node><div className="controls"><button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0}>Previous step</button><button onClick={()=>setStep(Math.min(3,step+1))} disabled={step===3}>Next step</button></div><div className="step-dots" aria-label={`Step ${step+1} of 4`}>{[0,1,2,3].map(i=><span key={i} className={i<=step?'filled':''}/>)}</div><button aria-expanded={showJson} onClick={()=>setShowJson(!showJson)}>{showJson?'Hide request example':'Show request example'}</button></div></div>{showJson&&<div className="request-example"><Code>{requestExample}</Code><Note>Example OpenAI Responses request; choose a supported model before using it. The matching call_id connects a tool result to the model’s call. Other providers use different role names and envelopes.</Note></div>}<Note>The stack is conceptual: tool definitions may be supplied separately from messages. A model response is output, then becomes history for a subsequent request.</Note></>
}

const replay = [
 ['User', 'what is in this workspace?', 'The task enters the conversation.'],
 ['Assistant', 'I’ll inspect the repository structure and its main metadata/docs, then summarize what the workspace contains.', 'The model chooses to inspect before answering.'],
 ['Tool calls', 'bash: inspect directory structure\nread: {"path":"README.md","offset":1,"limit":300}\nread: {"path":"package.json","offset":1,"limit":300}', 'First batch: three genuine tool calls. The bash command is abbreviated.'],
 ['Tool results', 'README.md excerpt:\n# YITEC Academy\nSeminar slides for the YITEC team.\n\npackage.json excerpt:\n"name": "yitec-academy"\n"scripts": { "dev": "vite", … }', 'The host returns filesystem evidence. Excerpts omit irrelevant content.'],
 ['More tool calls', 'read: {"path":"lectures.json","offset":1,"limit":300}\nbash: list source files\nread: {"path":"src/main.js","offset":1,"limit":250}\nread: {"path":"vite.config.js","offset":1,"limit":150}', 'A second batch asks for the catalog and implementation.'],
 ['More tool results', 'lectures.json excerpt:\n"title": "How agents work"\n"slug": "01-what-an-agent-is"\n"status": "draft"\n\nSource files include:\nsrc/main.js\nlectures/01-what-an-agent-is/slides.md', 'The results describe the workspace as it existed at the time of the recording.'],
 ['Assistant answer', 'This workspace is **YITEC Academy**, a small static site for internal seminar/course material.', 'The model summarizes the gathered evidence; this turn ends.'],
]
function Replay() {
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
 const [step,setStep] = useState(0), [playing,setPlaying] = useState(false)
 useEffect(()=>{if(!playing)return;const id=setInterval(()=>setStep(s=>{if(s===replay.length-1){setPlaying(false);return s}return s+1}),reducedMotion?4500:2400);return()=>clearInterval(id)},[playing,reducedMotion])
 return <><p className="lead">One user task. Two rounds of tools. One final answer.</p><div className="columns"><div className="loop-map"><Node label="User task" tone={step===0?'active':''}/><span>↓</span><Node label="Model" tone={step===1||step===2||step===4||step===6?'model active':'model'}>Answer or request tools</Node><span>↓ Tool calls</span><Node label="Host executes" tone={step===3||step===5?'teal active':'teal'}>Results go back into context</Node><span className="return-path">↶ Request model again</span></div><div className="replay"><div className="replay-event" key={step}><div className="replay-heading"><strong>{replay[step][0]}</strong><span>{step+1} / {replay.length}</span></div><Code>{replay[step][1]}</Code><p aria-live="polite">{replay[step][2]}</p></div><div className="controls"><button onClick={()=>{setPlaying(false);setStep(Math.max(0,step-1))}} disabled={step===0}>Back</button><button onClick={()=>{if(step===replay.length-1)setStep(0);setPlaying(!playing)}}>{playing?'Pause replay':'Play replay'}</button><button onClick={()=>{setPlaying(false);setStep(Math.min(replay.length-1,step+1))}} disabled={step===replay.length-1}>Next event</button></div></div></div><Note>Selected excerpts from the supplied Pi session, October 1, 2026. This is a historical replay; the project has since changed. No tools run in this deck.</Note></>
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
function Skills() {
 const [loaded,setLoaded]=useState(false)
 return <><p className="lead">A skill is a package of task instructions, sometimes with scripts and reference files. It teaches a workflow.</p><div className="disclosure"><Node label="At discovery">Name + description<br/>“frontend-design: build intentional interfaces”</Node><span className="connector">→</span><Node label={loaded?'Selected: full instructions':'When the task matches'} tone="model">{loaded?'Read SKILL.md and follow the workflow.':'Load SKILL.md only when useful.'}</Node><span className="connector">→</span><Node label="As needed" tone="teal">Read referenced files<br/>Run supporting scripts</Node></div><button onClick={()=>setLoaded(!loaded)}>{loaded?'Reset discovery':'Select the design skill'}</button><Note>Progressive disclosure keeps full instructions out of every request. Exact discovery behavior depends on the agent host. A skill does not automatically create a new model or tool.</Note></>
}
function Cache() {
 const [mode,setMode]=useState('append')
 const blocks=['Instructions','Tool schemas','User task','Tool call','Tool result','New message']
 return <><p className="lead">A cache can reuse computation for an identical beginning of a request. Matching stops where the prefix changes.</p><div className="controls segmented"><button aria-pressed={mode==='append'} onClick={()=>setMode('append')}>Append a message</button><button aria-pressed={mode==='edit'} onClick={()=>setMode('edit')}>Edit an earlier message</button></div><div className="cache-diagram"><div className="cache-label">Previous request</div><div className="cache-track">{blocks.slice(0,5).map(x=><span key={x}>{x}</span>)}</div><div className="cache-label">Next request</div><div className="cache-track">{blocks.map((x,i)=><span key={x} className={i<(mode==='append'?5:2)?'matched':i===2&&mode==='edit'?'changed':'fresh'}>{i===2&&mode==='edit'?'Edited task':x}</span>)}</div></div><div className="legend"><span className="matched">Matching prefix</span><span className="fresh">New computation</span></div><p className="cache-result" aria-live="polite">{mode==='append'?'Same history, new suffix: the earlier prefix can remain eligible for reuse.':'The edited task breaks the match: everything after it needs fresh computation for this prefix.'}</p><Note>Conceptual illustration, not a billing calculator. Providers have minimum lengths, cache lifetimes, supported blocks, and different pricing. Cache hits are not guaranteed; caching does not increase the context window.</Note></>
}
function Practices() {
 return <><p className="lead">Give the host and model a clear task, relevant evidence, and a way to check completion.</p><div className="practice-list"><section><span>Task</span><h2>State the outcome and constraints</h2><p>“Build the first lesson in React. Follow this draft. Keep the existing URL.”</p></section><section><span>Context</span><h2>Load what matters</h2><p>Point to the right files. Enable useful tools and skills. Keep tool results focused.</p></section><section><span>History</span><h2>Append corrections when practical</h2><p>This can preserve a reusable prefix. Correctness still comes first; edit or restart when needed.</p></section><section><span>Evidence</span><h2>Inspect results and verify</h2><p>A tool call can fail. An answer can be wrong. Review changes and use meaningful checks.</p></section></div></>
}
function Question({question,children}) {
 const [revealed,setRevealed]=useState(false)
 return <><p className="question">{question}</p><button className="reveal-button" aria-expanded={revealed} onClick={()=>setRevealed(!revealed)}>{revealed?'Hide explanation':'Reveal explanation'}</button>{revealed?<div className="answer">{children}</div>:<div className="think"><span>Think about the request.</span><p>Where are the tokens spent? What does the host actually do?</p></div>}</>
}
function Vietnamese() {
 return <Question question="Does Vietnamese cost more because the model translates it into English first?"><div className="pipeline"><Node label="Vietnamese text"/><span className="connector">→</span><Node label="Tokenizer" tone="model">Model-specific segmentation</Node><span className="connector">→</span><Node label="Model" tone="teal">Processes the tokens directly</Node></div><p>No translation step is required. The same meaning can need different numbers of tokens in different languages, depending on the tokenizer, wording, and script.</p><p>For token-priced APIs, more input or output tokens can cost more. Vietnamese is not always more expensive: compare your actual prompts in the model’s tokenizer and check pricing.</p><Note>No invented token counts: use the tokenizer source below to try equivalent sentences.</Note></Question>
}
function Tradeoffs() {
 return <Question question="RTK and caveman both reduce tokens. Do they reduce the same thing?"><div className="columns"><section className="comparison"><h2>RTK: filter command output</h2><div className="mini-flow"><span>Verbose CLI result</span><b>↓ RTK</b><span>Relevant compact result</span></div><p>RTK wraps supported CLI commands and filters their output before the agent reads it.</p><p>Useful for noisy logs; inspect full output when filtered details matter.</p></section><section className="comparison"><h2>Caveman: change prose style</h2><div className="mini-flow"><span>Instructions to the model</span><b>↓ Caveman skill</b><span>Shorter generated prose</span></div><p>The caveman skill asks for terse responses. It changes how the agent communicates.</p><p>Useful for brevity; it can lose nuance or readability. Keep explanations and precision when needed.</p></section></div><Note>This compares RTK with caveman’s skill mode; caveman also offers a proxy variant. Savings depend on workload. Smaller output alone does not prove a better result.</Note></Question>
}
function ManyTools() {
 return <Question question="Should we install every MCP server and skill so the agent can do more?"><div className="columns"><div><h2>More available capabilities</h2><div className="tool-cloud"><span>Database</span><span>Browser</span><span>Design skill</span><span>Docs</span><span>Deploy</span><span>Analytics</span></div></div><div><h2>More context and choices</h2><div className="budget"><span>Instructions</span><span>Tool definitions</span><span>Skill metadata</span><span>Task + evidence</span></div></div></div><p>Enable what serves the task. Exposed tool schemas and skill metadata can add input tokens and competing choices. Full skill instructions usually load only when selected.</p><p>Use host support for discovery or deferred loading where available. Check permissions and tool results. A large installed collection is different from loading everything into a request.</p></Question>
}
const components = [Tokens,Tools,Toolboxes,Context,Replay,Mcp,Skills,Cache,Practices,Vietnamese,Tradeoffs,ManyTools]
function currentSlide() { const n=Number(location.hash.slice(1));return Number.isInteger(n)&&n>=1&&n<=titles.length?n-1:0 }
function App() {
 const [index,setIndex]=useState(currentSlide)
 function go(next) { location.hash=String(Math.max(0,Math.min(titles.length-1,next))+1) }
 useEffect(()=>{const sync=()=>setIndex(currentSlide());const key=e=>{if(e.target.closest('button,select,input,a,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(currentSlide()+1)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(currentSlide()-1)}};window.addEventListener('hashchange',sync);window.addEventListener('keydown',key);return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('keydown',key)}},[])
 const Content=components[index]
 return <div className="deck"><header className="deck-header"><a href="../../" className="brand">YITEC <span>Academy</span></a><span className="course-name">How agents work</span><label className="slide-picker"><span className="sr-only">Choose a slide</span><select value={index} onChange={e=>go(Number(e.target.value))}>{titles.map((title,i)=><option key={title} value={i}>{i+1}. {title}</option>)}</select></label></header><main className="slide" key={index}><div className="slide-title"><span className="slide-number">{String(index+1).padStart(2,'0')}</span><h1>{titles[index]}</h1></div><div className="slide-body" role="region" tabIndex={0} aria-label="Slide content"><Content/></div><aside className="sources" aria-label="Slide sources">Sources: {refs[index].map(key=><a key={key} href={sources[key][1]} target="_blank" rel="noreferrer">{sources[key][0]}</a>)}</aside></main><footer className="deck-footer"><div className="navigation"><button onClick={()=>go(index-1)} disabled={index===0} aria-label="Previous slide">← Previous</button><span>{index+1} / {titles.length}</span><button onClick={()=>go(index+1)} disabled={index===titles.length-1} aria-label="Next slide">Next →</button></div><span className="keyboard-hint">Use ← → to navigate</span><div className="progress" aria-hidden="true"><span style={{width:`${(index+1)/titles.length*100}%`}}/></div></footer></div>
}
createRoot(document.getElementById('root')).render(<App/> )
