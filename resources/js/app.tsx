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
                    </Route>
                    
                    {/* ▼▼▼ ここから先は会員限定エリア (AuthGuardで守る) ▼▼▼ */}
                    <Route element={<AuthGuard />}>
                        {/* ★ここに AuthenticatedLayout を挟む */}
                        <Route element={<AuthenticatedLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            {/* 今後ページが増えたらここに足していく */}
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