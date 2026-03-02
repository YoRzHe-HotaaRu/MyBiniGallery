import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { Anime } from '@/types';
import { Card } from '@/components/ui';
import { useLanguage } from '@/contexts/LanguageContext';

export function AnimeBrowseSection({ animes, loading }: { animes: Anime[]; loading: boolean }) {
    const { t } = useLanguage();

    return (
        <section>
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-sm shadow-pink-600/30">
                        <Film className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{t.animeBrowse.title}</h2>
                        <p className="text-sm text-gray-500">{t.animeBrowse.subtitle}</p>
                    </div>
                </div>
                <Link to="/anime" className="text-pink-600 hover:text-pink-700 font-medium">
                    {t.animeBrowse.viewAll}
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="aspect-[16/9] bg-gray-100" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-2/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animes.slice(0, 6).map((anime) => (
                        <Link key={anime.id} to={`/waifus?anime=${anime.id}`} className="group block">
                            <Card className="overflow-hidden">
                                <div className="aspect-[16/9] relative">
                                    {anime.coverImage ? (
                                        <img
                                            src={anime.coverImage}
                                            alt={anime.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-100" />
                                    )}
                                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                                    <div className="absolute inset-x-0 bottom-0 p-4">
                                        <div className="text-white font-extrabold text-lg leading-tight truncate">
                                            {anime.title}
                                        </div>
                                        <div className="mt-1 inline-flex items-center gap-2 text-white/85 text-sm font-semibold">
                                            {t.animeBrowse.viewWaifus}
                                            <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}

                    {animes.length === 0 ? (
                        <Card className="col-span-full p-8 text-center">
                            <div className="text-lg font-extrabold text-gray-900">{t.animeBrowse.noAnimeTitle}</div>
                            <div className="mt-2 text-sm text-gray-600">
                                {t.animeBrowse.noAnimeDesc}
                            </div>
                        </Card>
                    ) : null}
                </div>
            )}
        </section>
    );
}
