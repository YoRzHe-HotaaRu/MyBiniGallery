import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Select, Skeleton } from '@/components/ui';
import { Waifu } from '@/types';

interface UserShowcaseSettingsProps {
    waifusLoading: boolean;
    savingShowcase: boolean;
    isShowcaseDirty: boolean;
    onSaveShowcase: () => void;
    favouriteWaifus: Waifu[];
    showcaseSlots: string[];
    setShowcaseSlots: (slots: string[]) => void;
}

export const UserShowcaseSettings: React.FC<UserShowcaseSettingsProps> = ({
    waifusLoading,
    savingShowcase,
    isShowcaseDirty,
    onSaveShowcase,
    favouriteWaifus,
    showcaseSlots,
    setShowcaseSlots,
}) => {
    return (
        <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-lg font-extrabold text-gray-900">Top 3 showcase</div>
                    <div className="mt-1 text-sm text-gray-600">Pick up to 3 favourites to pin on your profile.</div>
                </div>
                <Button
                    type="button"
                    className="h-10"
                    disabled={savingShowcase || !isShowcaseDirty}
                    onClick={onSaveShowcase}
                >
                    Save showcase
                </Button>
            </div>

            {waifusLoading ? (
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
            ) : favouriteWaifus.length === 0 ? (
                <EmptyState
                    className="mt-6"
                    title="No favourites to showcase yet"
                    description="Favourite a few waifus first, then come back and pin your top 3 here."
                    action={
                        <Link
                            to="/waifus"
                            className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                            Browse waifus
                        </Link>
                    }
                />
            ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {showcaseSlots.map((slotId, idx) => {
                        const waifu = favouriteWaifus.find((w) => w.id === slotId) ?? null;
                        const otherSelected = new Set(showcaseSlots.filter(Boolean));
                        if (slotId) otherSelected.delete(slotId);
                        const options = favouriteWaifus.filter((w) => !otherSelected.has(w.id));

                        return (
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
                                                Pick a waifu
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Select
                                    value={slotId}
                                    onChange={(e) => {
                                        const next = [...showcaseSlots];
                                        next[idx] = e.target.value;
                                        setShowcaseSlots(next);
                                    }}
                                    disabled={savingShowcase}
                                >
                                    <option value="">None</option>
                                    {options.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};
