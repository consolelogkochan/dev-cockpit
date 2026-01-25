import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import client from '../lib/axios';

const ResetPassword = () => {
    const { token } = useParams(); // URLの :token 部分を取得
    const [searchParams] = useSearchParams(); // URLの ?email=... 部分を取得
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // ★追加: パスワード表示フラグ
    
    const navigate = useNavigate();

    useEffect(() => {
        // URLのクエリパラメータからemailを自動セット
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('');
        setProcessing(true);

        try {
            await client.get('/sanctum/csrf-cookie');
            
            // バックエンドへ送信
            const response = await client.post('/api/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            // 成功したらログイン画面へ遷移（メッセージ付き）
            navigate('/login', { 
                state: { 
                    message: 'パスワードのリセットが完了しました。新しいパスワードでログインしてください。',
                    type: 'success'
                } 
            });

        } catch (err: any) {
            if (err.response && err.response.data.errors) {
                // バリデーションエラー (emailなど)
                const errors = err.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                setError(errors[firstErrorKey][0]);
            } else if (err.response && err.response.data.message) {
                // その他のエラー (トークン期限切れなど)
                setError(err.response.data.message);
            } else {
                setError('エラーが発生しました。もう一度お試しください。');
            }
            setProcessing(false);
        }
    };

    return (
        <div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-center">新しいパスワードの設定</h3>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* メールアドレス (hiddenではなく表示しておくと親切ですが、readonlyにします) */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
                        <input 
                            type="email" 
                            value={email}
                            readOnly
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 leading-tight focus:outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">新しいパスワード</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">新しいパスワード（確認）</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
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
                    
                    <button 
                        type="submit" 
                        disabled={processing}
                        className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {processing ? '更新中...' : 'パスワードを変更する'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;