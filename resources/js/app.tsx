import './bootstrap';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-blue-600">
                Hello React from Dev-Cockpit! 🚀
            </h1>
        </div>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}