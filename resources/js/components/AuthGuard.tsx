import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthGuard = () => {
    const { user, isLoading } = useAuth();

    // 1. まだ「ログインしてるか確認中」の時は、画面に何も出さない（またはローディング）
    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
    }

    // 2. 確認が終わった結果、「ユーザーがいなかった」場合はログイン画面へ強制送還
    if (!user) {
        return <Navigate to="/login" />;
    }

    // 3. ユーザーがいるなら、本来見たいページ（Outlet）を表示させる
    return <Outlet />;
};

export default AuthGuard;