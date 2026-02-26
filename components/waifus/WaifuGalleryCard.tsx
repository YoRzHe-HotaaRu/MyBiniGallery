import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { Waifu } from '@/types';

interface WaifuGalleryCardProps {
    waifu: Waifu;
    onSelectImage: (image: string) => void;
}

export const WaifuGalleryCard: React.FC<WaifuGalleryCardProps> = ({ waifu, onSelectImage }) => {
    if (!waifu.gallery || waifu.gallery.length === 0) return null;

    return (
        <Card className="p-6 sm:p-8">
            <CardHeader
                title={
                    <span className="inline-flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-pink-600" />
                        Gallery
                    </span>
                }
                subtitle="Tap an image to view it full-size."
            />

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {waifu.gallery.map((image, index) => (
                    <button
                        key={index}
                        type="button"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-white/60 bg-white shadow-sm hover:shadow-md transition"
                        onClick={() => onSelectImage(image)}
                        aria-label={`Open gallery image ${index + 1}`}
                    >
                        <img
                            src={image}
                            alt={`${waifu.name} gallery ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                ))}
            </div>
        </Card>
    );
};
