import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { Input, PageHeader } from '@/components/ui';

interface WaifuListHeaderProps {
    animeIdFilter: string | null;
    animeName: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const WaifuListHeader: React.FC<WaifuListHeaderProps> = ({
    animeIdFilter,
    animeName,
    searchTerm,
    setSearchTerm,
}) => {
    return (
        <PageHeader
            title={
                <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-pink-600" />
                    {animeIdFilter ? `Waifus from ${animeName}` : 'Waifu Gallery'}
                </span>
            }
            subtitle={
                animeIdFilter
                    ? 'Browse the collection for this series, then open a waifu for likes and comments.'
                    : 'Browse the full collection. Use search to find your favourites fast.'
            }
            actions={
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-96">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search waifu or series…"
                            left={<Search className="h-4 w-4" />}
                        />
                    </div>
                    {animeIdFilter ? (
                        <Link
                            to="/anime"
                            className="inline-flex items-center gap-2 h-11 px-4 rounded-xl font-semibold text-gray-800 hover:bg-white/70 transition border border-white/60 bg-white/60 backdrop-blur shadow-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Anime
                        </Link>
                    ) : null}
                </div>
            }
        />
    );
};
