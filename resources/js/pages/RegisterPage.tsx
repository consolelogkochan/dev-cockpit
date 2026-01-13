import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../lib/axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [invitationCode, setInvitationCode] = useState(''); // ★追加: 招待コード
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false); // ★追加: パスワード表示フラグ
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await client.get('/sanctum/csrf-cookie');
            await client.post('/auth/register', { 
                name, 
                email,
                invitation_code: invitationCode, // ★追加: バックエンドへ送信
                password,
                password_confirmation: passwordConfirmation
            });
            navigate('/dashboard');
        } catch (err: any) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                const firstError = Object.values(errors)[0] as string[];
                setError(firstError[0]);
            } else {
                setError('登録中にエラーが発生しました。');
            }
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-center">アカウント作成</h3>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* お名前 */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">お名前</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                {/* メールアドレス */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                
                {/* パスワード */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
                    <input 
                        // ★変更: showPasswordがtrueならtext、falseならpassword
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                {/* パスワード（確認） */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">パスワード（確認）</label>
                    <input 
                        // ★変更: ここも連動して切り替え
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

                {/* ★追加: 招待コード */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        招待コード <span className="text-gray-400 font-normal">(必須)</span>
                    </label>
                    <input 
                        type="text" 
                        value={invitationCode}
                        onChange={(e) => setInvitationCode(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="管理者より招待コードを受領してください。"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                >
                    登録する
                </button>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-blue-500 hover:underline">
                        すでにアカウントをお持ちの方はこちら
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;