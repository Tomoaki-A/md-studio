/// <reference types="vite/client" />

declare module 'virtual:rules-md' {
  const content: string
  export const rulesPath: string | null
  export default content
}
