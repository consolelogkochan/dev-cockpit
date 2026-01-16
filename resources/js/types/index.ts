// resources/js/types/index.ts

// ユーザー情報の型（既存のものがあれば統合してください）
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

// ★今回追加: プロジェクト情報の型
export interface Project {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string | null;
    github_repo: string | null;
    created_at: string;
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