import React, { useEffect, useState } from 'react';
import client from '../../lib/axios';
import { User, PaginatedResponse } from '../../types';

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginatedResponse<User>['meta'] | null>(null);
    const [loading, setLoading] = useState(true);

    // ユーザー一覧を取得する関数
    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await client.get<PaginatedResponse<User>>(`/api/admin/users?page=${page}`);
            setUsers(response.data.data);
            setPagination(response.data.meta);
        } catch (error) {
            console.error('ユーザー取得エラー:', error);
            alert('ユーザー一覧の取得に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    // 初回ロード時に実行
    useEffect(() => {
        fetchUsers();
    }, []);

    // 削除機能
    const handleDelete = async (userId: number) => {
        if (!window.confirm('本当にこのユーザーを削除（BAN）してもよろしいですか？\nこの操作は取り消せません。')) {
            return;
        }

        try {
            await client.delete(`/api/admin/users/${userId}`);
            alert('ユーザーを削除しました。');
            // リストを再取得して表示を更新
            fetchUsers(pagination?.current_page || 1);
        } catch (error: any) {
            console.error('削除エラー:', error);
            if (error.response && error.response.status === 403) {
                alert(error.response.data.message); // 「自分自身は削除できません」など
            } else {
                alert('削除に失敗しました。');
            }
        }
    };

    // ページ変更ハンドラ
    const handlePageChange = (page: number) => {
        fetchUsers(page);
    };

    if (loading && users.length === 0) return <div className="p-6">読み込み中...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm m-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">ユーザー管理</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold">ID</th>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold">名前</th>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold">メールアドレス</th>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold">権限</th>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold">登録日</th>
                            <th scope="col" className="px-6 py-3 text-gray-600 font-semibold text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 text-gray-700">{user.name}</td>
                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.is_admin ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            管理者
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            一般
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(user.created_at || '').toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!user.is_admin && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900 font-medium hover:underline"
                                        >
                                            削除
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ページネーション */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            disabled={page === pagination.current_page}
                            className={`px-4 py-2 text-sm font-medium rounded-md border ${
                                page === pagination.current_page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserList;