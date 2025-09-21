interface ImportMetaEnv {
  readonly VITE_SERVER_DEV: string
  readonly VITE_SERVER_TEST: string
  readonly VITE_SERVER_PROD: string
  readonly VITE_API_BASE_URL: string
  readonly MODE: 'development' | 'test' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
