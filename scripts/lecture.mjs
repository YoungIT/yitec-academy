// Live-edit one lecture: `pnpm lecture 01` (matches the folder name prefix). Defaults to the first lecture.
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const query = process.argv[2] ?? ''
const folders = readdirSync(resolve(root, 'lectures')).sort()
const match = folders.find((name) => name.startsWith(query))

if (!match) {
  console.error(`No lecture folder starts with "${query}". Available: ${folders.join(', ')}`)
  process.exit(1)
}

const result = spawnSync('pnpm', ['--dir', resolve(root, 'lectures', match), 'dev'], { cwd: root, stdio: 'inherit' })
process.exit(result.status ?? 0)
