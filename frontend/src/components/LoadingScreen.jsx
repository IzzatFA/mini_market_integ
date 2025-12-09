import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 transition-opacity">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4B5563] rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-[#4B5563]">Yuk Belanja!</h2>
                <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
