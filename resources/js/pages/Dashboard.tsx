import React, { useEffect, useState } from 'react';
import client from '../lib/axios';
import { Project, PaginatedResponse } from '../types';
import ProjectCard from '../components/ProjectCard';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal'; // ★追加
import CreateProjectForm from '../components/CreateProjectForm';

const Dashboard = () => {
    // データを入れる箱 (ページネーション情報付きに変更)
    const [data, setData] = useState<PaginatedResponse<Project> | null>(null);
    const [loading, setLoading] = useState(true);

    // 状態管理: ページ番号と検索ワード
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ★追加: 再取得のためのトリガー
    // この数字が変わるたびに useEffect が走るようにするトリックです
    const [refreshKey, setRefreshKey] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false); // ★追加

    // ★追加: 編集中のプロジェクトを保持 (nullなら新規作成モード)
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // 検索入力の「間引き」処理 (入力するたびにAPIを叩かないように)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // 検索条件が変わったら1ページ目に戻す
        }, 500); // 0.5秒入力が止まったら検索実行
        return () => clearTimeout(timer);
    }, [search]);

    // データ取得 (ページか検索ワードが変わるたびに実行)
    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                // パラメータを付けてリクエスト
                const response = await client.get('/api/projects', {
                    params: { page, search: debouncedSearch }
                });
                setData(response.data);
            } catch (error) {
                console.error('取得失敗:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [page, debouncedSearch, refreshKey]); // 👈 依存配列に refreshKey を追加

    // 新規作成ボタンが押された時
    const handleCreate = () => {
        setEditingProject(null); // 空にする
        setIsModalOpen(true);
    };

    // 編集ボタンが押された時
    const handleEdit = (project: Project) => {
        setEditingProject(project); // データをセット
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* ヘッダーエリア */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">プロジェクト一覧</h1>
                
                <div className="flex w-full md:w-auto gap-2">
                    {/* 検索バー */}
                    <input 
                        type="text" 
                        placeholder="プロジェクトを検索..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    
                    {/* ★修正: onClickを追加 */}
                    <button
                        onClick={handleCreate}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm text-sm font-medium whitespace-nowrap"
                    >
                        + 新規作成
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : !data || data.data.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-gray-200">
                    <p className="text-gray-500">
                        {debouncedSearch ? '該当するプロジェクトが見つかりません。' : 'まだプロジェクトがありません。'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.data.map((project) => (
                            <ProjectCard 
                            key={project.id} 
                            project={project}
                            // ★追加: 削除されたら refreshKey を更新して再取得
                            onDelete={() => setRefreshKey(prev => prev + 1)} 
                            onEdit={handleEdit} // ★追加: 関数を渡す
                            />
                        ))}
                    </div>

                    {/* ★追加: モーダルの配置 */}
                    <Modal
                        isOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                        title="新規プロジェクト作成"
                    >
                        {/* ↓ここにフォームを配置 */}
                        <CreateProjectForm 
                            onCancel={() => setIsModalOpen(false)} 
                            // ★追加: 成功したら refreshKey を更新して再取得を走らせる
                            onSuccess={() => setRefreshKey(prev => prev + 1)}
                            // ★追加: 編集データを渡す
                            initialData={editingProject ?? undefined}
                        />
                    </Modal>
                    
                    {/* ページネーション */}
                    <Pagination 
                        current={data.meta.current_page} 
                        last={data.meta.last_page} 
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
};

export default Dashboard;