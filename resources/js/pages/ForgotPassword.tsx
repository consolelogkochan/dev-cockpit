import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import client from '../lib/axios'; // ★修正: パスを合わせました

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('');
        setProcessing(true);

        try {
            await client.get('/sanctum/csrf-cookie');
            const response = await client.post('/api/auth/forgot-password', { email });
            setStatus(response.data.message || 'パスワードリセットリンクを送信しました。');
        } catch (err: any) {
            if (err.response && err.response.data.errors) {
                setError(err.response.data.errors.email[0]);
            } else {
                setError('メール送信中にエラーが発生しました。');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div>
            <div>
                <h3 className="text-xl font-semibold mb-4 text-center">パスワード再設定</h3>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    ご登録のメールアドレスを入力してください。<br/>
                    パスワードリセット用のリンクをお送りします。
                </p>

                {status && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                        {status}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={processing}
                        className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {processing ? '送信中...' : 'リセットリンクを送信'}
                    </button>

                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">
                            ログイン画面に戻る
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;