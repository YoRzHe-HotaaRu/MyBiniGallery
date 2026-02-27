import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Heart, ThumbsUp, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui';
import { Waifu, Anime } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { useWaifuLikes } from '@/hooks/useWaifuLikes';

interface WaifuInfoCardProps {
    waifu: Waifu;
    anime: Anime | null;
    commentCount: number;
}

export const WaifuInfoCard: React.FC<WaifuInfoCardProps> = ({ waifu, anime, commentCount }) => {
    const { user } = useAuthStore();
    const { isFavourite, toggleFavourite } = useFavouritesStore();
    const { count: likeCount, liked, toggle: toggleLike } = useWaifuLikes(waifu.id, user?.uid);
    const [likeError, setLikeError] = React.useState('');
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="overflow-hidden lg:col-span-1">
                <div className="relative">
                    <img
                        src={waifu.imageUrl}
                        alt={waifu.name}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
            </Card>

            <Card className="lg:col-span-2 p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{waifu.name}</h1>
                        <div className="mt-2">
                            <Link
                                to={`/waifus?anime=${anime?.id}`}
                                className="text-sm sm:text-base font-semibold text-pink-700 hover:text-pink-800"
                            >
                                {anime?.title || 'Unknown Series'}
                            </Link>
                        </div>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={async () => {
                                if (!user) {
                                    navigate('/login', { state: { from: location }, replace: false });
                                    return;
                                }
                                setLikeError('');
                                try {
                                    await toggleLike();
                                } catch {
                                    setLikeError('Failed to update like');
                                }
                            }}
                            className="h-11 px-3 rounded-full bg-white shadow-sm border border-gray-100 inline-flex items-center gap-2 hover:bg-pink-50 transition-colors"
                            aria-label="Toggle like"
                        >
                            <ThumbsUp className={`h-5 w-5 ${liked ? 'text-pink-600 fill-pink-600' : 'text-gray-600'}`} />
                            <span className="text-sm font-semibold text-gray-800 tabular-nums">{likeCount}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!user) {
                                    navigate('/login', { state: { from: location }, replace: false });
                                    return;
                                }
                                toggleFavourite(user.uid, waifu.id);
                            }}
                            className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-pink-50 transition-colors"
                            aria-label="Toggle favourite"
                        >
                            <Heart className={`h-6 w-6 ${isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-600'}`} />
                        </button>
                    </div>
                </div>

                {likeError ? (
                    <div className="text-sm font-semibold text-red-600">{likeError}</div>
                ) : null}

                <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                    {waifu.description}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {waifu.age ? (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                            <Calendar className="h-4 w-4 text-pink-600" />
                            Age: {waifu.age}
                        </div>
                    ) : null}
                    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                        <MessageSquare className="h-4 w-4 text-pink-600" />
                        {commentCount} comments
                    </div>
                </div>
            </Card>
        </div>
    );
};
