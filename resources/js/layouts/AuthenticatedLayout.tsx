import React, { useState } from 'react'; // ★useState追加
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AuthenticatedLayout = () => {
    // ★追加: サイドバーの開閉状態
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* 左側：サイドバー (Propsを渡す) */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* 右側：ヘッダー ＋ メインコンテンツ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* ヘッダー (開くための関数を渡す) */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                {/* メインコンテンツエリア */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AuthenticatedLayout;