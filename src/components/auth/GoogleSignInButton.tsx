import React from 'react';
import { motion } from 'framer-motion';

interface GoogleSignInButtonProps {
    busy: boolean;
    onClick: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ busy, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={onClick}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60"
        >
            <img
                className="h-5 w-5"
                src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                alt=""
            />
            Continue with Google
        </motion.button>
    );
};
