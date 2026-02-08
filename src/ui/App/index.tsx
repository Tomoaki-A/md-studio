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
    <main className="app">
      <section className="app__card">
        <p className="app__eyebrow">React + Vite</p>
        <h1 className="app__title">{title}</h1>
        <p className="app__lead">plan.md の内容を読み込みました。</p>
        <div className="app__rules">
          <div className="app__rules-header">
            <span>{headerText}</span>
            <span className="app__rules-path">{pathText}</span>
          </div>
          {planPathList.length ? (
            <label className="app__rules-select">
              <span className="app__rules-select-label">読み込むplan.md</span>
              <select
                value={selectedPath}
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
            <div className="app__rules-skeleton" aria-label="Loading plan">
              <div className="app__rules-skeleton-line app__rules-skeleton-line--wide" />
              <div className="app__rules-skeleton-line" />
              <div className="app__rules-skeleton-line app__rules-skeleton-line--short" />
              <div className="app__rules-skeleton-line" />
            </div>
          ) : (
            <pre className="app__rules-body">{planState.content}</pre>
          )}
          {planState.error ? <p className="app__rules-error">{planState.error}</p> : null}
        </div>
      </section>
    </main>
  )
}
