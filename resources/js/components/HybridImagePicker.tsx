import React, { useState, useEffect } from 'react';

interface HybridImagePickerProps {
    defaultUrl?: string | null; // 初期値（編集時の既存画像など）
    // 親に変更を伝える関数: fileがあればアップロード優先、なければurlを使う
    onImageChange: (file: File | null, url: string | null) => void;
}

const HybridImagePicker = ({ defaultUrl, onImageChange }: HybridImagePickerProps) => {
    const [mode, setMode] = useState<'file' | 'url'>('file');
    const [preview, setPreview] = useState<string | null>(defaultUrl || null);
    const [urlInput, setUrlInput] = useState<string>('');
    
    // 初期値が変わったらプレビューも更新 (編集モード用)
    useEffect(() => {
        if (defaultUrl) {
            setPreview(defaultUrl);
            if (!defaultUrl.startsWith('/storage/')) {
                // http~ で始まるならURLモード扱いにする
                setMode('url');
                setUrlInput(defaultUrl);
            }
        }
    }, [defaultUrl]);

    // ファイルが選択された時
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            // ローカルプレビュー用URLを作成
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageChange(file, null); // 親へ通知 (File優先)
        } else {
            setPreview(null);
            onImageChange(null, null);
        }
    };

    // URLが入力された時
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setUrlInput(url);
        setPreview(url); // そのままプレビューにする
        onImageChange(null, url); // 親へ通知 (URL優先)
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">プロジェクト画像</label>
            
            {/* タブ切り替え */}
            <div className="flex border-b border-gray-200 mb-3">
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${
                        mode === 'file' 
                            ? 'border-b-2 border-indigo-600 text-indigo-600' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    ファイルアップロード
                </button>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${
                        mode === 'url' 
                            ? 'border-b-2 border-indigo-600 text-indigo-600' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    画像URLを指定
                </button>
            </div>

            {/* 入力エリア */}
            <div>
                {mode === 'file' ? (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                ) : (
                    <input
                        type="url"
                        placeholder="https://example.com/image.png"
                        value={urlInput}
                        onChange={handleUrlChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                )}
            </div>

            {/* プレビュー表示 */}
            {preview && (
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">プレビュー:</p>
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // 画像読み込みエラー時の処理
                                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HybridImagePicker;