import React, { useEffect, useState } from 'react';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios';

type Props = {
    projectId: number;
    repoName: string; // "laravel/laravel" など
};

// GitHubから返ってくるデータの型定義 (必要なものだけ)
type GithubData = {
    repo: {
        stargazers_count: number;
        html_url: string;
        description: string;
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

const GithubWidget = ({ projectId, repoName }: Props) => {
    const [data, setData] = useState<GithubData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // さっき作ったAPIを叩く
                const response = await client.get(`/api/projects/${projectId}/github`);
                setData(response.data);
            } catch (e) {
                console.error("GitHub data fetch failed", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    // ローディング中
    if (loading) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 animate-pulse">
                <CommandLineIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Loading GitHub info...</span>
            </div>
        );
    }

    // エラーまたはデータなし
    if (error || !data) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400">
                <span className="text-xs">情報の取得に失敗しました</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* リポジトリ情報 */}
            <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Repository</p>
                <div className="flex justify-between items-end">
                    <a 
                        href={data.repo.html_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-600 font-mono font-bold hover:underline truncate block"
                    >
                        {repoName}
                    </a>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        ★ {data.repo.stargazers_count}
                    </span>
                </div>
                {data.repo.description && (
                     <p className="text-xs text-gray-500 mt-1 line-clamp-1">{data.repo.description}</p>
                )}
            </div>

            {/* コミットログ (スクロール可能に) */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50 rounded border border-gray-100 p-2">
                <p className="text-xs font-bold text-gray-500 mb-2 sticky top-0 bg-gray-50 pb-1 border-b border-gray-200">
                    Latest Commits
                </p>
                <ul className="space-y-2">
                    {data.commits.map((item) => (
                        <li key={item.sha} className="text-xs">
                            <a 
                                href={item.html_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="block hover:bg-white p-1 rounded transition hover:shadow-sm"
                            >
                                <p className="text-gray-700 font-medium line-clamp-1" title={item.commit.message}>
                                    {item.commit.message}
                                </p>
                                <div className="flex justify-between text-gray-400 mt-0.5 text-[10px]">
                                    <span>{item.commit.author.name}</span>
                                    <span>{new Date(item.commit.author.date).toLocaleDateString()}</span>
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