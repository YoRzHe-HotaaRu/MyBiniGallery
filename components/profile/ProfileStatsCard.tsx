import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { Waifu } from '@/types';

interface ProfileStatsCardProps {
    statsLoading: boolean;
    likesGiven: number;
    commentsGiven: number;
    topCommentedWaifuId: string | null;
    topCommentedWaifu: Waifu | null;
    topCommentedCount: number;
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
    statsLoading,
    likesGiven,
    commentsGiven,
    topCommentedWaifuId,
    topCommentedWaifu,
    topCommentedCount,
}) => {
    return (
        <Card className="p-6">
            <div className="text-lg font-extrabold text-gray-900">Stats</div>
            <div className="mt-4 space-y-3">
                {statsLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <ThumbsUp className="h-4 w-4 text-pink-600" />
                                Likes given
                            </div>
                            <div className="text-sm font-extrabold text-gray-900 tabular-nums">{likesGiven}</div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <MessageSquare className="h-4 w-4 text-pink-600" />
                                Comments posted
                            </div>
                            <div className="text-sm font-extrabold text-gray-900 tabular-nums">{commentsGiven}</div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <div className="text-sm font-semibold text-gray-700">Most commented waifu</div>
                            {topCommentedWaifuId && topCommentedWaifu ? (
                                <Link
                                    to={`/waifu/${topCommentedWaifuId}`}
                                    className="mt-2 inline-flex items-center justify-between gap-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-extrabold text-gray-900 truncate">{topCommentedWaifu.name}</div>
                                        <div className="text-xs text-gray-600">{topCommentedCount} comments</div>
                                    </div>
                                    <div className="text-sm font-extrabold text-pink-700">Open</div>
                                </Link>
                            ) : (
                                <div className="mt-2 text-sm text-gray-600">No comment history yet.</div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};
