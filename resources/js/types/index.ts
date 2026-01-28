// resources/js/types/index.ts

// ユーザー情報の型（既存のものがあれば統合してください）
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    is_admin: boolean; // ★追加
    // ▼▼▼ ★追加: 日付情報を追加してください ▼▼▼
    created_at?: string; // ? をつけておくと、万が一データがなくてもエラーになりません
    updated_at?: string;
}

// ★追加: 招待コードの型
export interface Invitation {
    id: number;
    code: string;
    is_used: boolean;
    created_at: string;
    // リレーション (with('creator')で取得した場合)
    creator?: User; 
}

// Notionページの型定義も追加しておくと便利です
export interface NotionPage {
    id: number;
    page_id: string;
    title?: string;
}

// ★今回追加: プロジェクト情報の型
export interface Project {
    id: number;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    github_repo: string | null;
    pl_board_id: string | null;     // ★追加
    figma_file_key: string | null; // ★追加

    // リレーション (HasMany)
    // バックエンドから "notion_pages" というキーで配列が返ってくるため
    notion_pages?: NotionPage[];

    created_at: string;
    updated_at: string;

    // ページネーション用 (もしあれば)
    user?: User;
}

// Laravelのページネーションレスポンスの型
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}