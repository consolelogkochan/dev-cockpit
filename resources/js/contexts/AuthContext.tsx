import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import client from '../lib/axios';

// ユーザー情報の型定義 (必要に応じて項目を増やせます)
type User = {
    id: number;
    name: string;
    email: string;
} | null;

// Contextが持つ機能の型定義
type AuthContextType = {
    user: User;
    login: (userData: User) => void; // ログイン成功時にユーザーをセットする
    logout: () => Promise<void>;     // ログアウト処理
    isLoading: boolean;              // 読み込み中かどうか
    getUser: () => Promise<void>;    // サーバーからユーザー情報を再取得する
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ユーザー情報をサーバーから取得する関数
    const getUser = async () => {
        try {
            const response = await client.get('/api/user');
            setUser(response.data);
            // ★追加: データ取得に成功したら、念のためフラグをセット
            localStorage.setItem('loggedIn', 'true');
        } catch (error) {
            setUser(null); // エラーなら未ログイン状態にする
            // ★追加: エラー（セッション切れなど）ならフラグを削除
            localStorage.removeItem('loggedIn');
        } finally {
            setIsLoading(false); // 読み込み完了
        }
    };

    // 初回ロード時に一度だけ実行（リロードしてもログイン維持）
    useEffect(() => {
        // ★修正: フラグがない場合は、サーバーへの問い合わせをスキップする
        if (!localStorage.getItem('loggedIn')) {
            setIsLoading(false);
            return;
        }

        getUser();
    }, []);

    // ログイン成功時に手動でユーザーをセットする関数
    const login = (userData: User) => {
        setUser(userData);
        // ★追加: ログイン成功時にフラグを立てる
        localStorage.setItem('loggedIn', 'true');
    };

    // ログアウト関数
    const logout = async () => {
        try {
            await client.post('/auth/logout'); // Laravel側のセッション削除
            setUser(null); // React側のユーザー情報削除
            // ★追加: ログアウト時にフラグを消す
            localStorage.removeItem('loggedIn');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, getUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// コンポーネントから簡単にContextを使うためのカスタムフック
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};