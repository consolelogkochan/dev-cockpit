import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'; // アイコン変更

type Props = {
    fileKey: string;
};

const FigmaWidget = ({ fileKey }: Props) => {
    if (!fileKey) return null;

    const fileUrl = `https://www.figma.com/file/${fileKey}`;
    const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(fileUrl)}`;

    return (
        <div className="h-full w-full flex flex-col relative"> {/* relativeを追加 */}
            
            {/* 右上の外部リンク (統一デザイン) */}
            <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="absolute top-0 right-0 flex items-center gap-1 p-2 text-xs text-indigo-500 hover:text-indigo-700 hover:underline z-10 cursor-pointer bg-white/80 rounded-bl-lg backdrop-blur-sm border-b border-l border-gray-100"
                title="Open in Figma"
            >
                <span>Open in Figma</span>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>

            {/* iframe (フルサイズ化) */}
            <iframe
                className="w-full flex-1 rounded border border-gray-200 bg-gray-50"
                src={embedUrl}
                allowFullScreen
                loading="lazy"
                title="Figma Embed"
            />
        </div>
    );
};

export default FigmaWidget;