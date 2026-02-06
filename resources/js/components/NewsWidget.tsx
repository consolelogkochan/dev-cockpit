import React from 'react'; // useEffect, useState 削除
import { 
    NewspaperIcon, 
    ArrowTopRightOnSquareIcon,
    UserCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import client from '../lib/axios';
import { useQuery } from '@tanstack/react-query'; // ★追加

type Article = {
    title: string;
    link: string;
    pubDate: string;
    creator: string;
    thumbnail: string | null;
};

// GitHub Widgetと同じ時間計算ロジック
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

// Fetcher関数
const fetchNews = async () => {
    const response = await client.get('/api/news');
    return response.data.articles as Article[];
};

const NewsWidget = () => {
    // ★ useQuery化
    const { data: articles, isLoading, isError, refetch } = useQuery({
        queryKey: ['news'], 
        queryFn: fetchNews,
        staleTime: 1000 * 60 * 30, // ニュースは頻繁に変わらないので30分キャッシュ
        retry: 1,
    });

    // Loading Skeleton (ProjectLiteWidgetとトーンを合わせる)
    if (isLoading) {
        return (
            <div className="flex flex-col h-full relative animate-pulse">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="shrink-0 w-12 h-12 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error State
    if (isError || !articles) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded border border-dashed border-gray-200 p-4">
                <ExclamationTriangleIcon className="h-6 w-6 mb-1 text-gray-300" />
                <p className="text-xs mb-2">ニュース取得エラー</p>
                <button 
                    onClick={() => refetch()}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 shadow-sm rounded-full text-xs text-gray-600 hover:text-indigo-600 transition-all"
                >
                    <ArrowPathIcon className="h-3 w-3" />
                    <span>再試行</span>
                </button>
            </div>
        );
    }

    // Empty State
    if (articles.length === 0) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 bg-gray-50 rounded border border-dashed p-4">
                <p className="text-xs">記事がありません</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* 右上の外部リンク */}
            <a 
                href="https://zenn.dev" 
                target="_blank" 
                rel="noreferrer" 
                className="absolute top-0 right-0 flex items-center gap-1 p-2 text-xs text-indigo-500 hover:text-indigo-700 hover:underline z-10 cursor-pointer bg-white/80 rounded-bl-lg backdrop-blur-sm border-b border-l border-gray-100"
                title="Go to Zenn"
            >
                <span>Zenn.dev</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            {/* ヘッダー */}
            <div className="mb-3 flex items-center text-gray-500">
                <NewspaperIcon className="h-4 w-4 mr-1.5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Tech Trends</span>
            </div>

            {/* 記事リスト */}
            <ul className="space-y-3 overflow-y-auto min-h-0 pr-1 pb-2">
                {articles.map((article, index) => (
                    <li key={index}>
                        <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block group"
                        >
                            <div className="flex gap-3">
                                {/* サムネイル (あれば表示、なければダミーアイコン) */}
                                <div className="shrink-0 w-12 h-12 rounded bg-gray-100 border border-gray-200 overflow-hidden relative">
                                    {article.thumbnail ? (
                                        <img 
                                            src={article.thumbnail} 
                                            alt="thumb" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <NewspaperIcon className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                {/* 記事内容 */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 line-clamp-2 leading-snug mb-1 transition-colors">
                                        {article.title}
                                    </h4>
                                    
                                    <div className="flex items-center text-[10px] text-gray-400 gap-2">
                                        <span className="flex items-center">
                                            <ClockIcon className="h-3 w-3 mr-0.5" />
                                            {timeAgo(article.pubDate)}
                                        </span>
                                        <span className="flex items-center truncate">
                                            <UserCircleIcon className="h-3 w-3 mr-0.5" />
                                            {article.creator}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsWidget;