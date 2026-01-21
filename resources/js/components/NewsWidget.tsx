import React, { useEffect, useState } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios';

type Article = {
    title: string;
    link: string;
    pubDate: string;
    creator: string;
    thumbnail: string | null;
};

const NewsWidget = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Step 2で作ったAPIを叩く
                const response = await client.get('/api/news');
                setArticles(response.data.articles);
            } catch (error) {
                console.error("News fetch failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 animate-pulse">
                <GlobeAltIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs">Loading Zenn...</span>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed text-xs">
                記事が取得できませんでした
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <ul className="space-y-3 overflow-y-auto min-h-0 pr-1">
                {articles.map((article, index) => (
                    <li key={index}>
                        <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block p-3 bg-gray-50 rounded border border-gray-100 hover:bg-white hover:shadow-sm hover:border-indigo-100 transition group"
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 line-clamp-2 leading-snug">
                                    {article.title}
                                </h4>
                                {article.thumbnail && (
                                    <img 
                                        src={article.thumbnail} 
                                        alt="thumb" 
                                        className="w-10 h-10 rounded object-cover ml-3 shrink-0 bg-gray-200"
                                    />
                                )}
                            </div>
                            <div className="mt-2 flex items-center text-[10px] text-gray-400">
                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold mr-2">
                                    Zenn
                                </span>
                                <span>{article.pubDate}</span>
                                <span className="mx-1">•</span>
                                <span className="truncate max-w-25">{article.creator}</span>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsWidget;