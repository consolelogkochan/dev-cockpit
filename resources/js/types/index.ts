// resources/js/types/index.ts

// ユーザー情報の型（既存のものがあれば統合してください）
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
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