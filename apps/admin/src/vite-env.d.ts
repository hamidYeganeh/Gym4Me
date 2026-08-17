/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_CLUBS_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
