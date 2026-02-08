import { useEffect, useState } from 'react'
import { getInitialPlanState, loadPlanPathList, loadPlanState } from './scripts'

type Props = {
  title?: string
}

const buildHeaderText = ({ pathValue }: { pathValue?: string }) =>
  pathValue ? 'plan.md' : 'plan.md (Not Found)'

const buildPathText = ({ pathValue }: { pathValue?: string }) =>
  pathValue ? pathValue : '指定パス配下に存在しません。'

const resolveSelectedPath = ({
  currentPath,
  pathList,
}: {
  currentPath?: string
  pathList: Array<string>
}) => {
  if (currentPath && pathList.includes(currentPath)) {
    return currentPath
  }
  const [firstPath] = pathList
  return firstPath
}

export const App = ({ title = 'md-studio' }: Props) => {
  const [planState, setPlanState] = useState(getInitialPlanState)
  const [planPathList, setPlanPathList] = useState<Array<string>>([])
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined)

  useEffect(() => {
    let mounted = true

    const updatePlanState = async () => {
      const nextState = await loadPlanState({ pathValue: selectedPath })
      if (mounted) {
        setPlanState(nextState)
      }
    }

    const intervalId = window.setInterval(updatePlanState, 1500)
    updatePlanState()

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [selectedPath])

  useEffect(() => {
    let mounted = true

    const updatePlanList = async () => {
      const nextList = await loadPlanPathList()
      if (!mounted) {
        return
      }
      setPlanPathList(nextList)
      setSelectedPath((currentPath) =>
        resolveSelectedPath({ currentPath, pathList: nextList }),
      )
    }

    const intervalId = window.setInterval(updatePlanList, 5000)
    updatePlanList()

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const headerText = buildHeaderText({ pathValue: planState.path })
  const pathText = buildPathText({ pathValue: planState.path })

  return (
    <main className="min-h-screen grid place-items-center px-6 py-12">
      <section className="bg-white border border-[#e6dfd3] rounded-2xl p-8 w-full min-h-[100dvh] shadow-card">
        <p className="mb-2 text-[0.9rem] tracking-[0.08em] uppercase text-[#6b5d4e]">
          React + Vite
        </p>
        <h1 className="mb-3 text-[2.2rem]">{title}</h1>
        <p className="text-[#3d3428]">plan.md の内容を読み込みました。</p>
        <div className="mt-6 border-t border-[#efe6d6] pt-4 grid gap-3">
          <div className="flex flex-col gap-1 text-[0.9rem] text-[#5b4f43]">
            <span>{headerText}</span>
            <span className="text-[0.8rem] text-[#8b7a66]">{pathText}</span>
          </div>
          {planPathList.length ? (
            <label className="grid gap-1.5 text-[0.85rem] text-[#5b4f43]">
              <span className="text-[0.8rem] text-[#7a6a58]">読み込むplan.md</span>
              <select
                className="appearance-none border border-[#e6dfd3] rounded-[10px] px-3 py-2 bg-white text-[0.9rem] text-[#2e241c]"
                value={selectedPath ?? ''}
                onChange={(event) => setSelectedPath(event.target.value)}
              >
                {planPathList.map((pathValue) => (
                  <option key={pathValue} value={pathValue}>
                    {pathValue}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {planState.loading ? (
            <div
              className="border border-[#efe6d6] rounded-xl p-4 bg-[#fbf8f2] grid gap-2.5 min-h-[100dvh]"
              aria-label="Loading plan"
            >
              <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-[90%]" />
              <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-full" />
              <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-[55%]" />
              <div className="h-3.5 rounded-full bg-gradient-to-r from-[#f0e7d7] via-[#fff6e6] to-[#f0e7d7] bg-[length:200%_100%] animate-shimmer w-full" />
            </div>
          ) : (
            <pre className="m-0 bg-[#fbf8f2] border border-[#efe6d6] rounded-xl p-4 font-mono text-[0.85rem] leading-[1.6] text-[#2e241c] whitespace-pre-wrap min-h-[100dvh]">
              {planState.content}
            </pre>
          )}
          {planState.error ? (
            <p className="m-0 text-[0.8rem] text-[#b33030]">{planState.error}</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
