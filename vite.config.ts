import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

type RulesSearchResult = {
  content: string
  path: string | null
}

const safeReadDir = ({ dirPath }: { dirPath: string }) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
}

const findRulesFile = ({ dirPath }: { dirPath: string }): string | null => {
  const entries = safeReadDir({ dirPath })
  const matchList = entries
    .filter((entry) => entry.isFile() && entry.name === 'plan.md')
    .map((entry) => path.join(dirPath, entry.name))

  const [match] = matchList

  if (match) {
    return match
  }

  const dirList = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dirPath, entry.name))

  const childMatchList = dirList
    .map((childDir) => findRulesFile({ dirPath: childDir }))
    .filter((value): value is string => Boolean(value))

  const [childMatch] = childMatchList

  return childMatch ?? null
}

const getRulesContent = ({ rootPath }: { rootPath: string }): RulesSearchResult => {
  const rulesPath = findRulesFile({ dirPath: rootPath })

  if (!rulesPath) {
    return {
      content: `plan.md が ${rootPath} 配下で見つかりませんでした。`,
      path: null,
    }
  }

  const content = fs.readFileSync(rulesPath, 'utf-8')

  return { content, path: rulesPath }
}

const createRulesPlugin = ({ rootPath }: { rootPath: string }) => {
  const virtualModuleId = 'virtual:rules-md'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'rules-md',
    resolveId: (id: string) => (id === virtualModuleId ? resolvedVirtualModuleId : null),
    load: (id: string) => {
      if (id !== resolvedVirtualModuleId) {
        return null
      }

      const { content, path: rulesPath } = getRulesContent({ rootPath })

      return [
        `export const rulesPath = ${JSON.stringify(rulesPath)};`,
        `const content = ${JSON.stringify(content)};`,
        'export default content;',
      ].join('\n')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rootPath = env.RULES_ROOT_PATH || process.cwd()

  return {
    plugins: [react(), createRulesPlugin({ rootPath })],
  }
})
