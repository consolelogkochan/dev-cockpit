import React, { useState } from 'react';
import { Project } from '../types';
import { CalendarIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios';

type Props = {
    project: Project;
    onDelete: () => void; // ★追加: 削除完了時のコールバック
    onEdit: (project: Project) => void; // ★追加
};

const ProjectCard = ({ project, onDelete, onEdit }: Props) => {
    // 画像の読み込みエラーが発生したかどうかを管理する状態
    const [imageError, setImageError] = useState(false);

    // 削除処理
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // カード自体のクリックイベントを止める（後で詳細画面遷移を作るため）
        
        // 簡易的な確認ダイアログ
        if (!window.confirm(`「${project.title}」を削除しますか？`)) {
            return;
        }

        try {
            await client.delete(`/api/projects/${project.id}`);
            onDelete(); // 親（Dashboard）に再読み込みを依頼
        } catch (error) {
            alert('削除に失敗しました。');
            console.error(error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
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
            </div>

            {/* 2. 情報エリア */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                    {project.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                    {project.description || '説明文がありません'}
                </p>

                {/* 3. フッター（日付・バッジ） */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                        <span>{project.created_at}</span>
                        
                        {project.github_repo && (
                            <a 
                                href={`https://github.com/${project.github_repo}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>GitHub</span>
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2"> {/* ボタンを横並びに */}
                        {/* ★追加: 編集ボタン */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(project);
                            }}
                            className="text-gray-400 hover:text-indigo-500 transition-colors p-1"
                            title="編集"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        
                        {/* ★追加: 削除ボタン (group-hoverでホバー時のみ表示などの演出も可能ですが、まずは常時表示) */}
                        <button 
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="削除"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;