import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui';
import { Waifu } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFavouritesStore } from '@/store/favouritesStore';

interface WaifuCardProps {
    waifu: Waifu;
    animeName: string;
    tick: number;
}

export const WaifuCard: React.FC<WaifuCardProps> = ({ waifu, animeName, tick }) => {
    const { user } = useAuthStore();
    const { isFavourite, toggleFavourite } = useFavouritesStore();

    const images = [waifu.imageUrl, ...(waifu.gallery ?? [])].filter(Boolean);
    const activeIndex = images.length > 0 ? tick % images.length : 0;
    const activeSrc = images[activeIndex] ?? waifu.imageUrl;

    return (
        <Link to={`/waifu/${waifu.id}`} className="group block">
            <Card className="overflow-hidden transition-shadow hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
                <div className="aspect-[3/4] relative overflow-hidden">
                    <AnimatePresence mode="sync" initial={false}>
                        <motion.img
                            key={activeSrc}
                            src={activeSrc}
                            alt={waifu.name}
                            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                            initial={{ opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.99 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            loading="lazy"
                            decoding="async"
                        />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!user) return;
                            toggleFavourite(user.uid, waifu.id);
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
                        <div className="text-white/80 text-xs truncate">
                            {animeName}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
