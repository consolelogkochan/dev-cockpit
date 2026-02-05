/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PROJECT_LITE_URL: string;
    // 他の環境変数があればここに追加
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}