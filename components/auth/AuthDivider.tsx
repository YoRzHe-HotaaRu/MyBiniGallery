import React from 'react';

export const AuthDivider: React.FC = () => {
    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/70 text-gray-500">or</span>
            </div>
        </div>
    );
};
