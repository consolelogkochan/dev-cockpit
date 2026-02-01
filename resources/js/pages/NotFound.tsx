import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-indigo-100 rounded-full">
                        <ExclamationTriangleIcon className="w-12 h-12 text-indigo-600" />
                    </div>
                </div>
                <h2 className="text-6xl font-extrabold text-gray-900 tracking-tight">404</h2>
                <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
                <p className="mt-2 text-base text-gray-500">
                    お探しのページは見つかりませんでした。<br />
                    削除されたか、URLが間違っている可能性があります。
                </p>
                
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <HomeIcon className="w-5 h-5 mr-2" />
                        ホームに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;