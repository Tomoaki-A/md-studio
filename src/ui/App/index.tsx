type Props = {
  title?: string
}

export const App = ({ title = 'md-studio' }: Props) => (
  <main className="app">
    <section className="app__card">
      <p className="app__eyebrow">React + Vite</p>
      <h1 className="app__title">{title}</h1>
      <p className="app__lead">基本構成のセットアップが完了しました。</p>
    </section>
  </main>
)
