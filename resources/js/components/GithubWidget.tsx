import React from 'react'; // useEffect, useState 削除
import { 
    StarIcon, 
    ArrowTopRightOnSquareIcon,
    UserCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CommandLineIcon 
} from '@heroicons/react/24/outline';
import client from '../lib/axios';
import { useQuery } from '@tanstack/react-query'; // ★追加

type Props = {
    projectId: number;
    repoName: string; 
};

type GithubData = {
    repo: {
        stargazers_count: number;
        html_url: string;
        description: string;
        pushed_at: string; // 更新日も使うと便利
    };
    commits: Array<{
        sha: string;
        commit: {
            message: string;
            author: {
                name: string;
                date: string;
            };
        };
        html_url: string;
    }>;
};

// 相対時間を計算する簡易ヘルパー
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(); // 1週間以上前なら日付
};

// Fetcher関数
const fetchGithubData = async (projectId: number) => {
    const response = await client.get(`/api/projects/${projectId}/github`);
    return response.data as GithubData;
};

const GithubWidget = ({ projectId, repoName }: Props) => {
    // ★ useQuery化
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['github', projectId],
        queryFn: () => fetchGithubData(projectId),
        enabled: !!projectId && !!repoName,
        // ★重要: GitHub APIはレート制限があるため、キャッシュ時間を長くする(10分)
        staleTime: 1000 * 60 * 10, 
        retry: 1,
    });

    // --- Loading Skeleton (タイムライン風) ---
    if (isLoading) {
        return (
            <div className="flex flex-col h-full relative animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-4 pr-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>

                {/* Timeline Skeleton */}
                <div className="flex-1 pl-1">
                    <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
                    <div className="relative space-y-4 pl-5">
                        <div className="absolute top-0 bottom-0 left-1.5 w-px bg-gray-100"></div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="relative">
                                <div className="absolute top-1.5 -left-3.75 w-2 h-2 rounded-full bg-gray-200 ring-2 ring-white"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="flex justify-between">
                                    <div className="h-2 bg-gray-200 rounded w-10"></div>
                                    <div className="h-2 bg-gray-200 rounded w-10"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (isError || !data) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 bg-gray-50/50 rounded border border-dashed border-gray-200 p-4">
                <CommandLineIcon className="h-6 w-6 mb-2 text-gray-300" />
                <p className="text-xs mb-1">リポジトリ情報の取得失敗</p>
                <p className="text-[10px] text-gray-300 mb-2">リポジトリ名を確認してください</p>
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

    return (
        <div className="flex flex-col h-full relative">
            {/* 右上の外部リンク (Project-Liteと統一) */}
            <a 
                href={data.repo.html_url} 
                target="_blank" 
                rel="noreferrer" 
                className="absolute top-0 right-0 p-1 text-gray-400 hover:text-indigo-600 transition-colors z-10"
                title="Open GitHub Repo"
            >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            {/* ヘッダー情報 */}
            <div className="mb-4 pr-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-gray-800 truncate" title={repoName}>
                        {repoName}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                        <StarIcon className="h-3 w-3 mr-0.5" />
                        {data.repo.stargazers_count}
                    </span>
                </div>
                {data.repo.description && (
                     <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {data.repo.description}
                     </p>
                )}
            </div>

            {/* コミットログ (タイムライン風) */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Recent Activity
                </p>
                <ul className="relative space-y-0">
                    {/* タイムラインの縦線 */}
                    <div className="absolute top-2 bottom-2 left-1.25 w-px bg-gray-200" />

                    {data.commits.map((item) => (
                        <li key={item.sha} className="group relative pl-5 pb-4 last:pb-0">
                            {/* タイムラインの点 */}
                            <div className="absolute top-1.5 left-0.5 w-1.75 h-1.75 rounded-full bg-gray-300 border border-white ring-2 ring-white group-hover:bg-indigo-500 transition-colors z-10"></div>
                            
                            <a 
                                href={item.html_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block group-hover:bg-gray-50 -ml-2 -my-1 p-2 rounded transition-colors"
                            >
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">
                                        {item.sha.substring(0, 7)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {timeAgo(item.commit.author.date)}
                                    </span>
                                </div>
                                
                                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug mb-1 group-hover:text-indigo-900 transition-colors">
                                    {item.commit.message}
                                </p>
                                
                                <div className="flex items-center text-[10px] text-gray-400">
                                    <UserCircleIcon className="h-3 w-3 mr-1" />
                                    {item.commit.author.name}
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GithubWidget;