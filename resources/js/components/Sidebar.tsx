import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ★追加
import client from '../lib/axios'; // APIクライアント
import { FolderIcon, Square2StackIcon, XMarkIcon } from '@heroicons/react/24/outline';

// サイドバー用に最低限必要なデータの型定義
type SidebarProject = {
    id: number;
    title: string;
    thumbnail_url?: string | null;
};

// ★追加: Propsの定義
type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user } = useAuth(); // ★追加: ユーザー情報を取得
    const [projects, setProjects] = useState<SidebarProject[]>([]);

    // マウント時にプロジェクト一覧を取得
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await client.get('/api/projects/list');
                setProjects(response.data);
            } catch (error) {
                console.error('サイドバーのプロジェクト取得に失敗:', error);
            }
        };
        fetchProjects();
    }, []); // 空の配列 = 初回マウント時のみ実行

    const navClass = ({ isActive }: { isActive: boolean }) => 
        `flex items-center space-x-3 py-2.5 px-4 rounded transition duration-200 ${
            isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <>
            {/* ▼▼▼ 追加: モバイル用オーバーレイ（背景を暗くする） ▼▼▼ */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-gray-500/40 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* ▼▼▼ 修正: fixed配置と条件付きクラスの適用 ▼▼▼ */}
            <div className={`
                bg-gray-800 text-white w-64 flex flex-col h-full py-7 px-2 
                fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            `}>
                {/* ヘッダー部分 */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <div className="text-2xl font-semibold text-center flex-1">
                        Dev Cockpit
                    </div>
                    {/* ★追加: モバイル用閉じるボタン */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto custom-scrollbar">
                    
                    {/* 1. ダッシュボード */}
                    {/* ★追加: onClick={onClose} でリンククリック時に閉じる */}
                    <NavLink to="/dashboard" className={navClass} onClick={onClose}>
                        <Square2StackIcon className="h-5 w-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    {/* 2. プロジェクト一覧セクション */}
                    <div className="mt-8">
                        <p className="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                            Recent Projects
                        </p>
                        <div className="space-y-1">
                            {projects.length === 0 ? (
                                <p className="px-4 text-sm text-gray-600">No projects yet.</p>
                            ) : (
                                projects.map((project) => (
                                    <NavLink 
                                        key={project.id} 
                                        to={`/projects/${project.id}`} 
                                        className={navClass}
                                        onClick={onClose} // ★追加
                                    >
                                        {project.thumbnail_url ? (
                                            <img 
                                                src={project.thumbnail_url} 
                                                alt="" 
                                                className="h-5 w-5 rounded object-cover"
                                            />
                                        ) : (
                                            <FolderIcon className="h-5 w-5" />
                                        )}
                                        <span className="truncate">{project.title}</span>
                                    </NavLink>
                                ))
                            )}
                            <NavLink 
                                to="/dashboard" 
                                className="block px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                onClick={onClose} // ★追加
                            >
                                View All Projects →
                            </NavLink>
                        </div>
                    </div>

                    {/* 3. 管理者メニュー */}
                    {user?.is_admin && (
                        <div className="mt-8">
                            <p className="px-4 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                                Admin Menu
                            </p>
                            <div className="space-y-1">
                                <NavLink to="/admin/users" className={navClass} onClick={onClose}>
                                    Manage Users
                                </NavLink>
                                <NavLink to="/admin/invitations" className={navClass} onClick={onClose}>
                                    Manage InvitationCode
                                </NavLink>
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;