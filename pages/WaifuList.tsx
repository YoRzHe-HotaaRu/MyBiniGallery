// @/src/pages/WaifuList.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '@/config/firebase';
import { Anime, Waifu } from '@/types';
import { EmptyState } from '@/components/ui';
import { WaifuCard } from '@/components/waifus/WaifuCard';
import { WaifuGridSkeleton } from '@/components/waifus/WaifuGridSkeleton';
import { WaifuListHeader } from '@/components/waifus/WaifuListHeader';

export default function WaifuList() {
  const [searchParams] = useSearchParams();
  const animeIdFilter = searchParams.get('anime');

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
      <WaifuListHeader
        animeIdFilter={animeIdFilter}
        animeName={animeIdFilter ? getAnimeName(animeIdFilter) : ''}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {loading ? (
        <WaifuGridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredWaifus.map((waifu) => (
              <WaifuCard
                key={waifu.id}
                waifu={waifu}
                animeName={getAnimeName(waifu.animeId)}
                tick={tick}
              />
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
