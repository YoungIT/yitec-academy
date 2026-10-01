// Builds the home page into dist/, then each written lecture into dist/lectures/<slug>/.
// A lecture is any folder with a package.json whose `build` script writes a static site to its own dist/.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
// Same variable vite.config.js reads, so lectures live under the home page's path.
const base = process.env.BASE_PATH ?? '/'

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(resolve(root, 'node_modules/.bin/vite'), ['build'])

const { courses } = JSON.parse(readFileSync(resolve(root, 'lectures.json'), 'utf8'))
for (const lecture of courses.flatMap((c) => c.lectures)) {
  if (lecture.status === 'planned') continue
  const dir = resolve(root, 'lectures', lecture.slug)
  if (!existsSync(resolve(dir, 'package.json'))) {
    console.error(`lectures.json lists "${lecture.slug}" as ${lecture.status}, but ${dir}/package.json doesn't exist.`)
    process.exit(1)
  }
  run('pnpm', ['--dir', dir, 'build'], { BASE_PATH: `${base}lectures/${lecture.slug}/` })
  cpSync(resolve(dir, 'dist'), resolve(root, 'dist/lectures', lecture.slug), { recursive: true })
}
