import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, User as UserIcon } from 'lucide-react';
import { Card, Skeleton, EmptyState } from '@/components/ui';
import { Waifu } from '@/types';

interface ProfileShowcaseProps {
    showcaseLoading: boolean;
    showcaseWaifus: (Waifu | null)[];
}

export const ProfileShowcase: React.FC<ProfileShowcaseProps> = ({ showcaseLoading, showcaseWaifus }) => {
    return (
        <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-extrabold text-gray-900">Top 3 showcase</div>
                    <div className="mt-1 text-sm text-gray-600">Pinned favourites from this user.</div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <span>Showcase</span>
                </div>
            </div>

            {showcaseLoading ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="aspect-square w-full rounded-none" />
                            <div className="p-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : showcaseWaifus.every((w) => !w) ? (
                <EmptyState
                    className="mt-6"
                    title="No showcase waifus yet"
                    description="This user hasn’t pinned any favourites."
                />
            ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {showcaseWaifus.map((waifu, idx) => (
                        <div key={idx} className="space-y-3">
                            <Card className="overflow-hidden">
                                <div className="aspect-square relative bg-gray-100">
                                    {waifu ? (
                                        <>
                                            <img
                                                src={waifu.imageUrl}
                                                alt={waifu.name}
                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                                            <div className="absolute inset-x-0 bottom-0 p-4">
                                                <div className="text-white font-extrabold truncate">{waifu.name}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500">
                                            Empty slot
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {waifu ? (
                                <Link
                                    to={`/waifu/${waifu.id}`}
                                    className="h-11 w-full rounded-xl font-semibold text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                >
                                    Open waifu
                                </Link>
                            ) : (
                                <div className="h-11 w-full rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-500 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    No pick
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};
