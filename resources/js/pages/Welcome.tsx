import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RocketLaunchIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Welcome = () => {
    const { user, isLoading } = useAuth();

    // 既にログイン済みならダッシュボードへリダイレクト
    if (!isLoading && user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* ▼ ヘッダー */}
            <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="text-2xl font-bold text-indigo-600 tracking-tighter">
                    Dev Cockpit
                </div>
                <nav className="space-x-4">
                    <Link 
                        to="/login" 
                        className="text-gray-600 hover:text-gray-900 font-medium transition"
                    >
                        Login
                    </Link>
                    <Link 
                        to="/register" 
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                        Get Started
                    </Link>
                </nav>
            </header>

            <main className="grow">
                {/* ▼ ヒーローセクション */}
                <section className="pt-20 pb-32 px-6 text-center max-w-7xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Manage Projects. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                            Deliver Faster.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                        Dev Cockpitは、開発者のためのオールインワン・プロジェクト管理ツールです。
                        タスク管理、チーム連携、進捗可視化をこれ一つで。
                    </p>
                    <div className="flex justify-center gap-4 mb-20">
                        <Link 
                            to="/register" 
                            className="px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-bold hover:bg-indigo-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            無料で始める
                        </Link>
                        <a 
                            href="#features" 
                            className="px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-full text-lg font-medium hover:bg-gray-50 transition"
                        >
                            機能を見る
                        </a>
                    </div>

                    {/* ▼▼▼ ここから修正（ダークモードPC風装飾枠） ▼▼▼ */}
                    <div className="relative mx-auto w-full max-w-5xl">
                        {/* 枠の外側コンテナ：ボーダーを暗くし、背景色をダークグレーに */}
                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-900 group">

                            {/* ★修正部分：ダークモードのブラウザツールバー */}
                            {/* 背景色を濃いグレー(bg-gray-800)にし、下線を暗くする */}
                            <div className="h-9 bg-gray-800 flex items-center px-4 space-x-2 border-b border-gray-700">
                                {/* Macのウィンドウボタン風の3つの点（色はmacOS標準色に調整） */}
                                <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                                
                                {/* アドレスバー風の装飾：暗いグレーに変更し、少しリアルに */}
                                <div className="grow text-center pl-4 pr-12 md:opacity-100 opacity-0 transition-opacity">
                                    <div className="h-6 bg-gray-900 rounded-md border border-gray-700 mx-auto max-w-xl flex items-center justify-center text-xs text-gray-500 font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-2 text-gray-600">
                                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                        </svg>
                                        dev-cockpit.com
                                    </div>
                                </div>
                            </div>
                            
                            {/* 画像本体 */}
                            <img 
                                src="/images/hero-image.png" 
                                alt="Dev Cockpit Dashboard" 
                                // 画像の背景も少し暗くして馴染ませる
                                className="w-full h-auto object-cover bg-gray-900"
                            />
                        </div>

                        {/* 背景の装飾ブラー（変更なし） */}
                        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    </div>
                </section>

                {/* ▼ 機能紹介セクション */}
                <section id="features" className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                開発効率を最大化する機能
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                シンプルかつパワフル。開発者が本当に必要とする機能だけを厳選しました。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1: プロジェクト管理 */}
                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                                <div className="w-full bg-gray-100 border-b border-gray-100">
                                    <img 
                                        src="/images/project-image.png" 
                                        alt="Project Management" 
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                                
                                <div className="p-6">
                                    {/* アイコン + 見出し */}
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
                                            <RocketLaunchIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">プロジェクト管理</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        直感的なダッシュボードで複数のプロジェクトを一元管理。
                                        進捗状況を一目で把握できます。
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: タスク追跡 */}
                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                                <div className="w-full bg-gray-100 border-b border-gray-100">
                                    <img 
                                        src="/images/task-image.png" 
                                        alt="Task Tracking" 
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mr-3">
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">タスク追跡</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        タスク管理アプリとの連携でタスク管理の状況を把握。
                                        優先順位を明確にし、期限遅れを防ぎます。
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3: チームコラボレーション */}
                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                                <div className="w-full bg-gray-100 border-b border-gray-100">
                                    <img 
                                        src="/images/collab-image.png" 
                                        alt="Team Collaboration" 
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center mb-3">
                                        <div className="p-2 bg-pink-50 rounded-lg text-pink-600 mr-3">
                                            <UserGroupIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">チームコラボレーション</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        招待コード制でチームを結成。
                                        スムーズな情報共有を実現します。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ▼ フッター */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-xl font-bold text-gray-800">Dev Cockpit</span>
                        <p className="text-gray-500 text-sm mt-1">© 2026 Dev Cockpit. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-gray-600">Terms</a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">Privacy</a>
                        <a href="#" className="text-gray-400 hover:text-gray-600">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;