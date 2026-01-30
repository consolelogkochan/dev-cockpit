import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import client from '../lib/axios';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/solid';

type ProfileInputs = {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
};

const Profile = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // アバター用State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInputs>();

    const [showPassword, setShowPassword] = useState(false); // ★追加: パスワード表示フラグ

    // 初期値のセット
    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
            });
            setAvatarPreview(user.avatar_url ?? null);
        }
    }, [user, reset]);

    // 画像選択時の処理
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // プレビュー表示
        }
    };

    const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            
            // パスワードが入力されている場合のみ送信
            if (data.password) {
                formData.append('password', data.password);
                formData.append('password_confirmation', data.password_confirmation || '');
            }

            // 画像が選択されている場合のみ送信
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // ★修正: レスポンスを変数で受け取る
            const response = await client.post('/api/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // ★追加: email_changed フラグによる分岐
            if (response.data.email_changed) {
                alert('基本情報を保存しました。\n\n【重要】\n新しいメールアドレス宛に確認メールを送信しました。\n届いたメール内のリンクをクリックして、変更を完了させてください。');
            } else {
                alert('プロフィールを更新しました。');
            }

            // ヘッダーなどの表示を更新するためにリロード
            window.location.reload();

        } catch (error: any) {
            console.error("Full Error Object:", error);
            
            if (error.response) {
                // サーバーからのレスポンスがある場合
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
                
                if (error.response.status === 422) {
                    // 具体的なバリデーションエラーの中身をアラート表示
                    const validationErrors = error.response.data.errors;
                    const messages = Object.keys(validationErrors)
                        .map(key => `${key}: ${validationErrors[key].join(', ')}`)
                        .join('\n');
                    alert(`入力エラーがあります:\n${messages}`);
                }
            } else {
                alert('サーバーに接続できませんでした。');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">プロフィール設定</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* --- アバター画像セクション（スタイリッシュ修正版） --- */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group w-24 h-24">
                            {/* 丸い枠と画像 */}
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="w-full h-full text-gray-400" />
                                )}
                            </div>
                            
                            {/* ホバー時に出る黒いオーバーレイとカメラアイコン */}
                            <label 
                                htmlFor="avatar-upload"
                                // 変更前: bg-black bg-opacity-0 group-hover:bg-opacity-40
                                // 変更後: bg-transparent group-hover:bg-black/40 (より確実な記法)
                                className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/40 rounded-full transition-all duration-300 cursor-pointer"
                            >
                                {/* アイコンのトランジションも少し滑らかにしました */}
                                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </label>

                            {/* 実態のinputは隠しておく */}
                            <input 
                                id="avatar-upload"
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">クリックしてアバターを変更</p>
                        
                        {/* 選択したファイル名があれば表示（親切設計） */}
                        {avatarFile && (
                            <p className="text-xs text-indigo-600 mt-1 font-medium">{avatarFile.name}</p>
                        )}
                    </div>

                    {/* --- 基本情報 --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">お名前</label>
                        <input
                            type="text"
                            {...register('name', { required: '名前は必須です' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                        <input
                            type="email"
                            {...register('email', { required: 'メールアドレスは必須です' })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">パスワード変更（変更する場合のみ入力）</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">新しいパスワード</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', { minLength: { value: 8, message: '8文字以上で入力してください' } })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                                    placeholder="********"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">パスワード確認</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password_confirmation')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                                    placeholder="********"
                                />
                            </div>

                            {/* ★追加: パスワード表示チェックボックス */}
                            <div className="mb-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={showPassword}
                                        onChange={() => setShowPassword(!showPassword)}
                                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">パスワードを表示する</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? '保存中...' : '変更を保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;