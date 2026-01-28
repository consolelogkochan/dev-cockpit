import React, { useEffect, useState } from 'react';
import client from '../../lib/axios';
import { Invitation, PaginatedResponse } from '../../types';

const InvitationList = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false); // 生成ボタンのローディング状態

    // 一覧取得
    const fetchInvitations = async () => {
        try {
            const response = await client.get<PaginatedResponse<Invitation>>('/api/admin/invitations');
            setInvitations(response.data.data);
        } catch (error) {
            console.error('取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    // 新規発行
    const handleCreate = async () => {
        setCreating(true);
        try {
            await client.post('/api/admin/invitations');
            // 発行したらリストを再取得して最新を表示
            await fetchInvitations();
        } catch (error) {
            alert('発行に失敗しました。');
        } finally {
            setCreating(false);
        }
    };

    // クリップボードにコピー
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            alert(`コード ${code} をコピーしました！`);
        });
    };

    // 削除機能
    const handleDelete = async (id: number) => {
        if (!confirm('削除してもよろしいですか？')) return;
        try {
            await client.delete(`/api/admin/invitations/${id}`);
            fetchInvitations();
        } catch (error) {
            alert('削除に失敗しました。');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm m-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">招待コード管理</h1>
                <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow transition disabled:opacity-50"
                >
                    {creating ? '発行中...' : '+ 新規コード発行'}
                </button>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-gray-600">コード</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">状態</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">発行者</th>
                                <th className="px-6 py-3 font-semibold text-gray-600">作成日</th>
                                <th className="px-6 py-3 font-semibold text-gray-600 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invitations.map((inv) => (
                                <tr key={inv.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono text-lg font-bold text-gray-800">
                                        {inv.code}
                                    </td>
                                    <td className="px-6 py-4">
                                        {inv.is_used ? (
                                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">使用済</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">有効</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {inv.creator?.name || '不明'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(inv.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleCopy(inv.code)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            コピー
                                        </button>
                                        {!inv.is_used && (
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                削除
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invitations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        招待コードはまだありません。
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvitationList;