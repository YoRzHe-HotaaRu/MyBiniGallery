import { Link } from 'react-router-dom';
import { Anime } from '@/types';
import { Card } from '@/components/ui';

export function AnimeCard({ anime }: { anime: Anime }) {
    return (
        <Link to={`/waifus?anime=${anime.id}`} className="group block">
            <Card className="overflow-hidden transition-shadow hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
                <div className="aspect-[2/3] relative overflow-hidden w-full">
                    <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-white font-extrabold leading-tight line-clamp-2">
                            {anime.title}
                        </div>
                        <div className="mt-1 text-white/80 text-xs line-clamp-2">
                            {anime.description}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
