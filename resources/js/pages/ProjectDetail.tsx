import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon, 
    CommandLineIcon, 
    DocumentTextIcon, 
    PhotoIcon, 
    QueueListIcon, 
    NewspaperIcon 
} from '@heroicons/react/24/outline';
import client from '../lib/axios';
import { Project } from '../types';
import GithubWidget from '../components/GithubWidget';
import NotionWidget from '../components/NotionWidget';
import FigmaWidget from '../components/FigmaWidget';
import NewsWidget from '../components/NewsWidget'; // ★追加
import ProjectLiteWidget from '../components/ProjectLiteWidget';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await client.get(`/api/projects/${id}`);
                setProject(response.data.data);
            } catch (error) {
                console.error("データの取得に失敗しました", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">読み込み中...</div>;
    if (!project) return <div className="p-10 text-center text-gray-500">データがありません</div>;

    // 共通のカードスタイル
    const cardStyle = "bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border border-gray-100 flex flex-col";
    const headerStyle = "font-bold text-lg mb-4 flex items-center text-gray-800";

    return (
        <div className="py-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* 戻るボタン */}
                <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    ダッシュボードに戻る
                </Link>

                {/* ★ グリッドシステム変更: lg:grid-cols-6 にして柔軟な配置を実現 */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 auto-rows-min">
                    
                    {/* ------------------------------------------------
                        1行目: 基本情報 (全幅: col-span-6)
                       ------------------------------------------------ */}
                    <div className={`lg:col-span-6 ${cardStyle} md:flex-row gap-6`}>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                            <div className="flex gap-2 mb-4">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                    Active
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {project.description || '説明がありません。'}
                            </p>
                        </div>
                        
                        {project.thumbnail_url && (
                            <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-100 rounded-md overflow-hidden shrink-0">
                                <img 
                                    src={project.thumbnail_url} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* ------------------------------------------------
                        2行目: ProjectLite (2/3) + GitHub (1/3)
                       ------------------------------------------------ */}
                    
                    {/* Project-Lite (左: 4/6 = 2/3) */}
                    <div className={`lg:col-span-4 min-h-100 ${cardStyle} relative group`}>
                        <h3 className={headerStyle}>
                            <QueueListIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Project-Lite
                        </h3>
                        <div className="flex-1">
                            {project.pl_board_id ? (
                                <ProjectLiteWidget 
                                projectId={project.id} 
                                plBoardId={project.pl_board_id}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed">
                                    <p>Project-Lite連携未設定</p>
                                </div>
                            )}
                        </div>
                        
                        {project.pl_board_id && (
                            <p className="text-xs text-gray-400 mt-2 text-right">Board ID: {project.pl_board_id}</p>
                        )}
                    </div>

                    {/* GitHub (右: 2/6 = 1/3) */}
                    <div className={`lg:col-span-2 min-h-100 ${cardStyle}`}>
                        <h3 className={headerStyle}>
                            <CommandLineIcon className="h-5 w-5 mr-2 text-gray-700" />
                            GitHub
                        </h3>
                        {project.github_repo ? (
                            <GithubWidget projectId={project.id} repoName={project.github_repo} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed">
                                未連携
                            </div>
                        )}
                    </div>

                    {/* ------------------------------------------------
                        3行目: Figma (全幅: col-span-6)
                       ------------------------------------------------ */}
                    <div className={`lg:col-span-6 min-h-150 ${cardStyle}`}>
                        <h3 className={headerStyle}>
                            <PhotoIcon className="h-5 w-5 mr-2 text-purple-500" />
                            Figma Design
                        </h3>
                        {project.figma_file_key ? (
                            <div className="flex-1 w-full h-full min-h-125">
                                <FigmaWidget fileKey={project.figma_file_key} />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed">
                                Figma連携設定なし
                            </div>
                        )}
                    </div>

                    {/* ------------------------------------------------
                        4行目: Notion (1/2) + News (1/2)
                       ------------------------------------------------ */}

                    {/* Notion (左: 3/6 = 1/2) */}
                    <div className={`lg:col-span-3 min-h-75 ${cardStyle}`}>
                        <h3 className={headerStyle}>
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-700" />
                            Notion Pages
                        </h3>
                        <div className="flex-1 min-h-0">
                             <NotionWidget projectId={Number(id)} />
                        </div>
                    </div>

                    {/* News (右: 3/6 = 1/2) */}
                    <div className={`lg:col-span-3 min-h-75 ${cardStyle}`}>
                        <h3 className={headerStyle}>
                            <NewspaperIcon className="h-5 w-5 mr-2 text-orange-500" />
                            Latest News
                        </h3>
                        {/* ▼ ここを書き換え */}
                        <div className="flex-1 min-h-0">
                            <NewsWidget />
                        </div>
                        {/* ▲ 書き換えここまで */}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;