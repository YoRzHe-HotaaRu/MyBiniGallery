import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui';
import { Waifu } from '@/types';

interface FavouriteWaifuCardProps {
    waifu: Waifu;
    isFavourite: (waifuId: string) => boolean;
    toggleFavourite: (uid: string, waifuId: string) => void;
    uid?: string;
}

export const FavouriteWaifuCard: React.FC<FavouriteWaifuCardProps> = ({
    waifu,
    isFavourite,
    toggleFavourite,
    uid,
}) => {
    return (
        <Link to={`/waifu/${waifu.id}`} className="group block">
            <Card className="overflow-hidden transition-shadow hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
                <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                        src={waifu.imageUrl}
                        alt={waifu.name}
                        className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!uid) return;
                            toggleFavourite(uid, waifu.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-white/85 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        aria-label="Toggle favourite"
                    >
                        <Heart
                            className={`h-5 w-5 ${isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-600'
                                }`}
                        />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-white font-extrabold leading-tight truncate">
                            {waifu.name}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
