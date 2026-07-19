/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_DEV: string
  readonly VITE_SERVER_PROD: string
  readonly VITE_API_BASE_URL: string
  readonly MODE: 'development' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:svg-icons-register' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: any
  export default component
}

declare module 'virtual:svg-icons-names' {
  const iconsNames: string[]
  export default iconsNames
}
