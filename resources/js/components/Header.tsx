import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // ユーザー名の頭文字を取得（なければ 'U'）
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
                管理画面
            </h2>
            
            {/* 右側のユーザーエリア */}
            <div className="relative">
                {/* 1. アバターボタン */}
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <span className="text-gray-600 text-sm hidden md:block">{user?.name}</span>
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg hover:bg-indigo-600 transition">
                        {userInitial}
                    </div>
                </button>

                {/* 2. ドロップダウンメニュー (isDropdownOpenがtrueの時だけ表示) */}
                {isDropdownOpen && (
                    <>
                        {/* メニューの外側をクリックしたら閉じるための透明な幕 */}
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsDropdownOpen(false)}
                        ></div>

                        {/* メニュー本体 */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm text-gray-500">ログイン中:</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            </div>

                            <Link 
                                to="/profile" // まだ作りませんが、リンクだけ用意
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                プロフィール
                            </Link>
                            
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    logout();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                ログアウト
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;