import React, { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { Anime, Waifu } from '../types';
import { ArrowLeft, Heart, Search, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';
import { Card, EmptyState, Input, PageHeader, Skeleton } from '../components/ui';

export default function WaifuList() {
  const [searchParams] = useSearchParams();
  const animeIdFilter = searchParams.get('anime');
  const { user } = useAuthStore();
  const { isFavourite, toggleFavourite } = useFavouritesStore();

  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const shouldRotate = waifus.some((w) => (w.gallery?.length ?? 0) > 0);
    if (!shouldRotate) return;

    const id = window.setInterval(() => setTick((t) => t + 1), 8000);
    return () => window.clearInterval(id);
  }, [waifus]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Anime List for names
      const animeQ = query(collection(db, 'anime'));
      const animeSnapshot = await getDocs(animeQ);
      const animeList = animeSnapshot.docs.map((snap) => {
        const data = snap.data() as Partial<Omit<Anime, 'id'>>;
        return {
          id: snap.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled',
          description: typeof data.description === 'string' ? data.description : '',
          coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
        } satisfies Anime;
      });
      setAnimes(animeList);

      // Fetch Waifus
      const waifuQ = animeIdFilter
        ? query(collection(db, 'waifus'), where('animeId', '==', animeIdFilter))
        : query(collection(db, 'waifus'), orderBy('createdAt', 'desc'));

      const waifuSnapshot = await getDocs(waifuQ);
      const waifuList = waifuSnapshot.docs.map((snap) => {
        const data = snap.data() as Partial<Omit<Waifu, 'id'>>;
        return {
          id: snap.id,
          animeId: typeof data.animeId === 'string' ? data.animeId : '',
          name: typeof data.name === 'string' ? data.name : 'Unknown',
          age: typeof data.age === 'string' ? data.age : undefined,
          description: typeof data.description === 'string' ? data.description : '',
          imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
          gallery: Array.isArray(data.gallery) ? (data.gallery.filter((u) => typeof u === 'string') as string[]) : [],
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
        } satisfies Waifu;
      });
      waifuList.sort((a, b) => b.createdAt - a.createdAt);
      setWaifus(waifuList);
    } catch (err) {
      console.error('Error fetching data:', err);
      setWaifus([]);
    } finally {
      setLoading(false);
    }
  }, [animeIdFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAnimeName = (id: string) => {
    return animes.find(a => a.id === id)?.title || 'Unknown Series';
  };

  const filteredWaifus = waifus.filter((waifu) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const name = waifu.name?.toLowerCase() ?? '';
    const series = getAnimeName(waifu.animeId).toLowerCase();
    return name.includes(term) || series.includes(term);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-600" />
            {animeIdFilter ? `Waifus from ${getAnimeName(animeIdFilter)}` : 'Waifu Gallery'}
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredWaifus.map((waifu) => (
              <Link key={waifu.id} to={`/waifu/${waifu.id}`} className="group block">
                <Card className="overflow-hidden transition-shadow hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {(() => {
                      const images = [waifu.imageUrl, ...(waifu.gallery ?? [])].filter(Boolean);
                      const activeIndex = images.length > 0 ? tick % images.length : 0;
                      const activeSrc = images[activeIndex] ?? waifu.imageUrl;

                      return (
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
                      );
                    })()}

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
                        className={`h-5 w-5 ${
                          isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-white font-extrabold leading-tight truncate">
                        {waifu.name}
                      </div>
                      <div className="text-white/80 text-xs truncate">
                        {getAnimeName(waifu.animeId)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredWaifus.length === 0 ? (
            <EmptyState
              title={searchTerm.trim() ? 'No waifus match your search' : 'No waifus in this collection yet'}
              description="Try clearing your search or browse a different anime."
              action={
                <Link
                  to="/anime"
                  className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  Browse anime
                </Link>
              }
            />
          ) : null}
        </>
      )}
    </div>
  );
}
