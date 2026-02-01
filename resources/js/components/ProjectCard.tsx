import React, { useState } from 'react';
import { Project } from '../types';
import { 
    CalendarIcon, 
    TrashIcon, 
    PencilIcon, 
    CommandLineIcon, // GitHub用
    DocumentTextIcon, // Notion用
    PhotoIcon,        // Figma用
    QueueListIcon      
    } from '@heroicons/react/24/outline';
import client from '../lib/axios';
import { useNavigate } from 'react-router-dom'; // ★変更: LinkではなくuseNavigateを使う
import toast from 'react-hot-toast'; // ★追加


type Props = {
    project: Project;
    onDelete: () => void; // ★追加: 削除完了時のコールバック
    onEdit: (project: Project) => void; // ★追加
};

const ProjectCard = ({ project, onDelete, onEdit }: Props) => {
    // 画像の読み込みエラーが発生したかどうかを管理する状態
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate(); // ★追加: ページ遷移用の関数

    // 削除処理
    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // カード自体のクリックイベントを止める（後で詳細画面遷移を作るため）
        
        // 簡易的な確認ダイアログ
        if (!window.confirm(`「${project.title}」を削除しますか？`)) {
            return;
        }

        try {
            await client.delete(`/api/projects/${project.id}`);
            toast.success('プロジェクトを削除しました'); // ★変更: 成功通知
            onDelete(); // 親（Dashboard）に再読み込みを依頼
        } catch (error) {
            console.error(error);
        }
    };

    // ★追加: カード全体がクリックされた時の処理
    const handleCardClick = () => {
        navigate(`/projects/${project.id}`);
    };

    // 連携状況のチェック
    const hasGithub = !!project.github_repo;
    const hasNotion = project.notion_pages && project.notion_pages.length > 0;
    const hasFigma = !!project.figma_file_key; // または figma_url
    const hasPL = !!project.pl_board_id;

    return (
        <div
            onClick={handleCardClick} // ★追加: クリックイベントを設定
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
        >
            {/* 1. サムネイル画像エリア */}
            <div className="h-40 bg-gray-200 w-full relative border-b border-gray-100">
                {/* URLがあり、かつエラーが起きていない場合だけ画像を表示 */}
                {project.thumbnail_url && !imageError ? (
                    <img 
                        src={project.thumbnail_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)} // エラーが起きたらフラグを立てる
                    />
                ) : (
                    // URLがない、または読み込み失敗した場合はグレーの箱を表示
                    <div className="flex items-center justify-center h-full text-gray-400 font-medium bg-gray-100">
                        <span className="text-sm">No Image</span>
                    </div>
                )}

                {/* ステータスバッジ (固定表示) */}
                <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full shadow opacity-90">
                    Active
                </div>
            </div>

            {/* 2. 情報エリア */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                    </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                    {project.description || '説明なし'}
                </p>

                {/* フッターエリア */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    {/* 左側: 連携ツールのアイコン一覧 */}
                    <div className="flex items-center gap-2">
                        {/* GitHub */}
                        {hasGithub && (
                            <div title="GitHub連携中" className="text-gray-700 bg-gray-100 p-1 rounded-md">
                                <CommandLineIcon className="h-4 w-4" />
                            </div>
                        )}
                        {/* Notion */}
                        {hasNotion && (
                            <div title="Notion連携中" className="text-gray-700 bg-gray-100 p-1 rounded-md">
                                <DocumentTextIcon className="h-4 w-4" />
                            </div>
                        )}
                        {/* Figma */}
                        {hasFigma && (
                            <div title="Figma連携中" className="text-gray-700 bg-gray-100 p-1 rounded-md">
                                <PhotoIcon className="h-4 w-4" />
                            </div>
                        )}
                        {/* Project-Lite */}
                        {hasPL && (
                            <div title="Project-Lite連携中" className="text-gray-700 bg-gray-100 p-1 rounded-md">
                                <QueueListIcon className="h-4 w-4" />
                            </div>
                        )}
                        
                        {/* 連携なしの場合のプレースホルダー */}
                        {!hasGithub && !hasNotion && !hasFigma && !hasPL && (
                            <span className="text-xs text-gray-400">未連携</span>
                        )}
                    </div>

                    {/* 右側: 操作ボタン群 (日付は削除してスペース確保) */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(project);
                            }}
                            className="text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors p-1.5 rounded-full"
                            title="編集"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>

                        <button 
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-full"
                            title="削除"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;