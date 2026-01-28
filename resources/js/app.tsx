import './bootstrap';
import '../css/app.css'; // CSSの読み込み（もしあれば）

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from "./pages/RegisterPage";
import Dashboard from './pages/Dashboard';
import GuestLayout from './layouts/GuestLayout';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import ProjectDetail from './pages/ProjectDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserList from './pages/admin/UserList'; // ★追加
import InvitationList from './pages/admin/InvitationList'; // ★追加
import AdminGuard from './components/AdminGuard'; // ★追加

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* 認証が不要なページ (レイアウト適用) */}
                    <Route element={<GuestLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Login />} />
                        {/* ★ここに追加！ログインできなくてもアクセスできないと困るため */}
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/password-reset/:token" element={<ResetPassword />} />
                    </Route>
                    
                    {/* ▼▼▼ ここから先は会員限定エリア (AuthGuardで守る) ▼▼▼ */}
                    <Route element={<AuthGuard />}>
                        {/* ★ここに AuthenticatedLayout を挟む */}
                        <Route element={<AuthenticatedLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            {/* 今後ページが増えたらここに足していく */}

                            {/* ▼ ★追加: 詳細ページのルート (:id は可変パラメータ) */}
                            <Route path="/projects/:id" element={<ProjectDetail />} />

                            {/* ▼▼▼ ★追加: 管理者専用エリア ▼▼▼ */}
                            <Route element={<AdminGuard />}>
                                <Route path="/admin/users" element={<UserList />} />
                                <Route path="/admin/invitations" element={<InvitationList />} /> {/* ★追加 */}
                            </Route>
                        </Route>
                    </Route>
                    {/* ▲▲▲ 会員限定エリア終了 ▲▲▲ */}
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}