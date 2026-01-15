import React, { useState } from 'react';
import { Project } from '../types';

type Props = {
    project: Project;
};

const ProjectCard = ({ project }: Props) => {
    // 画像の読み込みエラーが発生したかどうかを管理する状態
    const [imageError, setImageError] = useState(false);

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
            </div>
        </div>
    );
};

export default ProjectCard;