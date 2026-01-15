import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AuthenticatedLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* 左側：サイドバー */}
            <Sidebar />

            {/* 右側：ヘッダー ＋ メインコンテンツ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                {/* メインコンテンツエリア (スクロール可能) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {/* ここに Dashboard などのページの中身が入る */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AuthenticatedLayout;