import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

type PlanContentResult = {
  content: string
  path?: string
}

const safeReadDir = ({ dirPath }: { dirPath: string }) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
}

const findPlanFiles = ({ dirPath }: { dirPath: string }): Array<string> => {
  const entries = safeReadDir({ dirPath })
  const matchList = entries
    .filter((entry) => entry.isFile() && entry.name === 'plan.md')
    .map((entry) => path.join(dirPath, entry.name))

  const dirList = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dirPath, entry.name))

  const childMatchList = dirList
    .map((childDir) => findPlanFiles({ dirPath: childDir }))
    .reduce<Array<string>>((acc, list) => acc.concat(list), [])

  return matchList.concat(childMatchList)
}

const getPlanList = ({ rootPath }: { rootPath: string }) =>
  findPlanFiles({ dirPath: rootPath }).sort((a, b) => a.localeCompare(b))

const isPathAllowed = ({ rootPath, targetPath }: { rootPath: string; targetPath: string }) => {
  const resolvedRoot = path.resolve(rootPath)
  const resolvedTarget = path.resolve(targetPath)
  const relativePath = path.relative(resolvedRoot, resolvedTarget)

  return !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
}

const getPlanContent = ({
  rootPath,
  targetPath,
}: {
  rootPath: string
  targetPath?: string
}): PlanContentResult => {
  const planPathList = getPlanList({ rootPath })
  const normalizedTarget = targetPath && isPathAllowed({ rootPath, targetPath }) ? targetPath : undefined
  const selectedPath =
    normalizedTarget && planPathList.includes(normalizedTarget) ? normalizedTarget : planPathList[0]

  if (!selectedPath) {
    return {
      content: `plan.md が ${rootPath} 配下で見つかりませんでした。`,
      path: undefined,
    }
  }

  const content = fs.readFileSync(selectedPath, 'utf-8')

  return { content, path: selectedPath }
}

const createRulesPlugin = ({ rootPath }: { rootPath: string }) => {
  return {
    name: 'rules-md',
    configureServer: (server) => {
      server.middlewares.use('/__plan', (_req, res) => {
        const url = new URL(_req.url ?? '', 'http://localhost')
        const requestPath = url.searchParams.get('path') ?? undefined

        if (requestPath && !isPathAllowed({ rootPath, targetPath: requestPath })) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ content: '許可されていないパスです。', path: undefined }))
          return
        }

        const { content, path: planPath } = getPlanContent({
          rootPath,
          targetPath: requestPath,
        })
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ content, path: planPath ?? null }))
      })

      server.middlewares.use('/__plans', (_req, res) => {
        const paths = getPlanList({ rootPath })
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ paths }))
      })

      server.middlewares.use('/__plan-save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body) as { path?: string; content?: string }
            const targetPath = payload.path
            const content = payload.content

            if (!targetPath || typeof content !== 'string') {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ ok: false, error: 'Invalid payload' }))
              return
            }

            if (!isPathAllowed({ rootPath, targetPath })) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ ok: false, error: 'Invalid path' }))
              return
            }

            fs.writeFileSync(targetPath, content, 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: true }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rootPath = env.RULES_ROOT_PATH || process.cwd()

  return {
    plugins: [react(), createRulesPlugin({ rootPath })],
    server: {
      fs: {
        allow: [rootPath],
      },
    },
  }
})
