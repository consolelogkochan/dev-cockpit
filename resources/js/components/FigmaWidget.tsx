import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

type Props = {
    fileKey: string;
};

const FigmaWidget = ({ fileKey }: Props) => {
    if (!fileKey) return null;

    // Figmaの埋め込み用URLを生成
    // 元のファイルURLを再構築
    const fileUrl = `https://www.figma.com/file/${fileKey}`;
    // エンコードして埋め込み用URLにする
    const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(fileUrl)}`;

    return (
        <div className="h-full w-full flex flex-col">
            <iframe
                className="w-full flex-1 rounded border border-gray-200"
                src={embedUrl}
                allowFullScreen
                loading="lazy" // 画面外では読み込まない（パフォーマンス対策）
                title="Figma Embed"
            />
            <div className="mt-2 text-right">
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-indigo-600 hover:underline flex items-center justify-end"
                >
                    <PhotoIcon className="h-3 w-3 mr-1" />
                    Figmaで開く
                </a>
            </div>
        </div>
    );
};

export default FigmaWidget;