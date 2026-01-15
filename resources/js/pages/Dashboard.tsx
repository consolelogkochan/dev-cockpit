import React, { useEffect, useState } from 'react';
import client from '../lib/axios';
import { Project } from '../types';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
    // データを入れる箱
    const [projects, setProjects] = useState<Project[]>([]);
    // 読み込み中かどうか
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // データを取得する関数
        const fetchProjects = async () => {
            try {
                // APIを叩く
                const response = await client.get('/api/projects');
                // 受け取ったデータを箱に入れる
                // (Laravel Resourceは { data: [...] } という形で返してくるので .data.data で取り出す)
                setProjects(response.data.data);
            } catch (error) {
                console.error('プロジェクト取得失敗:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // ローディング中の表示
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            {/* ページヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">プロジェクト一覧</h1>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
                    + 新規プロジェクト
                </button>
            </div>

            {/* 一覧表示エリア */}
            {projects.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-gray-200">
                    <p className="text-gray-500 mb-4">まだプロジェクトがありません。</p>
                </div>
            ) : (
                // グリッドレイアウト (スマホ:1列, タブレット:2列, PC:3列)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;