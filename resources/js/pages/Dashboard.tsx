import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth(); // ★追加: ユーザー情報とログアウト関数を取得

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">ダッシュボード</h1>
                    
                    {/* ログアウトボタン */}
                    <button 
                        onClick={() => logout()}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
                    >
                        ログアウト
                    </button>
                </div>

                <div className="text-lg">
                    {/* ユーザー名を表示 */}
                    <p>ようこそ、<span className="font-bold text-blue-600">{user?.name}</span> さん！</p>
                    <p className="text-gray-600 text-sm mt-2">あなたのメールアドレス: {user?.email}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;