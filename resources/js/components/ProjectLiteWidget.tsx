import React from 'react';
import { 
    ExclamationCircleIcon, 
    ClockIcon, 
    CalendarIcon,
    ArrowTopRightOnSquareIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import client from '../lib/axios';
import { useQuery } from '@tanstack/react-query'; // ★ TanStack Query

type Task = {
    id: number;
    title: string;
    end_date: string;
    is_completed: boolean;
};

type SummaryData = {
    board_title: string;
    progress: {
        total: number;
        completed: number;
        rate: number;
        overdue_count: number;
    };
    tasks: {
        today: Task[];
        week: Task[];
    };
};

type Props = {
    projectId: number;
    plBoardId: string | number;
};

// --- API Fetcher関数 (コンポーネントの外に定義) ---
const fetchProjectLiteData = async (projectId: number) => {
    // データ取得だけを担当。エラーはReact Queryがキャッチするのでtry-catch不要
    const response = await client.get(`/api/projects/${projectId}/project-lite`);
    return response.data as SummaryData;
};

// 環境変数からURLを取得 (なければデフォルト値)
const PL_BASE_URL = import.meta.env.VITE_PROJECT_LITE_URL || 'https://project-lite.ikshowcase.site';

const ProjectLiteWidget = ({ projectId, plBoardId }: Props) => {
    // ★ 宣言的データフェッチ: useQuery
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['projectLite', projectId], // このキーでキャッシュ管理される
        queryFn: () => fetchProjectLiteData(projectId),
        enabled: !!projectId && !!plBoardId, // IDがある時だけ実行
        staleTime: 1000 * 60 * 5, // 5分間は「新鮮」とみなして再取得しない
        retry: 1, // エラー時の自動再試行回数
    });

    // --- 1. Loading State (スケルトンUI) ---
    // ユーザーを待たせている間、レイアウト崩れを防ぐためのプレースホルダー
    if (isLoading) {
        return (
            <div className="flex h-full min-h-62.5 relative animate-pulse">
                {/* 左側スケルトン */}
                <div className="w-3/5 pr-4 border-r border-gray-100 flex flex-col gap-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-100 rounded w-full"></div>
                        <div className="h-8 bg-gray-100 rounded w-full"></div>
                    </div>
                </div>
                {/* 右側スケルトン */}
                <div className="w-2/5 flex flex-col items-center justify-center pl-4">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-100 mb-2"></div>
                    <div className="flex gap-2 w-full mt-2">
                        <div className="h-10 bg-gray-100 rounded flex-1"></div>
                        <div className="h-10 bg-gray-100 rounded flex-1"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- 2. Error State (リカバリーUI) ---
    if (isError || !data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded border border-dashed border-gray-200 p-4 group hover:bg-gray-50 transition-colors">
                <ExclamationCircleIcon className="h-8 w-8 text-gray-300 mb-2 group-hover:text-red-300 transition-colors" />
                <p className="text-xs mb-1 font-medium text-gray-500">データ取得エラー</p>
                <button 
                    onClick={() => refetch()}
                    className="mt-2 flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 shadow-sm rounded-full text-xs text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                >
                    <ArrowPathIcon className="h-3 w-3" />
                    <span>再試行</span>
                </button>
            </div>
        );
    }

    // --- 3. Success State (データ表示) ---
    const { progress, tasks } = data;
    
    // 円グラフ計算
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress.rate / 100) * circumference;

    const getStrokeColor = () => {
        if (progress.rate === 100) return "text-green-500";
        if (progress.overdue_count > 0) return "text-red-500";
        return "text-indigo-500";
    };

    return (
        <div className="flex h-full min-h-62.5 relative">

            {/* ★★★ 修正: 右上の外部リンクボタン (デザイン統一) ★★★ */}
            <a 
                href={`${PL_BASE_URL}/boards/${plBoardId}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-0 right-0 flex items-center gap-1 p-2 text-xs text-indigo-500 hover:text-indigo-700 hover:underline z-10 cursor-pointer bg-white/80 rounded-bl-lg backdrop-blur-sm border-b border-l border-gray-100"
                title="Open in Project-Lite"
            >
                <span>Open in Project-Lite</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            {/* --- 左側: タスクリスト (60%) --- */}
            <div className="w-3/5 pr-4 border-r border-gray-100 flex flex-col">
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 pb-2">
                    
                    {/* 今日のタスク */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <ExclamationCircleIcon className="h-3 w-3 mr-1 text-orange-500" />
                            Today & Overdue
                        </h4>
                        {progress.overdue_count > 0 && (
                             <div className="mb-2 px-3 py-2 bg-red-50 text-red-700 rounded text-xs border border-red-100 flex items-center shadow-sm">
                                <ExclamationCircleIcon className="h-4 w-4 mr-2 shrink-0" />
                                <span className="font-medium">{progress.overdue_count} 件の遅延タスク</span>
                             </div>
                        )}
                        
                        {tasks.today.length === 0 && progress.overdue_count === 0 ? (
                            <p className="text-xs text-gray-400 pl-1 py-2">今日のタスクはありません</p>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.today.map(task => (
                                    <TaskItem key={task.id} task={task} isToday={true} />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 今週のタスク */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1 text-blue-500" />
                            Upcoming (This Week)
                        </h4>
                        {tasks.week.length === 0 ? (
                            <p className="text-xs text-gray-400 pl-1 py-2">今週の予定はありません</p>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.week.map(task => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* --- 右側: 進捗グラフ (40%) --- */}
            <div className="w-2/5 flex flex-col items-center justify-center pl-4 relative">
                <div className="relative mb-2">
                    <svg className="transform -rotate-90 w-32 h-32 drop-shadow-sm">
                        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${getStrokeColor()} transition-all duration-1000 ease-out`} />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700 tracking-tight">{progress.rate}<span className="text-sm text-gray-400 font-normal">%</span></span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Done</span>
                    </div>
                </div>

                {/* 統計情報 (カード化して視認性アップ) */}
                <div className="mt-2 grid grid-cols-2 gap-2 w-full">
                    <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <div className="text-lg font-bold text-gray-700 leading-none">{progress.total - progress.completed}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">Remaining</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2 text-center border border-gray-100">
                        <div className="text-lg font-bold text-gray-700 leading-none">{progress.total}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">Total</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskItem = ({ task, isToday = false }: { task: Task, isToday?: boolean }) => {
    return (
        <li className={`flex items-start p-2 rounded border transition-all duration-200 group ${isToday ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-sm'}`}>
            <div className={`mt-1 w-2 h-2 rounded-full mr-2 shrink-0 ${isToday ? 'bg-orange-400 ring-2 ring-orange-100' : 'bg-blue-300 group-hover:bg-indigo-400'}`}></div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 truncate group-hover:text-indigo-700 transition-colors">{task.title}</p>
                <div className="flex items-center mt-0.5 text-[10px] text-gray-400">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {new Date(task.end_date).toLocaleDateString()}
                </div>
            </div>
        </li>
    );
};

export default ProjectLiteWidget;