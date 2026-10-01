import './style.css'
import data from '../lectures.json'

const STATUS = {
  ready: 'Open slides',
  draft: 'Open draft',
  planned: 'Not written yet',
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = value
    else node.setAttribute(key, value)
  }
  node.append(...children)
  return node
}

function lectureRow(lecture, index) {
  const open = lecture.status !== 'planned'
  const body = [
    el('span', { class: 'lecture-number', 'aria-hidden': 'true', text: String(index + 1) }),
    el('span', { class: 'lecture-text' }, [
      el('span', { class: 'lecture-title', text: lecture.title }),
      el('span', { class: 'lecture-summary', text: lecture.summary }),
    ]),
    el('span', { class: 'lecture-status', text: STATUS[lecture.status] }),
  ]
  const inner = open
    ? el('a', { class: 'lecture', href: `${import.meta.env.BASE_URL}lectures/${lecture.slug}/` }, body)
    : el('div', { class: 'lecture is-planned' }, body)
  return el('li', {}, [inner])
}

function typeTitle(target, text) {
  const heading = target.closest('.course-title')
  if (reduceMotion) {
    heading.classList.add('is-typed')
    return
  }
  let i = 0
  const tick = () => {
    target.textContent = text.slice(0, ++i)
    if (i < text.length) setTimeout(tick, 70)
    else heading.classList.add('is-typed')
  }
  setTimeout(tick, 400)
}

const main = document.getElementById('courses')

data.courses.forEach((course, courseIndex) => {
  // The full title sits invisibly underneath to hold the final layout while the visible copy types out.
  const words = course.title.split(' ')
  const ghost = el('span', { class: 'title-ghost' }, [
    `${words.slice(0, -1).join(' ')} `,
    el('span', { class: 'nowrap' }, [words.at(-1), el('span', { class: 'cursor' })]),
  ])
  const typed = el('span')
  const heading = el('h1', { class: 'course-title', 'aria-label': course.title }, [
    ghost,
    el('span', { class: 'title-typed', 'aria-hidden': 'true' }, [typed, el('span', { class: 'cursor' })]),
  ])
  const ready = course.lectures.filter((l) => l.status !== 'planned').length
  const section = el('section', { class: 'course' }, [
    heading,
    el('p', { class: 'course-summary', text: course.summary }),
    el('p', { class: 'course-progress', text: `${ready} of ${course.lectures.length} lectures available` }),
    el('ol', { class: 'lectures' }, course.lectures.map(lectureRow)),
  ])
  main.append(section)

  // Only the first course gets the typing moment; the rest render in place.
  if (courseIndex === 0) typeTitle(typed, course.title)
  else heading.classList.add('is-typed')
})
