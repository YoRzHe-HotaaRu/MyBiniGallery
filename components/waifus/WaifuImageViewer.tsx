import React from 'react';
import { X } from 'lucide-react';

interface WaifuImageViewerProps {
    selectedImage: string | null;
    onClose: () => void;
}

export const WaifuImageViewer: React.FC<WaifuImageViewerProps> = ({ selectedImage, onClose }) => {
    if (!selectedImage) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="relative max-w-5xl w-full">
                <img
                    src={selectedImage}
                    alt="Full size"
                    className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                />
                <button
                    type="button"
                    className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-white text-gray-900 shadow-lg flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-label="Close image"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
