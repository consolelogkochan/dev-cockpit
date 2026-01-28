import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { PlusIcon, TrashIcon, QueueListIcon } from '@heroicons/react/24/outline';
import client from '../lib/axios'; // ★追加: APIクライアント
import { Project } from '../types';
import HybridImagePicker from './HybridImagePicker'; // ★追加

// フォームの入力データの型定義
type FormInputs = {
    title: string;
    description: string;
    thumbnail_url: string;
    github_repo: string;
    pl_board_id: string; // ★追加 (Project-Lite)
    figma_file_key: string;   // ★追加 (Figma)
    notion_pages: { id: string }[];
};

type Props = {
    onCancel: () => void;
    onSuccess: () => void; // ★追加: 成功時のコールバック
    initialData?: Project; // ★追加: これがあれば編集モード
};

const CreateProjectForm = ({ onCancel, onSuccess, initialData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false); // ★追加: 送信中フラグ

    // ★追加: 画像データの管理用State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(initialData?.thumbnail_url || null);
    
    // ★重要: 初期値の計算
    // 新規なら空、編集なら initialData の値をセット
    const defaultValues: FormInputs = {
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        thumbnail_url: initialData?.thumbnail_url ?? '',
        // GitHubは "user/repo" 形式で保存されているのでそのまま、なければ空
        github_repo: initialData?.github_repo ?? '',
        pl_board_id: initialData?.pl_board_id ?? '',
        // Figmaは今はKeyだけ保存してるが、フォームはURLを期待しているので
        // 一旦空にするか、簡易的に復元する（今回は簡易的に空文字 or Keyを表示）
        // ※完璧にするなら "https://figma.com/file/" + key とする
        figma_file_key: initialData?.figma_file_key ? `https://www.figma.com/file/${initialData.figma_file_key}` : '',
        
        // Notionページの変換 (DB: page_id -> Form: id)
        notion_pages: initialData?.notion_pages?.length 
            ? initialData.notion_pages.map(p => ({ id: p.page_id }))
            : [{ id: '' }]
    };

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
        defaultValues // 計算した初期値をセット
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'notion_pages',
    });

    // ▼▼▼ 2. この useEffect ブロックを丸ごと追加 ▼▼▼
    // initialData が変わるたびにフォームの内容を書き換える処理
    useEffect(() => {
        if (initialData) {
            // 編集モード: データをフォームの形式に合わせて流し込む
            reset({
                title: initialData.title,
                description: initialData.description ?? '',
                thumbnail_url: initialData.thumbnail_url ?? '',
                github_repo: initialData.github_repo ?? '',
                pl_board_id: initialData.pl_board_id ?? '',
                figma_file_key: initialData.figma_file_key ? `https://www.figma.com/file/${initialData.figma_file_key}` : '',
                // Notionページの変換 (重要)
                notion_pages: initialData.notion_pages && initialData.notion_pages.length > 0
                    ? initialData.notion_pages.map(p => ({ id: p.page_id }))
                    : [{ id: '' }]
            });
            // ★追加: 画像の初期値セット
            setSelectedUrl(initialData.thumbnail_url ?? null);
            setSelectedFile(null);
        } else {
            // 新規作成モード: フォームを空にする
            reset({
                title: '',
                description: '',
                thumbnail_url: '',
                github_repo: '',
                pl_board_id: '',
                figma_file_key: '',
                notion_pages: [{ id: '' }]
            });
            setSelectedUrl(null);
            setSelectedFile(null);
        }
    }, [initialData, reset]);
    // ▲▲▲ 追加ここまで ▲▲▲

    // ★重要: HybridImagePickerからの変更を受け取る関数
    const handleImageChange = (file: File | null, url: string | null) => {
        setSelectedFile(file);
        setSelectedUrl(url);
    };

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setIsSubmitting(true);
        try {
            // ★重要: JSONではなくFormDataを作成する
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || ''); // nullなら空文字
            formData.append('github_repo', data.github_repo || '');
            formData.append('pl_board_id', data.pl_board_id || '');
            formData.append('figma_file_key', data.figma_file_key || '');

            // 画像データの処理
            if (selectedFile) {
                // ファイルが選択されている場合
                formData.append('thumbnail_file', selectedFile);
            } else if (selectedUrl) {
                // URLが入力されている場合 (または初期値のまま)
                formData.append('thumbnail_url', selectedUrl);
            }
            // Notionページの配列処理
            // FormDataで配列を送る場合は `key[index][property]` の形式にする必要があります
            data.notion_pages.forEach((page, index) => {
                if (page.id) {
                    formData.append(`notion_pages[${index}][id]`, page.id);
                }
            });

            // PUTリクエストの場合、LaravelはFormDataを正しく受け取れないことがあるため、
            // POSTメソッドにして `_method: PUT` を送るのが定石ですが、
            // 今回は Axios の設定で Content-Type: multipart/form-data を送れば動く場合も多いです。
            // もし動かない場合は `_method` トリックを使います。今回は安全策で `_method` を使います。

            if (initialData) {
                // ★編集モード (PUTの代わり)
                formData.append('_method', 'PUT');
                await client.post(`/api/projects/${initialData.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('プロジェクトを更新しました！');
            } else {
                // ★新規モード
                await client.post('/api/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('プロジェクトを作成しました！');
            }
            
            onSuccess();
            onCancel();
        } catch (error: any) {
            // ... エラー処理 (変更なし)
            console.error(error);
            alert('保存に失敗しました。');
        } finally {
            setIsSubmitting(false);
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

            {/* ★変更: サムネイル画像 (Hybrid Picker) */}
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <HybridImagePicker
                    defaultUrl={initialData?.thumbnail_url}
                    onImageChange={handleImageChange}
                />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project-Lite Board URL or ID
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <QueueListIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            {...register('pl_board_id')}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2"
                            placeholder="Example: https://.../boards/5"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        ボードのURLを貼り付けると、自動的にID (例: 5) が抽出されます。
                    </p>
                </div>

                {/* ★追加: Figma */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Figma URL</label>
                    <input
                        type="text"
                        {...register('figma_file_key')}
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
                    {isSubmitting ? '保存中...' : (initialData ? '更新する' : '作成する')}
                </button>
            </div>
        </form>
    );
};

export default CreateProjectForm;