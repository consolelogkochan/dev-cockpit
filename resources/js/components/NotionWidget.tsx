import React, { useEffect, useState } from 'react';
import { 
    DocumentTextIcon, 
    ArrowTopRightOnSquareIcon, 
    BookOpenIcon 
} from '@heroicons/react/24/outline';
import client from '../lib/axios';

type Props = {
    projectId: number;
};

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
    properties: any; 
    error?: string;
};

// 相対時間計算
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
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

    const getPageTitle = (properties: any) => {
        for (const key in properties) {
            if (properties[key].type === 'title') {
                const titleArray = properties[key].title;
                if (titleArray && titleArray.length > 0) {
                    return titleArray[0].plain_text;
                }
            }
        }
        return 'Untitled Page';
    };

    const renderIcon = (icon: NotionPage['icon']) => {
        if (!icon) return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
        if (icon.type === 'emoji') return <span className="text-base leading-none">{icon.emoji}</span>;
        const imageUrl = icon.external?.url || icon.file?.url;
        if (imageUrl) return <img src={imageUrl} alt="icon" className="h-5 w-5 rounded-sm object-cover bg-gray-100" />;
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 animate-pulse">
                <DocumentTextIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Loading Wiki...</span>
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 bg-gray-50 rounded border border-dashed p-4">
                <p className="text-xs">ページ設定なし</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* ヘッダー */}
            <div className="mb-3 flex items-center text-gray-500">
                <BookOpenIcon className="h-4 w-4 mr-1.5 text-gray-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Docs & Wiki</span>
            </div>

            <ul className="space-y-2 overflow-y-auto min-h-0 pr-1 pb-2">
                {pages.map((page) => (
                    <li key={page.id}>
                        {page.error ? (
                            <div className="p-2 bg-red-50 text-red-600 rounded text-xs flex items-center border border-red-100">
                                <span className="mr-2">⚠️</span>
                                <div>
                                    <p className="font-bold">Access Denied</p>
                                    <p className="text-[10px] opacity-75">権限を確認してください</p>
                                </div>
                            </div>
                        ) : (
                            <a 
                                href={page.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center p-2.5 bg-gray-50 rounded border border-gray-100 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition group"
                            >
                                <div className="mr-3 shrink-0 w-6 flex justify-center">
                                    {renderIcon(page.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-gray-700 truncate group-hover:text-indigo-600 transition-colors">
                                            {getPageTitle(page.properties)}
                                        </p>
                                        <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-300 group-hover:text-indigo-400 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        Edited {timeAgo(page.last_edited_time)}
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