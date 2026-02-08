# コーディング規約

## TypeScript
### 関数
- 関数型プログラミングスタイルで実装する
- 破壊的なメソッドは使用しない
- 関数は小さく、副作用を持たせない
- アロー関数のみを使用する
- pushメソッドは使用しない
- forループは使用しない
- forEachは使用しない
- map/flatMap/reduceを優先的に使用する
- 関数の引数はObjectでまとめることを優先する

### 型定義
- 型定義は `type` を使用する
- 配列型は `Array<T>` 形式を使う
- 配列型の場合初期値は空配列 `[]` を使いOptionalにしない
- 公開するメインコンポーネントのProps型は `Props` を使用する

## Next.js
- App Routerを前提とする
- UIとドメインロジックを分離する
- page.tsxではexport defaultを使用し、それ以外ではexport constを使用する
- page.tsx / layout.tsxではexport defaultを使用し、それ以外ではexport constを使用する

# React
- 公開するメインコンポーネントは`index.tsx` に書き `export` する
- メインからのみ使用するローカルコンポーネントは `index.tsx` 内に `export` なしで書く
- `index.tsx` が肥大化しそうな場合は同階層に `ComponentName.tsx` で分割する

## 一般原則
- SOLID / DRY / KISSを指針として扱う
- ドメイン駆動設計(DDD) を指針として扱う
- クリーンアーキテクチャを指針として扱う
