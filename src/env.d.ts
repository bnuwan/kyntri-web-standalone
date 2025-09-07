/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_CLIENT_ID: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_ENABLE_AI_FEATURES: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}