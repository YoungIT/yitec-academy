// Builds the home page into dist/, then each written lecture into dist/lectures/<slug>/.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const bin = (name) => resolve(root, 'node_modules/.bin', name)

function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(bin('vite'), ['build'])

const { courses } = JSON.parse(readFileSync(resolve(root, 'lectures.json'), 'utf8'))
for (const lecture of courses.flatMap((c) => c.lectures)) {
  if (lecture.status === 'planned') continue
  const entry = resolve(root, 'lectures', lecture.slug, 'slides.md')
  if (!existsSync(entry)) {
    console.error(`lectures.json lists "${lecture.slug}" as ${lecture.status}, but ${entry} doesn't exist.`)
    process.exit(1)
  }
  run(bin('slidev'), ['build', entry, '--base', `/lectures/${lecture.slug}/`, '--out', resolve(root, 'dist/lectures', lecture.slug)])
}
