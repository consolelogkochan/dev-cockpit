import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../lib/axios';

const VerifyEmailChange = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

    useEffect(() => {
        // トークンがない場合は即エラー
        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                // APIを叩いて検証
                await client.post('/api/email/verify-change', { token });
                setStatus('success');
                
                // 3秒後にプロフィールへ自動遷移
                setTimeout(() => {
                    navigate('/profile');
                }, 3000);

            } catch (error) {
                console.error(error);
                setStatus('error');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                
                {status === 'verifying' && (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">検証中...</h2>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">メールアドレスの変更を確認しています。</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 className="text-xl font-bold text-green-600 mb-4">変更完了</h2>
                        <p className="text-gray-700">メールアドレスの変更が正式に完了しました。</p>
                        <p className="text-sm text-gray-500 mt-4">プロフィールページへ移動します...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className="text-xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
                        <p className="text-gray-700 mb-6">
                            トークンが無効か、期限切れの可能性があります。<br />
                            再度プロフィール設定からやり直してください。
                        </p>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            プロフィールへ戻る
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailChange;