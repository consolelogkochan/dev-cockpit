import React, { useState } from 'react';
import { 
    ArrowTopRightOnSquareIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';

type Props = {
    fileKey: string;
};

const FigmaWidget = ({ fileKey }: Props) => {
    // iframeの読み込み完了を検知するためのState
    const [isLoading, setIsLoading] = useState(true);

    if (!fileKey) return null;

    const fileUrl = `https://www.figma.com/file/${fileKey}`;
    const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(fileUrl)}`;

    return (
        <div className="h-full w-full flex flex-col relative bg-gray-50 rounded border border-gray-200 overflow-hidden group">
            
            {/* 右上の外部リンク (最前面 z-20) */}
            <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="absolute top-0 right-0 flex items-center gap-1 p-2 text-xs text-indigo-500 hover:text-indigo-700 hover:underline z-20 cursor-pointer bg-white/90 rounded-bl-lg backdrop-blur-sm border-b border-l border-gray-100 transition-colors shadow-sm"
                title="Open in Figma"
            >
                <span>Open in Figma</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            {/* Loading Skeleton (iframeの前 z-10) */}
            {/* 読み込み完了後は透明にして操作を受け付けないようにする */}
            <div 
                className={`absolute inset-0 flex flex-col items-center justify-center bg-white z-10 transition-opacity duration-500 ${
                    isLoading ? 'opacity-100 animate-pulse' : 'opacity-0 pointer-events-none'
                }`}
            >
                <PhotoIcon className="h-10 w-10 text-gray-200 mb-2" />
                <div className="h-2 w-24 bg-gray-100 rounded mb-1"></div>
                <p className="text-[10px] text-gray-300">Loading Design...</p>
            </div>

            {/* iframe本体 (最背面 z-0) */}
            <iframe
                className={`w-full flex-1 transition-opacity duration-700 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                src={embedUrl}
                allowFullScreen
                loading="lazy"
                title="Figma Embed"
                onLoad={() => setIsLoading(false)} // ★読み込み完了でスケルトンを透明にする
            />
        </div>
    );
};

export default FigmaWidget;