import React, { useEffect, useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios';

type Props = {
    projectId: number;
};

// Notion APIのデータ型 (必要な部分のみ定義)
type NotionPage = {
    id: string;
    url: string;
    icon: {
        type: 'emoji' | 'external' | 'file';
        emoji?: string;
        external?: { url: string };
        file?: { url: string };
    } | null;
    last_edited_time: string;
    properties: any; // プロパティは可変なのでanyで逃げる
    error?: string; // エラー時のメッセージ
};

const NotionWidget = ({ projectId }: Props) => {
    const [pages, setPages] = useState<NotionPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get(`/api/projects/${projectId}/notion`);
                setPages(response.data.pages);
            } catch (e) {
                console.error("Notion data fetch failed", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    // タイトルを取得するヘルパー関数
    // Notionは "Name" や "タイトル" などカラム名が変わる可能性があるため、type: 'title' を探すのが確実
    const getPageTitle = (properties: any) => {
        for (const key in properties) {
            if (properties[key].type === 'title') {
                const titleArray = properties[key].title;
                if (titleArray && titleArray.length > 0) {
                    return titleArray[0].plain_text;
                }
            }
        }
        return '無題のページ';
    };

    // アイコンを表示するヘルパー関数
    const renderIcon = (icon: NotionPage['icon']) => {
        if (!icon) return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
        
        if (icon.type === 'emoji') {
            return <span className="text-lg leading-none">{icon.emoji}</span>;
        }
        
        const imageUrl = icon.external?.url || icon.file?.url;
        if (imageUrl) {
            return <img src={imageUrl} alt="icon" className="h-5 w-5 rounded-sm object-cover" />;
        }

        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 animate-pulse">
                <DocumentTextIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Loading Notion...</span>
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed text-xs">
                Notionページ設定なし
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <ul className="space-y-2 overflow-y-auto min-h-0 pr-1">
                {pages.map((page) => (
                    <li key={page.id}>
                        {page.error ? (
                            // エラー（権限なしなど）の場合
                            <div className="p-2 bg-red-50 text-red-600 rounded text-xs flex items-center">
                                <span className="mr-2">⚠️</span>
                                <div>
                                    <p className="font-bold">Access Denied</p>
                                    <p className="text-[10px]">コネクト設定を確認してください</p>
                                </div>
                            </div>
                        ) : (
                            // 正常に取得できた場合
                            <a 
                                href={page.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center p-2 bg-gray-50 rounded border border-gray-100 hover:bg-white hover:shadow-sm transition group"
                            >
                                <div className="mr-3 shrink-0">
                                    {renderIcon(page.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-indigo-600 transition-colors">
                                        {getPageTitle(page.properties)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        最終更新: {new Date(page.last_edited_time).toLocaleDateString()}
                                    </p>
                                </div>
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotionWidget;