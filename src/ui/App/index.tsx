import { useEffect, useState } from 'react'

type Props = {
  title?: string
}

const buildHeaderText = ({ pathValue }: { pathValue: string | null }) =>
  pathValue ? 'plan.md' : 'plan.md (Not Found)'

const buildPathText = ({ pathValue }: { pathValue: string | null }) =>
  pathValue ? pathValue : '指定パス配下に存在しません。'

type PlanPayload = {
  content: string
  path: string | null
}

type PlanState = {
  content: string
  path: string | null
  error: string | null
}

const defaultState: PlanState = {
  content: 'plan.md を読み込み中です。',
  path: null,
  error: null,
}

const fetchPlan = async (): Promise<PlanPayload> => {
  const response = await fetch('/__plan')
  if (!response.ok) {
    throw new Error('plan.md の取得に失敗しました。')
  }
  return response.json()
}

export const App = ({ title = 'md-studio' }: Props) => {
  const [planState, setPlanState] = useState<PlanState>(defaultState)

  useEffect(() => {
    let mounted = true

    const loadPlan = async () => {
      try {
        const payload = await fetchPlan()
        if (mounted) {
          setPlanState({ content: payload.content, path: payload.path, error: null })
        }
      } catch (error) {
        if (mounted) {
          setPlanState({
            content: 'plan.md の読み込みに失敗しました。',
            path: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    const intervalId = window.setInterval(loadPlan, 1500)
    loadPlan()

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
