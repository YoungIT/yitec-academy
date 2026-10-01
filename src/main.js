import './style.css'
import data from '../lectures.json'
import teal from './library/tome-teal.webp'
import terracotta from './library/tome-terracotta.webp'
import sage from './library/tome-sage.webp'
import pink from './library/tome-pink.webp'
import mustard from './library/tome-mustard.webp'
import fillerTeal from './library/spine-teal.webp'
import fillerTerracotta from './library/spine-terracotta.webp'
import fillerSage from './library/spine-sage.webp'
import fillerPink from './library/spine-pink.webp'
import fillerMustard from './library/spine-mustard.webp'
import stack from './library/prop-stack.webp'
import potion from './library/prop-potion.webp'
import scrolls from './library/prop-scrolls.webp'
import hourglass from './library/prop-hourglass.webp'
import candle from './library/prop-candle.webp'

// Each colour is one hand-drawn spine; its emblem is part of the drawing.
// Lecture tomes have a long blank panel for the title; filler books have a short label.
const SPINES = { teal, terracotta, sage, pink, mustard }
const FILLERS = { teal: fillerTeal, terracotta: fillerTerracotta, sage: fillerSage, pink: fillerPink, mustard: fillerMustard }
const COLORS = Object.keys(SPINES)
const PROPS = { stack, potion, scrolls, hourglass, candle }

const STATUS = {
  ready: 'Open lecture',
  draft: 'Open draft',
  planned: 'Not written yet',
}

// One bookcase holds 3 shelves of up to 3 lectures; more than that pages through bookcases.
const SHELVES = 3
const PER_SHELF = 3

// Filler that keeps each shelf from looking empty; LECTURES marks where the shelf's lectures stand.
// Filler books are [colour, height %, lean?]. Items marked `wide` are dropped on narrow screens.
const LECTURES = 'lectures'
const filler = (color, h, lean, wide) => ({ book: [color, h, lean], wide })
const prop = (name, wide) => ({ prop: name, wide })
const SHELF_LAYOUTS = [
  [prop('stack', true), filler('pink', 88, null, true), LECTURES, filler('mustard', 80, 'left'), prop('candle'), filler('terracotta', 84, null, true), filler('sage', 90, null, true), filler('teal', 78, 'right', true)],
  [prop('potion'), filler('terracotta', 80, null, true), filler('pink', 86, null, true), LECTURES, filler('sage', 82), filler('mustard', 88, null, true), filler('teal', 76, 'left', true), prop('scrolls', true)],
  [filler('teal', 86, null, true), filler('mustard', 80, null, true), filler('terracotta', 74, 'right', true), LECTURES, filler('sage', 84, null, true), filler('pink', 80, 'left'), prop('hourglass'), prop('stack', true)],
]
const HEIGHTS = [90, 84, 94, 86, 92, 88, 85, 93, 87]

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = value
    else node.setAttribute(key, value)
  }
  node.append(...children)
  return node
}

function spine(src) {
  return el('img', { class: 'spine', src, alt: '', draggable: 'false' })
}

function lectureBook(lecture, number) {
  const open = lecture.status !== 'planned'
  const color = SPINES[lecture.color] ? lecture.color : COLORS[(number - 1) % COLORS.length]
  const label = el('span', { class: 'label', 'aria-hidden': 'true', text: lecture.title })
  const numeral = el('span', { class: 'numeral', 'aria-hidden': 'true', text: number })
  const attrs = {
    class: `book${open ? '' : ' is-locked'}`,
    style: `--h: ${HEIGHTS[(number - 1) % HEIGHTS.length]}`,
    'aria-label': `Lecture ${number}: ${lecture.title}. ${STATUS[lecture.status]}`,
  }
  const node = open
    ? el('a', { ...attrs, href: `${import.meta.env.BASE_URL}lectures/${lecture.slug}/` }, [spine(SPINES[color]), label, numeral])
    : el('div', { ...attrs, tabindex: '0', role: 'img' }, [spine(SPINES[color]), label, numeral])
  if (!open) node.append(el('span', { class: 'lock', 'aria-hidden': 'true' }))
  node.lecture = { ...lecture, number }
  return node
}

function decor(item) {
  const wide = item.wide ? ' is-wide' : ''
  if (item.prop) return el('img', { class: `prop prop-${item.prop}${wide}`, src: PROPS[item.prop], alt: '', draggable: 'false' })
  const [color, height, lean] = item.book
  return el('span', { class: `filler${lean ? ` lean-${lean}` : ''}${wide}`, style: `--h: ${height}`, 'aria-hidden': 'true' }, [spine(FILLERS[color])])
}

