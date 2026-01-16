import React from 'react';

type Props = {
    current: number; // 現在のページ
    last: number;    // 最後のページ
    onPageChange: (page: number) => void; // ボタンが押された時の関数
};

const Pagination = ({ current, last, onPageChange }: Props) => {
    if (last <= 1) return null; // 1ページしかなければ表示しない

    return (
        <div className="flex justify-center items-center space-x-4 mt-8">
            <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                className={`px-4 py-2 border rounded ${
                    current === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                前へ
            </button>
            
            <span className="text-gray-600">
                {current} / {last}
            </span>

            <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === last}
                className={`px-4 py-2 border rounded ${
                    current === last 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
                次へ
            </button>
        </div>
    );
};

export default Pagination;