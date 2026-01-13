import './bootstrap';
import '../css/app.css'; // CSSの読み込み（もしあれば）

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from "./pages/RegisterPage";
import Dashboard from './pages/Dashboard';
import GuestLayout from './layouts/GuestLayout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 認証が不要なページ (レイアウト適用) */}
                <Route element={<GuestLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Login />} />
                </Route>
                
                {/* ダッシュボード (レイアウトなし・後でAuthLayoutを作成) */}
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
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