import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { Anime, Waifu } from '../types';
import { Loader, ArrowLeft, Search, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';

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
    fetchData();
  }, [animeIdFilter]);

  useEffect(() => {
    const shouldRotate = waifus.some((w) => (w.gallery?.length ?? 0) > 0);
    if (!shouldRotate) return;

    const id = window.setInterval(() => setTick((t) => t + 1), 8000);
    return () => window.clearInterval(id);
  }, [waifus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Anime List for names
      const animeQ = query(collection(db, 'anime'));
      const animeSnapshot = await getDocs(animeQ);
      const animeList = animeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setAnimes(animeList);

      // Fetch Waifus
      const waifuQ = animeIdFilter
        ? query(collection(db, 'waifus'), where('animeId', '==', animeIdFilter))
        : query(collection(db, 'waifus'), orderBy('createdAt', 'desc'));

      const waifuSnapshot = await getDocs(waifuQ);
      const waifuList = waifuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as Waifu[];
      waifuList.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setWaifus(waifuList);
    } catch (err) {
      console.error('Error fetching data:', err);
      setWaifus([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-pink-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {animeIdFilter 
            ? `Waifus from ${getAnimeName(animeIdFilter)}`
            : 'Waifu Gallery'
          }
        </h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search waifu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {animeIdFilter && (
            <Link 
              to="/anime" 
              className="flex items-center text-pink-600 hover:text-pink-700 whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Anime
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredWaifus.map((waifu) => (
          <Link
            key={waifu.id}
            to={`/waifu/${waifu.id}`}
            className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
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
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!user) return;
                  toggleFavourite(user.uid, waifu.id);
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                aria-label="Toggle favourite"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-500'
                  }`}
                />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                {waifu.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {getAnimeName(waifu.animeId)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredWaifus.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {searchTerm.trim()
              ? 'No waifus match your search.'
              : 'No waifus found in this collection.'}
          </p>
          <Link to="/" className="text-pink-600 hover:underline mt-2 inline-block">
            Go back home
          </Link>
        </div>
      )}
    </div>
  );
}
