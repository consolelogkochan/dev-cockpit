import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Dev Cockpit</h2>
                
                {/* ここに Login や Register の中身が入ります */}
                <Outlet />
            </div>
        </div>
    );
};

export default GuestLayout;