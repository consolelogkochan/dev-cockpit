import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ★追加

const Sidebar = () => {
    const { user } = useAuth(); // ★追加: ユーザー情報を取得

    const navClass = ({ isActive }: { isActive: boolean }) => 
        `block py-2.5 px-4 rounded transition duration-200 ${
            isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="text-2xl font-semibold text-center text-white mb-8">
                Dev Cockpit
            </div>
            <nav>
                <NavLink to="/dashboard" className={navClass}>
                    ダッシュボード
                </NavLink>
                {/* 今後作る予定のページ */}
                <NavLink to="/projects" className={navClass}>
                    プロジェクト
                </NavLink>
                {/* ▼▼▼ ★追加: 管理者のみ表示するセクション ▼▼▼ */}
                {user?.is_admin && (
                    <div className="mt-8">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            管理者メニュー
                        </p>
                        <NavLink to="/admin/users" className={navClass}>
                            ユーザー管理
                        </NavLink>
                        {/* ★追加: ここに招待コード管理へのリンクを追加 */}
                        <NavLink to="/admin/invitations" className={navClass}>
                            招待コード管理
                        </NavLink>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;