// Split each course into bookcase-sized pages, then spread a page's lectures evenly across the shelves.
const pages = data.courses.flatMap((course) => {
  const result = []
  for (let start = 0; start < course.lectures.length; start += SHELVES * PER_SHELF) {
    result.push({ course, start, lectures: course.lectures.slice(start, start + SHELVES * PER_SHELF) })
  }
  return result
})

function renderPage({ course, start, lectures }) {
  const shelves = []
  let next = 0
  for (let s = 0; s < SHELVES; s++) {
    const count = Math.floor(lectures.length / SHELVES) + (s < lectures.length % SHELVES ? 1 : 0)
    const books = lectures.slice(next, next + count).map((lecture, i) => lectureBook(lecture, start + next + i + 1))
    next += count
    const items = SHELF_LAYOUTS[s % SHELF_LAYOUTS.length].flatMap((item) => (item === LECTURES ? books : [decor(item)]))
    shelves.push(el('div', { class: 'shelf' }, items))
  }
  return [el('h1', { class: 'plaque', text: course.title }), ...shelves]
}

const bookcase = document.getElementById('bookcase')
let page = 0

function show(index) {
  page = index
  hideCard()
  bookcase.replaceChildren(...renderPage(pages[page]))
  if (pager) pager.querySelector('.pager-count').textContent = `${page + 1} / ${pages.length}`
}

let pager = null
if (pages.length > 1) {
  const arrow = (dir, text) =>
    el('button', { class: `pager-arrow pager-${dir}`, type: 'button', 'aria-label': dir === 'prev' ? 'Previous bookcase' : 'Next bookcase', text })
  pager = el('nav', { class: 'pager', 'aria-label': 'Bookcases' }, [arrow('prev', '‹'), el('span', { class: 'pager-count' }), arrow('next', '›')])
  pager.querySelector('.pager-prev').addEventListener('click', () => show((page - 1 + pages.length) % pages.length))
  pager.querySelector('.pager-next').addEventListener('click', () => show((page + 1) % pages.length))
  document.querySelector('.scene').append(pager)
}

// The card that opens beside the book under the pointer or keyboard focus.
const card = el('div', { class: 'card', 'aria-hidden': 'true' })
document.querySelector('.scene').append(card)
let active = null

function showCard(book) {
  if (active === book) return
  active?.classList.remove('is-active')
  active = book
  book.classList.add('is-active')
  const { number, title, summary, status } = book.lecture
  card.replaceChildren(
    el('span', { class: 'card-kicker', text: `Lecture ${number}` }),
    el('span', { class: 'card-title', text: title }),
    el('span', { class: 'card-summary', text: summary }),
    el('span', { class: `card-status status-${status}`, text: status === 'planned' ? 'Sealed · not written yet' : `${STATUS[status]} →` }),
  )
  card.classList.add('is-shown')
  placeCard(book)
}

function hideCard() {
  active?.classList.remove('is-active')
  active = null
  card.classList.remove('is-shown')
}

const narrow = window.matchMedia('(max-width: 640px)')

function placeCard(book) {
  if (narrow.matches) {
    card.style.left = card.style.top = ''
    return
  }
  const r = book.getBoundingClientRect()
  const gap = 20
  const w = card.offsetWidth
  const h = card.offsetHeight
  const right = r.right + gap + w < window.innerWidth - 16
  const left = right ? r.right + gap : Math.max(16, r.left - gap - w)
  const top = Math.min(Math.max(16, r.top + r.height / 2 - h / 2), window.innerHeight - h - 16)
  card.style.left = `${left}px`
  card.style.top = `${top}px`
}

const touch = window.matchMedia('(hover: none)')

bookcase.addEventListener('pointerover', (event) => {
  const book = event.target.closest('.book')
  if (book && event.pointerType === 'mouse') showCard(book)
})
bookcase.addEventListener('pointerout', (event) => {
  const book = event.target.closest('.book')
  if (book && event.pointerType === 'mouse' && !book.contains(event.relatedTarget) && document.activeElement !== book) hideCard()
})
bookcase.addEventListener('focusin', (event) => {
  const book = event.target.closest('.book')
  // Only keyboard focus; a tap also focuses links, and that tap is handled by the click listener.
  if (book?.matches(':focus-visible')) showCard(book)
})
bookcase.addEventListener('focusout', (event) => {
  if (!bookcase.contains(event.relatedTarget)) hideCard()
})

// Touch has no hover: the first tap pulls the book out and shows its card, the second opens it.
document.addEventListener('click', (event) => {
  const book = event.target.closest('.book')
  if (!book) return hideCard()
  if (touch.matches && active !== book) {
    event.preventDefault()
    showCard(book)
  }
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideCard()
})
window.addEventListener('resize', () => active && placeCard(active))

show(0)
