import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminGuard = () => {
    const { user, isLoading } = useAuth();

    // 読み込み中は何も表示しない（またはローディング表示）
    if (isLoading) {
        return <div className="p-4 text-center">Checking permissions...</div>;
    }

    // ユーザーが存在しない、または管理者でない場合はダッシュボードへ強制送還
    if (!user || !user.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    // 問題なければページを表示
    return <Outlet />;
};

export default AdminGuard;