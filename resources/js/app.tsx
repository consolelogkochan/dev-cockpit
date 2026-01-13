import './bootstrap';
import '../css/app.css'; // CSSの読み込み（もしあれば）

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ログイン画面 */}
                <Route path="/login" element={<Login />} />
                
                {/* ダッシュボード */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* トップページ */}
                <Route path="/" element={<Login />} />
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