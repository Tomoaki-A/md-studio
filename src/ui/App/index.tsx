import rulesContent, { rulesPath } from 'virtual:rules-md'

type Props = {
  title?: string
}

const buildHeaderText = ({ pathValue }: { pathValue: string | null }) =>
  pathValue ? 'plan.md' : 'plan.md (Not Found)'

const buildPathText = ({ pathValue }: { pathValue: string | null }) =>
  pathValue ? pathValue : '指定パス配下に存在しません。'

export const App = ({ title = 'md-studio' }: Props) => {
  const headerText = buildHeaderText({ pathValue: rulesPath })
  const pathText = buildPathText({ pathValue: rulesPath })

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
          <pre className="app__rules-body">{rulesContent}</pre>
        </div>
      </section>
    </main>
  )
}
