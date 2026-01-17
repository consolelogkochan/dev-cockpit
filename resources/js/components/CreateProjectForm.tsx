import React, { useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios'; // ★追加: APIクライアント

// フォームの入力データの型定義
type FormInputs = {
    title: string;
    description: string;
    thumbnail_url: string;
    github_repo: string;
    pl_board_id: string; // ★追加 (Project-Lite)
    figma_url: string;   // ★追加 (Figma)
    notion_pages: { id: string }[];
};

type Props = {
    onCancel: () => void;
    onSuccess: () => void; // ★追加: 成功時のコールバック
};

const CreateProjectForm = ({ onCancel, onSuccess }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false); // ★追加: 送信中フラグ
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormInputs>({
        defaultValues: {
            title: '',
            description: '',
            thumbnail_url: '', // ★追加 (初期値は空)
            github_repo: '',
            pl_board_id: '', // ★追加
            figma_url: '',   // ★追加
            notion_pages: [{ id: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'notion_pages',
    });

    // ★重要: 送信処理を書き換え
    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true); // ボタンを無効化
        try {
            // 1. APIにデータをPOST送信
            // 第1引数: URL, 第2引数: 送るデータ
            await client.post('/api/projects', data);

            // 2. 成功したら親に報告 & モーダルを閉じる
            alert('プロジェクトを作成しました！');
            onSuccess(); 
            onCancel();

        } catch (error: any) {
            console.error('保存失敗:', error);
            // バリデーションエラーならアラートを出す簡易実装
            if (error.response?.status === 422) {
                alert('入力内容に誤りがあります。');
            } else {
                alert('システムエラーが発生しました。');
            }
        } finally {
            setIsSubmitting(false); // ボタンを復活
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. プロジェクト名 (必須) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    {...register('title', { required: 'プロジェクト名は必須です' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                    placeholder="例: 新規アプリ開発"
                />
                {errors.title && (
                    <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                )}
            </div>

            {/* 2. 説明文 */}
            <div>
                <label className="block text-sm font-medium text-gray-700">説明</label>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                    placeholder="プロジェクトの概要を入力..."
                />
            </div>

            {/* ★追加: サムネイルURL */}
            <div>
                <label className="block text-sm font-medium text-gray-700">サムネイル画像 URL</label>
                <input
                    type="url" // URL用の入力欄にする
                    {...register('thumbnail_url')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                    placeholder="https://example.com/image.png (任意)"
                />
                <p className="mt-1 text-xs text-gray-500">
                    画像のURLを入力してください。入力がない場合はデフォルト表示になります。
                </p>
            </div>

            {/* 3. 連携ツール URL群 (GitHub, Project-Lite, Figma) */}
            <div className="grid grid-cols-1 gap-4">
                {/* GitHub */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">GitHubリポジトリ (user/repo)</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                            github.com/
                        </span>
                        <input
                            type="text"
                            {...register('github_repo')}
                            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                            placeholder="laravel/laravel"
                        />
                    </div>
                </div>

                {/* ★追加: Project-Lite */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project-Lite ボードID (またはURL)</label>
                    <input
                        type="text"
                        {...register('pl_board_id')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                        placeholder="例: PL-1234 (URLでも可)"
                    />
                </div>

                {/* ★追加: Figma */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Figma URL</label>
                    <input
                        type="text"
                        {...register('figma_url')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                        placeholder="https://www.figma.com/file/..."
                    />
                </div>
            </div>

            {/* 4. Notionページ連携 (動的フォーム) */}
            <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notion Page ID</label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <input
                                type="text"
                                {...register(`notion_pages.${index}.id` as const)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                                placeholder="例: 1a2b3c..."
                            />
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                
                <button
                    type="button"
                    onClick={() => append({ id: '' })}
                    className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Notionページを追加
                </button>
            </div>

            {/* フッターボタン */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting} // ★追加: 送信中は押せないように
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    キャンセル
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting} // ★追加: 送信中は押せないように
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {isSubmitting ? '保存中...' : '作成する'}
                </button>
            </div>
        </form>
    );
};

export default CreateProjectForm;