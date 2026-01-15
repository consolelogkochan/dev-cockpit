import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navClass = ({ isActive }: { isActive: boolean }) => 
        `block py-2.5 px-4 rounded transition duration-200 ${
            isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="text-2xl font-semibold text-center text-white mb-8">
                Dev Cockpit
            </div>
            <nav>
                <NavLink to="/dashboard" className={navClass}>
                    ダッシュボード
                </NavLink>
                {/* 今後作る予定のページ */}
                <NavLink to="/projects" className={navClass}>
                    プロジェクト
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;