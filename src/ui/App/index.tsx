import { useEffect, useState } from 'react'
import { getInitialPlanState, loadPlanState } from './scripts'

type Props = {
  title?: string
}

const buildHeaderText = ({ pathValue }: { pathValue?: string }) =>
  pathValue ? 'plan.md' : 'plan.md (Not Found)'

const buildPathText = ({ pathValue }: { pathValue?: string }) =>
  pathValue ? pathValue : '指定パス配下に存在しません。'

export const App = ({ title = 'md-studio' }: Props) => {
  const [planState, setPlanState] = useState(getInitialPlanState)

  useEffect(() => {
    let mounted = true

    const updatePlanState = async () => {
      const nextState = await loadPlanState()
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
          <pre className="app__rules-body">{planState.content}</pre>
          {planState.error ? <p className="app__rules-error">{planState.error}</p> : null}
        </div>
      </section>
    </main>
  )
}
