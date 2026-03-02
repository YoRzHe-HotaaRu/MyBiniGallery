// @/src/pages/Favourites.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Waifu } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { Card, EmptyState, PageHeader, Skeleton } from '@/components/ui';
import { FavouriteWaifuCard } from '@/components/favourites/FavouriteWaifuCard';

export default function Favourites() {
  const { user } = useAuthStore();
  const { ids, loading: loadingIds, toggleFavourite, isFavourite } = useFavouritesStore();
  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [loadingWaifus, setLoadingWaifus] = useState(true);

  const favouriteIds = useMemo(() => Object.keys(ids), [ids]);

  useEffect(() => {
    const fetchWaifus = async () => {
      setLoadingWaifus(true);
      try {
        const docs = await Promise.all(
          favouriteIds.map(async (id) => {
            const snap = await getDoc(doc(db, 'waifus', id));
            if (!snap.exists()) return null;
            return { id: snap.id, ...(snap.data() as Omit<Waifu, 'id'>) };
          })
        );
        setWaifus(docs.filter(Boolean) as Waifu[]);
      } catch (err) {
        console.error('Error fetching favourite waifus:', err);
        setWaifus([]);
      } finally {
        setLoadingWaifus(false);
      }
    };

    fetchWaifus();
  }, [favouriteIds]);

  const loading = loadingIds || loadingWaifus;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Favourites"
        subtitle="Your saved waifus, ready to revisit anytime."
        actions={
          <Link
            to="/waifus"
            className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Browse waifus
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : waifus.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          description="Tap the heart on a waifu to save them here."
          action={
            <Link
              to="/waifus"
              className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Go to gallery
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {waifus.map((waifu) => (
            <FavouriteWaifuCard
              key={waifu.id}
              waifu={waifu}
              isFavourite={isFavourite}
              toggleFavourite={toggleFavourite}
              uid={user?.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
